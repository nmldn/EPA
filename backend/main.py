from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
import os
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import certifi


def decrypt_env():

    with open("key.key", "rb") as key_file:
        key = key_file.read()
    fernet = Fernet(key)
    with open(".env.enc", "rb") as enc_file:
        encrypted_data = enc_file.read()
    decrypted_data = fernet.decrypt(encrypted_data)
    with open(".env", "wb") as temp_env_file:
        temp_env_file.write(decrypted_data)

decrypt_env()


load_dotenv()
mongo_uri = os.getenv("MONGO_URI")


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


client = MongoClient(
    mongo_uri,
    tlsCAFile=certifi.where()
)

db = client["FailedDocs"]  
collection = db["Docs"] 

@app.get("/api/validation-status")
async def get_validation_status():
    try:
        result = collection.find({})
        data = [{"_id": str(doc["_id"]), "error_type": doc["error_type"], "error_details": doc["error_details"]} for doc in result]
        return {"validation_status": data}
    except Exception as e:
        print(f"Database query failed: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
