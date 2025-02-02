import pytest
from fastapi.testclient import TestClient
from pymongo import MongoClient
from main import app
import os
import certifi


client = TestClient(app)


@pytest.fixture(scope="module")
def mongo_client():
    mongo_uri = os.getenv("MONGO_URI")
    client = MongoClient(mongo_uri, tlsCAFile=certifi.where())
    yield client
    client.close()

@pytest.fixture(scope="module")
def test_db(mongo_client):
    """Fetch actual MongoDB data (read-only) for validation."""
    db = mongo_client["FailedDocs"]
    collection = db["Docs"]
    return collection

def test_get_validation_status(test_db):
    """Test if FastAPI returns the correct data from MongoDB."""
    response = client.get("/api/validation-status")
    assert response.status_code == 200

    data = response.json()
    assert "validation_status" in data

    # Get actual DB data for comparison
    db_data = list(test_db.find({}, {"_id": 1, "error_type": 1, "error_details": 1}))
    expected_data = [{"_id": str(doc["_id"]), "error_type": doc["error_type"], "error_details": doc["error_details"]} for doc in db_data]
    assert data["validation_status"] == expected_data, "API response does not match MongoDB records"
