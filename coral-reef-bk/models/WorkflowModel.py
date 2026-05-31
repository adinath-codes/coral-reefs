from pydantic import BaseModel,Field
from typing import List ,Dict,Any , Literal,Optional

NodeType = Literal["webhook_trigger","coral_sql","llm_reasoner","if_condition","action_http","vector_search","iterator"]

class WFNode(BaseModel):
    id:str=Field(...)
    type:NodeType
    name:str=Field(...)
    config:Dict[str,Any]=Field(default_factory=dict)

class WFEdge(BaseModel):
    src: str=Field(...)
    target:str=Field(...)
    branch:Optional[str] = None

class WFPayload(BaseModel):
    agent_name:str
    nodes:List[WFNode]
    edges:List[WFEdge]