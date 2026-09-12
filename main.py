from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .prediction import predict_fraud


app = FastAPI(
    title="Bank Fraud Detection API",
    description="API for detecting fraudulent bank transactions",
    version="1.0.0"
)


# ==========================================
# CORS CONFIGURATION
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# TRANSACTION MODEL
# ==========================================

class Transaction(BaseModel):

    Time: float = Field(
        ...,
        ge=0,
        description="Transaction time"
    )

    V1: float
    V2: float
    V3: float
    V4: float
    V5: float
    V6: float
    V7: float
    V8: float
    V9: float
    V10: float
    V11: float
    V12: float
    V13: float
    V14: float
    V15: float
    V16: float
    V17: float
    V18: float
    V19: float
    V20: float
    V21: float
    V22: float
    V23: float
    V24: float
    V25: float
    V26: float
    V27: float
    V28: float

    Amount: float = Field(
        ...,
        ge=0,
        description="Transaction amount"
    )


# ==========================================
# HOME ROUTE
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Bank Fraud Detection API is running"
    }


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy"
    }


# ==========================================
# FRAUD PREDICTION
# ==========================================

@app.post("/predict")
def predict(transaction: Transaction):

    transaction_data = transaction.model_dump()

    try:

        result = predict_fraud(transaction_data)

        return result

    except Exception as e:

        return {
            "error": "Prediction failed",
            "details": str(e)
        }