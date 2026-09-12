import joblib
import pandas as pd
import shap


# Load the trained model
model = joblib.load("models/fraud_model.pkl")

# Load the scaler
scaler = joblib.load("models/scaler.pkl")


# Create SHAP explainer
explainer = shap.LinearExplainer(model, model.coef_)


def predict_fraud(transaction_data):
    """
    Predict fraud and explain the prediction using SHAP.
    """

    # Convert input data into a DataFrame
    df = pd.DataFrame([transaction_data])

    # Scale Amount
    df["Amount"] = scaler.transform(df[["Amount"]])

    # Get fraud probability
    probability = model.predict_proba(df)[0][1]

    # Determine prediction
    if probability >= 0.50:
        result = "Fraud"
    else:
        result = "Not Fraud"

    # Determine risk level
    if probability >= 0.70:
        risk_level = "High"
    elif probability >= 0.30:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Calculate SHAP values
    shap_values = explainer(df)

    # Get feature names and SHAP values
    feature_names = df.columns.tolist()
    feature_values = shap_values.values[0]

    # Create feature explanation list
    explanations = []

    for feature, value in zip(feature_names, feature_values):
        explanations.append({
            "feature": feature,
            "impact": round(float(value), 4)
        })

    # Sort by absolute impact
    explanations.sort(
        key=lambda x: abs(x["impact"]),
        reverse=True
    )

    # Return top 5 important features
    top_explanations = explanations[:5]

    return {
        "prediction": result,
        "fraud_probability": round(float(probability), 4),
        "risk_level": risk_level,
        "explanation": top_explanations
    }