import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


# ============================================================
# GAME DIFFICULTY AUTO-BALANCING SYSTEM
# GRADIENT BOOSTING MODEL TRAINING
# ============================================================


print("=" * 60)
print("GAME DIFFICULTY AUTO-BALANCING SYSTEM")
print("Gradient Boosting Model Training")
print("=" * 60)


# ============================================================
# LOAD DATASET
# ============================================================

print("\nLoading dataset...")

df = pd.read_csv(
    "gameplay_dataset.csv"
)

print(
    f"Dataset loaded: {len(df)} records"
)


# ============================================================
# 14 FEATURES
# ============================================================

FEATURES = [

    "current_difficulty",

    "accuracy",

    "win_rate",

    "death_rate",

    "survival_rate",

    "average_score",

    "reaction_time",

    "completion_time",

    "performance_trend",

    "consecutive_wins",

    "consecutive_losses",

    "recent_accuracy",

    "recent_win_rate",

    "recent_score"

]


# ============================================================
# INPUT AND TARGET
# ============================================================

X = df[FEATURES]

y = df["target"]


print(
    f"Number of features: {X.shape[1]}"
)

print(
    f"Number of samples: {X.shape[0]}"
)


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

print("\nSplitting dataset...")

X_train, X_test, y_train, y_test = train_test_split(

    X,

    y,

    test_size=0.20,

    random_state=42,

    stratify=y

)


print(
    f"Training samples: {len(X_train)}"
)

print(
    f"Testing samples: {len(X_test)}"
)


# ============================================================
# CREATE GRADIENT BOOSTING MODEL
# ============================================================

print("\nCreating Gradient Boosting model...")


model = GradientBoostingClassifier(

    n_estimators=300,

    learning_rate=0.05,

    max_depth=5,

    min_samples_split=5,

    min_samples_leaf=2,

    subsample=0.9,

    random_state=42

)


# ============================================================
# TRAIN
# ============================================================

print("Training model...")

model.fit(

    X_train,

    y_train

)


print("Training completed!")


# ============================================================
# PREDICTION
# ============================================================

print("\nRunning predictions...")

y_pred = model.predict(

    X_test

)


# ============================================================
# ACCURACY
# ============================================================

accuracy = accuracy_score(

    y_test,

    y_pred

)


print("\n" + "=" * 60)

print("MODEL PERFORMANCE")

print("=" * 60)


print(

    f"\nTest Accuracy: {accuracy * 100:.2f}%"

)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\nClassification Report:")

print(

    classification_report(

        y_test,

        y_pred

    )

)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("\nConfusion Matrix:")

matrix = confusion_matrix(

    y_test,

    y_pred

)

print(matrix)


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

print("\nFeature Importance:")

importance = model.feature_importances_


feature_importance = pd.DataFrame({

    "feature": FEATURES,

    "importance": importance

})


feature_importance = feature_importance.sort_values(

    by="importance",

    ascending=False

)


for _, row in feature_importance.iterrows():

    print(

        f"{row['feature']:<25} "
        f"{row['importance']:.4f}"

    )


# ============================================================
# SAVE MODEL
# ============================================================

model_path = (

    "models/difficulty_model.joblib"

)


joblib.dump(

    model,

    model_path

)


print("\n" + "=" * 60)

print("MODEL SAVED SUCCESSFULLY")

print("=" * 60)

print(

    f"\nModel location:\n{model_path}"

)

print("\nReady for FastAPI integration!")

print("=" * 60)