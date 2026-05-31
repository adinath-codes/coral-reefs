from models.SourceModels import coralGeneratePayload,AICustomSourcePayload,CORAL_SYSTEM_PROMPT
import os
import asyncio
import yaml
from google import genai
from google.genai import types
from dotenv import load_dotenv
load_dotenv()

async def createYaml(payload: coralGeneratePayload):
    scheme = {
        "name": payload.src_name,
        "version": "1.0.0",
        "dsl_version": 3,
        "backend": "http",
        "inputs": {
            "API_KEY": {
                "kind": "secret"
            }
        },
        "base_url": payload.base_url,
        "auth": {
            "type": "HeaderAuth",
            "headers": [
                {
                    "name": "Authorization",
                    "from": "template",
                    "template": "Bearer {{input.API_KEY}}"
                }
            ]
        },
        "tables": []
    }
    
    for table in payload.tables:        
        table_config = {
            "name": table.name,
            "description": table.desc,
            "request": {
                "method": table.method,
                "path": table.endpoint
            },
"columns": [{"name": c.name, "type": c.type} for c in table.columns]        }
        
        if table.query_params:
            table_config["request"]["query"] = [
                {"name": q.name, "from": "template", "template": q.exact} 
                for q in table.query_params
            ]
            
        if table.pagination:
            table_config["pagination"] = {
                "cursor_param": table.pagination.cursor_param
            }
            
        if table.rows_path:
            table_config["response"] = {
                "rows_path": table.rows_path
            }

        scheme["tables"].append(table_config)
        
    scheme["test_queries"] = payload.test_queries
    
    output_dir = f"sources/{payload.src_name}"
    os.makedirs(output_dir, exist_ok=True)
    
    f_path = f"{output_dir}/manifest.yaml"
    with open(f_path, "w") as f:
        yaml.safe_dump(scheme, f, sort_keys=False)

async def executeYaml(src_name:str,auth_token:str):
    seperateEnv = os.environ.copy()
    seperateEnv["API_KEY"] = auth_token
    
    manifest_path = os.path.abspath(f"./sources/{src_name}/manifest.yaml")
    process0=await asyncio.create_subprocess_shell(f"coral source lint {manifest_path}",env=seperateEnv,stdout=asyncio.subprocess.PIPE,stderr=asyncio.subprocess.PIPE)
    stdout,stderr = await process0.communicate()
    
    if process0.returncode ==0:
        print(f"[SUCCESS]:{stdout.decode()}")
    else:
        print(f"[ERROR]:{stderr.decode()}")
        return {"status":"failed"}

    process = await asyncio.create_subprocess_shell(f"coral source add --file {manifest_path}",env=seperateEnv,stdout=asyncio.subprocess.PIPE,stderr=asyncio.subprocess.PIPE)
    stdout,stderr = await process.communicate()
    if process.returncode ==0:
        print(f"[SUCCESS]:{stdout.decode()}")
    else:
        print(f"[ERROR]:{stderr.decode()}")

client = genai.Client()
async def createAIYaml(payload:AICustomSourcePayload):
    full_prompt = f"""
    Base URL: {payload.base_url}
    Base ID/Endpoint segment: {payload.base_id}
    User Request: {payload.user_prompt}
    """
    try:
        res= client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt,
            config=types.GenerateContentConfig(
                system_instruction=CORAL_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=coralGeneratePayload
            )
        )
        parsed = res.parsed
        print(parsed)
        if not isinstance(parsed,coralGeneratePayload):
            return {"status":"error","message":"Ai failed to generate data in correct format"}
        await createYaml(parsed)
        return{
            "status":"success",
            "ai_response":parsed.model_dump()
        }
    except Exception as e:
        return {"status":"error","message":str(e)}