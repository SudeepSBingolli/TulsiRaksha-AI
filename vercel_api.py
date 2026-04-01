"""
Vercel API Handler
Deploy this on Vercel to receive real-time smartwatch data
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Load model
try:
    model = joblib.load("model.pkl")
except:
    model = None

# Store predictions in memory (for demo)
predictions_store = []

# Mapping
NUM_TO_RISK = {0: "LOW", 1: "NORMAL", 2: "HIGH"}

@app.route("/", methods=["GET"])
def home():
    """Health check endpoint"""
    return jsonify({
        "status": "OK",
        "message": "TulsiRaksha-AI API Running",
        "endpoints": {
            "predict": "/predict (POST)",
            "data": "/data (GET)",
            "stats": "/stats (GET)"
        }
    })

@app.route("/predict", methods=["POST", "OPTIONS"])
def predict():
    """
    Make health risk prediction
    
    POST /predict
    {
        "heart_rate": 85,
        "steps": 1000,
        "sleep": 7,
        "medicine": 1
    }
    """
    if request.method == "OPTIONS":
        return "", 200
    
    try:
        data = request.get_json(force=True)
        
        heart_rate = float(data.get("heart_rate", 70))
        steps = float(data.get("steps", 1000))
        sleep = float(data.get("sleep", 7))
        medicine = float(data.get("medicine", 1))
        
        # Create features
        features = pd.DataFrame([{
            "heart_rate": heart_rate,
            "steps": steps,
            "sleep": sleep,
            "medicine": medicine,
        }])
        
        # Predict
        if model:
            pred = model.predict(features)[0]
            risk = NUM_TO_RISK[int(pred)]
        else:
            risk = "NORMAL"  # Default if model not loaded
        
        # Store prediction
        prediction_record = {
            "timestamp": datetime.now().isoformat(),
            "heart_rate": heart_rate,
            "steps": steps,
            "sleep": sleep,
            "medicine": medicine,
            "risk": risk
        }
        predictions_store.append(prediction_record)
        
        return jsonify({
            "risk": risk,
            "heart_rate": heart_rate,
            "steps": steps,
            "sleep": sleep,
            "medicine": medicine,
            "timestamp": prediction_record["timestamp"]
        }), 200
        
    except KeyError as exc:
        return jsonify({"error": f"Missing field: {exc}"}), 400
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

@app.route("/data", methods=["GET"])
def get_data():
    """Get all stored predictions"""
    return jsonify({
        "count": len(predictions_store),
        "predictions": predictions_store[-100:]  # Last 100
    }), 200

@app.route("/stats", methods=["GET"])
def get_stats():
    """Get statistics"""
    if not predictions_store:
        return jsonify({"error": "No data yet"}), 404
    
    risks = [p["risk"] for p in predictions_store]
    heart_rates = [p["heart_rate"] for p in predictions_store]
    
    return jsonify({
        "total_predictions": len(predictions_store),
        "risk_distribution": {
            "LOW": risks.count("LOW"),
            "NORMAL": risks.count("NORMAL"),
            "HIGH": risks.count("HIGH")
        },
        "heart_rate_stats": {
            "min": min(heart_rates),
            "max": max(heart_rates),
            "avg": sum(heart_rates) / len(heart_rates)
        },
        "latest": predictions_store[-1] if predictions_store else None
    }), 200

@app.route("/batch", methods=["POST"])
def batch_predict():
    """
    Batch predictions
    
    POST /batch
    {
        "data": [
            {"heart_rate": 80, "steps": 1000, "sleep": 7, "medicine": 1},
            {"heart_rate": 85, "steps": 1200, "sleep": 7, "medicine": 1}
        ]
    }
    """
    try:
        batch_data = request.get_json(force=True)
        data_list = batch_data.get("data", [])
        
        results = []
        for item in data_list:
            heart_rate = float(item.get("heart_rate", 70))
            steps = float(item.get("steps", 1000))
            sleep = float(item.get("sleep", 7))
            medicine = float(item.get("medicine", 1))
            
            features = pd.DataFrame([{
                "heart_rate": heart_rate,
                "steps": steps,
                "sleep": sleep,
                "medicine": medicine,
            }])
            
            if model:
                pred = model.predict(features)[0]
                risk = NUM_TO_RISK[int(pred)]
            else:
                risk = "NORMAL"
            
            results.append({
                "heart_rate": heart_rate,
                "risk": risk
            })
            
            # Store
            predictions_store.append({
                "timestamp": datetime.now().isoformat(),
                "heart_rate": heart_rate,
                "steps": steps,
                "sleep": sleep,
                "medicine": medicine,
                "risk": risk
            })
        
        return jsonify({"predictions": results}), 200
        
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
