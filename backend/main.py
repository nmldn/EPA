from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import ssl
import certifi

# Load environment variables
load_dotenv()
mongo_uri = os.getenv("MONGO_URI")

# Initialize FastAPI app
app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use the connection string from the .env file
client = MongoClient(
    mongo_uri,
    tlsCAFile=certifi.where()
)

db = client["FailedDocs"]  # Corrected to use the string "FailedDocs"
collection = db["Docs"]  # Access the Docs collection within the FailedDocs database

@app.get("/api/validation-status")
async def get_validation_status():
    result = collection.find({})
    data = [{"_id": str(doc["_id"]), "error_type": doc["error_type"], "error_details": doc["error_details"]} for doc in result]
    return {"validation_status": data}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
