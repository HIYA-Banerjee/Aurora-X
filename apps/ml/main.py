// from fastapi import applications
apps/ml/main.py

from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "ok"}
