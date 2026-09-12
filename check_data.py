import pandas as pd

# Load the dataset
df = pd.read_csv("data/creditcard.csv")

# Display the first 5 rows
print("First 5 rows:")
print(df.head())

# Display column names
print("\nColumn names:")
print(df.columns.tolist())

# Display number of rows and columns
print("\nDataset shape:")
print(df.shape)

# Count normal and fraud transactions
print("\nTransaction class counts:")
print(df["Class"].value_counts())