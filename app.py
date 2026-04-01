from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

NUM_TO_RISK = {0: "LOW", 1: "NORMAL", 2: "HIGH"}

app = Flask(__name__)
CORS(app)
model = None


def load_model(model_path="model.pkl"):
    global model
    model = joblib.load(model_path)
    return model


load_model()


@app.post("/predict")
def predict():
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 503

        data = request.get_json(force=True)

        heart_rate = float(data["heart_rate"])
        steps = float(data["steps"])
        sleep = float(data["sleep"])
        medicine = float(data["medicine"])

        features = pd.DataFrame(
            [
                {
                    "heart_rate": heart_rate,
                    "steps": steps,
                    "sleep": sleep,
                    "medicine": medicine,
                }
            ]
        )

        pred = model.predict(features)[0]
        risk = NUM_TO_RISK[int(pred)]

        return jsonify({"risk": risk})
    except KeyError as exc:
        return jsonify({"error": f"Missing field: {exc}"}), 400
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.post("/reload-model")
def reload_model():
    try:
        load_model("model.pkl")
        return jsonify({"status": "ok", "message": "Model reloaded"})
    except Exception as exc:
        return jsonify({"status": "error", "error": str(exc)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
