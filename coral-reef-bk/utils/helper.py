import re
from typing import Dict,Any
import json

def resolve_template_value(path_str: str, state: dict):
    parts = path_str.split('.')
    node_id = parts[0]
    
    if node_id not in state:
        return None
        
    current_value = state.get(node_id)
    
    for key in parts[1:]:
        if isinstance(current_value, str):
            try:
                current_value = json.loads(current_value)
            except json.JSONDecodeError:
                return None
                
        if isinstance(current_value, dict) and key in current_value:
            current_value = current_value[key]
        elif isinstance(current_value, list):
            try:
                idx = int(key)
                current_value = current_value[idx]
            except (ValueError, IndexError):
                return None
        else:
            return None
            
    return current_value

def Parser(text:str,state:Dict)->str:
    if not isinstance(text,str):
        return text
    pattern=r"\{\{(.*?)\}\}"
    matches = re.findall(pattern,text)
    if len(matches)==1 and text.strip() ==f"{{{{{matches[0]}}}}}":
        resolved = resolve_template_value(matches[0].strip(),state)
        if isinstance(resolved,(dict,list)):
            return json.dumps(resolved)
        return str(resolved) if resolved is not None else ""
    for match in matches:
        resolved = resolve_template_value(match.strip(),state)
        replace_val = "" if resolved is None else (json.dumps(resolved)) if isinstance(resolved,(dict,list)) else str(resolved)
        text = text.replace(f"{{{{{match}}}}}", replace_val)
    return text