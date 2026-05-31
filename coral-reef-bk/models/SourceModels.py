from pydantic import BaseModel,Field
from typing import List,Optional,Literal    

class QueryParamsType(BaseModel):
    name:str= Field(..., min_length=1)
    exact:str= Field(..., min_length=1)

class PaginationType(BaseModel):
    cursor_param:str= Field(..., min_length=1)
    cursor_path:Optional[List[str]]=None

class HeaderType(BaseModel):
    name:str= Field(..., min_length=1)
    type:Literal["https" , "jsonl" , "csv"] 
    base_url:str= Field(..., min_length=1)
    kind:str= Field(..., min_length=1)

class ColumnsType(BaseModel):
    name:str= Field(..., min_length=1)
    type:Literal["Utf8", "Int64", "Boolean", "Float64", "Timestamp", "Json"]
class TableType(BaseModel):
    name:str= Field(..., pattern=r"^[a-zA-Z0-9_]+$")
    desc:str= Field(..., min_length=1)
    method:Literal["GET","POST"]
    endpoint:str= Field(..., min_length=1)
    columns:List[ColumnsType]
    rows_path: Optional[List[str]]=None
    header:Optional[List[HeaderType]]= Field(default_factory=list)
    body:Optional[str]=None
    pagination:Optional[PaginationType]=None
    query_params:Optional[List[QueryParamsType]]=None

class coralGeneratePayload(BaseModel):
    src_name:str = Field(...,pattern=r"^[a-z0-9_]+$")
    base_url:str= Field(..., min_length=1)
    tables:List[TableType]
    test_queries:List[str]

class coralExecutePayload(BaseModel):
    src_name:str= Field(..., pattern=r"^[a-z0-9_]+$")
    auth_token:str= Field(..., min_length=1)

class AICustomSourcePayload(BaseModel):
    user_prompt:str= Field(..., min_length=5)
    base_url:str= Field(..., min_length=1)
    base_id:str= Field(..., min_length=1)

CORAL_SYSTEM_PROMPT = """
You are an expert integration engineer building YAML configurations for the Coral CLI.

CRITICAL NESTED DATA RULE:
The Coral DSL v3 strictly forbids mapping nested JSON paths in column definitions, and you cannot step through arrays using `rows_path`. 
If an API nests its actual row data inside a sub-object (e.g., Airtable nesting data inside a 'fields' object), you MUST handle it by dumping the entire sub-object as a single JSON column.

Example for Airtable:
If the API returns {"records": [{"id": "1", "fields": {"Name": "Alice", "Role": "Engineer"}}]}
1. Your `rows_path` MUST be ["records"]. Do NOT add "fields" to the rows_path.
2. Your columns MUST only contain the root keys. Do not map "Name" or "Role". Instead, map a single column: {"name": "fields", "type": "Json"}.
"""