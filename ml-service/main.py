from pathlib import Path

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title='WAULT Risk Engine', version='1.0')


class UserActivityData(BaseModel):
    login_count_30d: int
    days_inactive: float
    avg_response_delay: float = 0.0
    prev_triggers: int = 0


LABEL_MAP = {0: 'LOW', 1: 'MEDIUM', 2: 'HIGH'}
model = None


def load_model():
    global model
    if model is None:
        model_path = Path(__file__).parent / 'model.pkl'
        if not model_path.exists():
            raise RuntimeError('model.pkl not found. Run: python model.py')
        model = joblib.load(model_path)
    return model


@app.post('/predict')
async def predict(data: UserActivityData):
    try:
        clf = load_model()
        features = np.array(
            [[
                data.login_count_30d,
                data.days_inactive,
                data.avg_response_delay,
                data.prev_triggers,
            ]]
        )
        prediction = clf.predict(features)[0]
        probabilities = clf.predict_proba(features)[0]
        confidence = float(probabilities[prediction])
        return {
            'risk': LABEL_MAP[prediction],
            'score': float(max(probabilities)),
            'confidence': confidence,
            'details': {
                'low_prob': float(probabilities[0]),
                'medium_prob': float(probabilities[1]),
                'high_prob': float(probabilities[2]),
            },
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error


@app.get('/health')
async def health():
    return {'status': 'ok', 'model_loaded': model is not None}


# Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
