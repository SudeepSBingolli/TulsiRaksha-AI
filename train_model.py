import argparse

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

RISK_TO_NUM = {"LOW": 0, "NORMAL": 1, "HIGH": 2}
FEATURE_COLUMNS = ["heart_rate", "steps", "sleep", "medicine"]


def train_model(data_path="health_data.csv", model_path="model.pkl"):
    df = pd.read_csv(data_path)
    if "risk" not in df.columns:
        raise ValueError("Dataset must include a 'risk' column")

    filtered_df = df[df["risk"].isin(RISK_TO_NUM.keys())].copy()
    if len(filtered_df) < 12:
        raise ValueError(
            f"Not enough labeled rows to train. Found {len(filtered_df)}, need at least 12."
        )

    X = filtered_df[FEATURE_COLUMNS]
    y = filtered_df["risk"].map(RISK_TO_NUM)

    # Avoid stratify failure when a class has only one sample.
    stratify = y if y.nunique() > 1 and y.value_counts().min() > 1 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=stratify,
    )

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced_subsample",
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred, target_names=["LOW", "NORMAL", "HIGH"]))

    joblib.dump(model, model_path)
    print(f"Saved trained model to {model_path}")
    return model


def main():
    parser = argparse.ArgumentParser(description="Train risk model from health dataset")
    parser.add_argument("--data", default="health_data.csv", help="Path to input CSV")
    parser.add_argument("--model", default="model.pkl", help="Path to output model file")
    args = parser.parse_args()

    train_model(data_path=args.data, model_path=args.model)


if __name__ == "__main__":
    main()
