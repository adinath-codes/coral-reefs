import asyncio
from utils.helper import Parser
from models.WorkflowModel import WFPayload
from google import genai
from dotenv import load_dotenv
import httpx
import json
from sentence_transformers import SentenceTransformer
import chromadb
load_dotenv()
client= genai.Client()
embedder = SentenceTransformer('all-MiniLM-L6-v2')
chroma_client = chromadb.Client() 
knowledge_collection = chroma_client.get_or_create_collection(name="coral-reef")
#NODES 
async def executeCoralNode(config:dict,state:dict):
    raw_query = config.get("query","")
    final = Parser(raw_query,state)
    print(f"[RESULT OF CORAL NODE]: {final}")
    try:
        process = await asyncio.create_subprocess_exec(
            "coral","sql",final,"--format","json",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        raw_op = stdout.decode().strip()
        
        try:
            data = json.loads(raw_op)
            row_count = len(data) if isinstance(data, list) else 1
            print(f"[RESULT OF CORAL NODE]: Successfully fetched {row_count} rows.")
            return {"status": "success", "rows": data}
        except json.JSONDecodeError:
            err_msg = stderr.decode().strip()
            return {"status": "failed", "error": err_msg}
            
    except Exception as e:
        return {"status": "failed", "error": str(e)}

async def executeLlmNode(config:dict,state:dict):
    raw_prompt = config.get("prompt","")
    final = Parser(raw_prompt,state)
    print(F"[RESULT OF LLM NODE]:{final}")
    try:
        res = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=final
        )
        print(f"[RESULT OF LLM NODE]: Successfully generated summary.")
        return {"status":"success","summary":res.text}
    except Exception as e:
        print(f"[ERROR IN LLM NODE]: {str(e)}")
        return {"status": "error", "summary": f"AI generation failed: {str(e)}"}

async def executeAPIAction(config:dict,state:dict):
    url = config.get("url","")
    body = Parser(config.get("body",""),state)
    method = config.get("method","POST").upper()

    final_url = Parser(url,state)
    def deepParse(data):
        if isinstance(data, str):
            return Parser(data, state)
        elif isinstance(data, dict):
            return {k: deepParse(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [deepParse(i) for i in data]
        return data
    final_body = deepParse(body)

    try:
        async with httpx.AsyncClient() as http_client:
            if method=="POST":
                res = await http_client.post(final_url, json=final_body)            
            elif method=="GET":
                res=await http_client.get(final_url)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
        return {
            "status_code": res.status_code, 
            "response": res.text
        }
    except Exception as e:
        print(f"[ERROR IN HTTP ACTION]: {str(e)}")
        return {"status": "failed", "error": str(e)}

async def executeIF(config: dict, state: dict):
    left_raw = config.get("left", "")
    op = config.get("op", "==")
    right_raw = config.get("right", "")

    left_val = Parser(left_raw, state) if isinstance(left_raw, str) else left_raw
    right_val = Parser(right_raw, state) if isinstance(right_raw, str) else right_raw
    
    flag = False
    
    if op == "==": 
        flag = (str(left_val) == str(right_val))
    elif op == "!=": 
        flag = (str(left_val) != str(right_val))
    elif op == "contains": 
        flag = str(right_val).lower() in str(left_val).lower()
        
    elif op in [">", "<", ">=", "<="]:
        try:
            l_num = float(left_val)
            r_num = float(right_val)
            
            if op == ">": flag = (l_num > r_num)
            elif op == "<": flag = (l_num < r_num)
            elif op == ">=": flag = (l_num >= r_num)
            elif op == "<=": flag = (l_num <= r_num)
        except (ValueError, TypeError):
            print(f"[WARNING IN IF NODE]: Cannot mathematically compare '{left_val}' and '{right_val}'")
            flag = False

    res = str(flag)
    print(f"[RESULT OF IF NODE]: Evaluated '{left_val} {op} {right_val}' -> {res}")
    return {"result": res}

async def executeRagNode(config: dict, state: dict):
    query = config.get("query", "")
    final = Parser(query, state)
    print(f"\n[RUNNING RAG NODE]: Embedding query -> {final[:50]}...")
    
    try:
        vector = embedder.encode(final).tolist()        
        dbRes = knowledge_collection.query(
            query_embeddings=[vector],
            n_results=2 
        )
        if not dbRes:
            return {"status": "error", "context": "No db.", "raw_docs": []}
        docs=dbRes.get('documents')
        if not docs or len(docs) == 0 or not docs[0]:
            return {"status": "success", "context": "No relevant documentation found"}
        retrieved_docs = docs[0]
        context_string = "\n---\n".join(retrieved_docs)
        
        return {
            "status": "success", 
            "context": context_string, 
            "raw_docs": retrieved_docs
        }
        
    except Exception as e:
        print(f"[ERROR IN RAG NODE]: {str(e)}")
        return {"status": "failed", "error": str(e)}

async def executeIteratorNode(config: dict, state: dict):
    arrayRaw = config.get("array_path", "")
    array = Parser(arrayRaw, state)
    
    try:
        items = json.loads(array)
        if not isinstance(items, list):
            items = [items]
    except (json.JSONDecodeError, TypeError):
        items = []

    action_type = config.get("action_type")
    action_config = config.get("action_config", {})
    
    print(f"\n[RUNNING ITERATOR NODE]: Spinning up {len(items)} concurrent tasks for {action_type}...")

    async def processItem(item):
        temp_state = state.copy()
        temp_state["_current_item"] = item 
        
        if action_type == "action_http":
            return await executeAPIAction(action_config, temp_state)
        elif action_type == "llm_reasoner":
            return await executeLlmNode(action_config, temp_state)
        else:
            return {"error": "Unsupported iterator action type"}

    tasks = [processItem(item) for item in items]
    results = await asyncio.gather(*tasks)

    return {
        "status": "success", 
        "total_processed": len(items),
        "results": results 
    }

# EXECUTE THE NODES

async def ExecuteWF(payload:WFPayload,triggerData:dict):
    print("\n[STARTING AGENT]",payload.agent_name)
    state={
        "trigger":triggerData
    }
    node_map ={node.id:node for node in payload.nodes}
    inScope = {node.id: 0 for node in payload.nodes}
    for edge in payload.edges:
        inScope[edge.target] += 1
    que = [node_id for node_id, count in inScope.items() if count == 0]
    head = next((n for n in payload.nodes if n.type == "webhook_trigger"), None)
    if head:
        state[head.id] = state["trigger"]
    completedNodes = set()

    while que:
        currID = que.pop(0)
        node = node_map[currID]
        print(f"[RUNNING]: {node.name} ({node.type})")

        match(node.type): 
            case 'coral_sql':
                res = await executeCoralNode(node.config,state)
                state[node.id] = res
            case 'llm_reasoner':
                res = await executeLlmNode(node.config,state)
                state[node.id] = res
            case 'action_http':
                res = await executeAPIAction(node.config,state)
                state[node.id] = res
            case 'if_condition':
                res = await executeIF(node.config,state)
                state[node.id] = res
            case 'vector_search':
                res = await executeRagNode(node.config, state)
                state[node.id] = res
            case 'iterator':
                res = await executeIteratorNode(node.config, state)
                state[node.id] = res
            case 'webhook_trigger':
                pass
        completedNodes.add(currID)

        for edge in payload.edges:
            if edge.src == currID:
                if node.type == 'if_condition':
                    if_result = state[node.id].get("result") 
                    if edge.branch != if_result:
                        continue
                childID = edge.target
                inScope[childID]-=1
                if inScope[childID] == 0 and childID not in completedNodes:
                    que.append(childID)
                       
        
    print("*"*50)
    print("WORFLOW COMPLETED SUCCESSFULLY")
    print("*"*50)
    return state
