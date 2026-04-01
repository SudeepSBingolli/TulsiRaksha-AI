import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

RISK_TO_NUM = {"LOW": 0, "NORMAL": 1, "HIGH": 2}


def main():
    df = pd.read_csv("health_data.csv")

    X = df[["heart_rate", "steps", "sleep", "medicine"]]
    y = df["risk"].map(RISK_TO_NUM)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced_subsample",
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred, target_names=["LOW", "NORMAL", "HIGH"]))

    joblib.dump(model, "model.pkl")
    print("Saved trained model to model.pkl")


if __name__ == "__main__":
    main()
