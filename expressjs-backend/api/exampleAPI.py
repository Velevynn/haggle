from fastapi import APIRouter, Depends
from pydantic import BaseModel
from src.api import auth
import sqlalchemy
from src import database as db

router = APIRouter(
  prefix="/users",
  tags=["users"],
  dependencies=[Depends(auth.get_api_key)]
)

# structure to match the individual item being called

class User(BaseModel):
  username: String
  email: String
  password: String

# example POST Call
@router.post("/CALLEDENDPOINT")
def function()
  with db.engine.begin() as connection:
    # result is CursorRow of objects, has to be accessed and parsed
    result = connection.execute(sqlalchemy.text(
                                            """
                                                SELECT username, email, password
                                                FROM users
                                            """
    # userTable is effectively a list of dictionaries, with each dictionary being an item with a key and value
    userTable = result.fetchall()                                              
