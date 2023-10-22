from fastapi import FastAPI
from pydantic import BaseModel
from source import RS
from typing import Dict, Any, List


app = FastAPI()


class User(BaseModel):
    id: int
    username: str
    about: str


@app.post("/similarity/text/")
async def find_text_similarity(payload: Dict[Any, Any]):
    recommended_users = RS.find_similar_by_user(
        current_user=payload.get("current_user")[0],
        users_list=payload.get("users_list")
    )
    return {"recommended_users": recommended_users}
