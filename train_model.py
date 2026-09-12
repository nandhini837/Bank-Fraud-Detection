import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix


# 1. Load dataset
df = pd.read_csv("data/creditcard.csv")

print("Dataset loaded successfully!")
print("Dataset shape:", df.shape)


# 2. Separate features and target
X = df.drop("Class", axis=1)
y = df["Class"]


# 3. Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# 4. Scale the Amount column
scaler = StandardScaler()

X_train["Amount"] = scaler.fit_transform(
    X_train[["Amount"]]
)

X_test["Amount"] = scaler.transform(
    X_test[["Amount"]]
)


print("Training data:", X_train.shape)
print("Testing data:", X_test.shape)


# 5. Create the machine learning model
model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
)


# 6. Train the model
print("Training model...")

model.fit(X_train, y_train)

print("Model training completed!")


# 7. Make predictions
y_pred = model.predict(X_test)


# 8. Evaluate the model
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

print("\nClassification Report:")
print(classification_report(y_test, y_pred))


# 9. Save the trained model
joblib.dump(model, "models/fraud_model.pkl")

# 10. Save the scaler
joblib.dump(scaler, "models/scaler.pkl")

print("\nModel saved successfully!")
print("Scaler saved successfully!")