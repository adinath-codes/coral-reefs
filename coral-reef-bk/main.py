from fastapi import FastAPI,BackgroundTasks,Request,HTTPException
from CustomSrc import createYaml,executeYaml,createAIYaml
from models.SourceModels import coralGeneratePayload,coralExecutePayload,AICustomSourcePayload
from models.WorkflowModel import WFPayload
from models.WorkflowModel import WFNode, WFEdge, WFPayload
from Workflow import ExecuteWF
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)
dummy_payload = WFPayload(
        agent_name="AI-SRE-Debugger",
        nodes=[
            WFNode(id="node_1", type="webhook_trigger", name="GitHub Alert", config={}),            
            WFNode(id="node_2", type="vector_search", name="Search Runbooks", config={
                "query": "{{node_1.error_message}}" 
            }),
            
            WFNode(id="node_3", type="llm_reasoner", name="Diagnose Issue", config={
                "prompt": "Error reported: {{node_1.error_message}}\n\nFound Documentation:\n{{node_2.context}}\n\nBased on the docs, write a 2-sentence diagnosis and fix."
            }),
            
            WFNode(id="node_4", type="action_http", name="Slack Alert", config={
                "method": "POST",
                "url": "https://hooks.slack.com/services/data", 
                "body": { 
                    "text": "🚨 *AI Diagnosis:*\n{{node_3.summary}}"
                }
            })
        ],
        edges=[
            WFEdge(src="node_1", target="node_2"),
            WFEdge(src="node_2", target="node_3"),
            WFEdge(src="node_3", target="node_4"),
        ]
    )
AGENT_DB={
"escalation-router-v1": dummy_payload
}

## CUSTOM SRC
@app.post("/generate-customsrc-yaml")
async def generateCustomsrcYaml(payload:coralGeneratePayload):
    await createYaml(payload)
    return {"status":"success"}

@app.post("/execute-customsrc-yaml")
async def executeCustomsrcYaml(payload:coralExecutePayload):
    await executeYaml(payload.src_name,payload.auth_token)
    return {"status":"success"}

@app.post("/generate-customsrc-yaml-ai")
async def generateCustomsrcYamlAI(payload:AICustomSourcePayload):
    status = await createAIYaml(payload) 
    return status

## WORKFLOW
@app.post("/webhook/{agentID}")
async def triggerWebhook(agentID:str,request:Request,bgTask:BackgroundTasks):
    try:
        triggerData=await request.json()
    except Exception:
        triggerData={}
    print(f"\n[WEBHOOK RECEIVED] Triggering Agent: {agentID}")
    print(f"[PAYLOAD] {triggerData}")
    agentBluePrint: WFPayload | None = AGENT_DB.get(agentID)
    if not agentBluePrint:
        raise HTTPException(status_code=404, detail=f"Agent blueprint '{agentID}' not found.")
    bgTask.add_task(ExecuteWF,agentBluePrint,triggerData)
    return {
        "status": "success",
        "message": "Workflow queued successfully in the background.",
        "agent_id": agentID
    }

@app.post("/deploy-workflow")
async def deployWorkflow(payload: WFPayload):
    AGENT_DB[payload.agent_name] = payload
    print(f"[DEPLOY] Agent '{payload.agent_name}' updated in AGENT_DB.")
    return {"status": "success", "message": f"Agent '{payload.agent_name}' deployed successfully."}
from pydantic import BaseModel
# Make sure you import WFPayload from your workflow models!
# from models.WorkflowModel import WFPayload 

class AIWorkflowRequest(BaseModel):
    prompt: str
    agent_name: str = "AI-Generated-Agent"
import json

WORKFLOW_SYSTEM_PROMPT = """
You are an AI architect designing automated workflows. 
Based on the user's prompt, generate a complete JSON workflow.
You have access to exactly these node types: 
["webhook_trigger", "coral_sql", "llm_reasoner", "if_condition", "action_http", "vector_search", "iterator"]

Rules:
1. Every workflow should logically start with a 'webhook_trigger'.
2. Wire the 'edges' sequentially (e.g., node_1 to node_2).
3. Use dot-notation mustache syntax for variables (e.g., {{node_1.payload.id}}).
4. Fill out the 'config' dictionary for each node appropriately based on its type.

CRITICAL: Return ONLY a valid JSON object matching this structure:
{
  "agent_name": "string",
  "nodes": [{"id": "string", "type": "string", "name": "string", "config": {}}],
  "edges": [{"src": "string", "target": "string", "branch": null}]
}
"""

@app.post("/generate-workflow-ai")
async def generate_workflow_ai(payload: AIWorkflowRequest):
    try:
        client = genai.Client()
        res = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=payload.prompt,
            config=types.GenerateContentConfig(
                system_instruction=WORKFLOW_SYSTEM_PROMPT,
                response_mime_type="application/json" 
                # Removed response_schema to prevent the additionalProperties error!
            )
        )
        
        # 1. Manually parse the JSON string returned by Gemini
        raw_json = json.loads(res.text)
        
        # 2. Validate it using your Pydantic model
        parsed_workflow = WFPayload(**raw_json)
            
        return {
            "status": "success",
            "workflow": parsed_workflow.model_dump()
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
