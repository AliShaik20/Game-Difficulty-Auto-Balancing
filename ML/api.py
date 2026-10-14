from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os

from difficulty_controller import DifficultyController


# ============================================================
# APP CONFIGURATION
# ============================================================

app = FastAPI(
    title="Game Difficulty Auto-Balancing ML API",
    description="Machine Learning API for dynamic game difficulty adjustment",
    version="1.0.0"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# MODEL CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "difficulty_model.joblib"
)

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
# LOAD MODEL
# ============================================================

try:
    model = joblib.load(MODEL_PATH)
    MODEL_LOADED = True
    print("==============================================")
    print("ML MODEL LOADED SUCCESSFULLY")
    print(f"Model: {MODEL_PATH}")
    print("==============================================")
except Exception as e:
    model = None
    MODEL_LOADED = False

    print("==============================================")
    print("ERROR LOADING ML MODEL")
    print(str(e))
    print("==============================================")


# ============================================================
# DIFFICULTY CONTROLLER
# ============================================================

controller = DifficultyController()


# ============================================================
# REQUEST MODEL
# ============================================================

class PlayerFeatures(BaseModel):

    current_difficulty: float

    accuracy: float

    win_rate: float

    death_rate: float

    survival_rate: float

    average_score: float

    reaction_time: float

    completion_time: float

    performance_trend: float

    consecutive_wins: float

    consecutive_losses: float

    recent_accuracy: float

    recent_win_rate: float

    recent_score: float


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "Game Difficulty Auto-Balancing ML API",
        "status": "running",
        "model_loaded": MODEL_LOADED,
        "model_type": "Gradient Boosting Classifier",
        "classes": {
            "-1": "decrease difficulty",
            "0": "maintain difficulty",
            "1": "increase difficulty"
        }
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": MODEL_LOADED,
        "model_path": MODEL_PATH,
        "current_difficulty": controller.current_level
    }


# ============================================================
# PREDICTION FUNCTION
# ============================================================

@app.post("/predict")
def predict(features: PlayerFeatures):

    if not MODEL_LOADED:
        return {
            "success": False,
            "error": "ML model is not loaded"
        }

    # --------------------------------------------------------
    # Convert request into dictionary
    # --------------------------------------------------------

    data = features.model_dump()

    # --------------------------------------------------------
    # Create DataFrame
    # --------------------------------------------------------

    input_data = pd.DataFrame(
        [[data[feature] for feature in FEATURES]],
        columns=FEATURES
    )

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    prediction = int(model.predict(input_data)[0])

    # --------------------------------------------------------
    # Probability
    # --------------------------------------------------------

    probabilities = model.predict_proba(input_data)[0]

    classes = model.classes_

    probability_map = {}

    for cls, probability in zip(classes, probabilities):

        probability_map[str(int(cls))] = float(probability)

    # --------------------------------------------------------
    # Confidence
    # --------------------------------------------------------

    confidence = float(max(probabilities))

    # --------------------------------------------------------
    # Meaning
    # --------------------------------------------------------

    if prediction == -1:

        meaning = "decrease"

    elif prediction == 0:

        meaning = "maintain"

    else:

        meaning = "increase"

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {
        "success": True,

        "prediction": prediction,

        "meaning": meaning,

        "confidence": confidence,

        "probabilities": probability_map,

        "current_difficulty": features.current_difficulty
    }


# ============================================================
# RECORD GAME ACTIONS
# ============================================================

class ActionRequest(BaseModel):

    action: str


@app.post("/test-actions")
def test_actions(actions: list[ActionRequest]):

    results = []

    for action in actions:

        controller.record_action()

        results.append({
            "action": action.action,
            "total_actions": controller.action_count
        })

    return {
        "success": True,
        "message": "Actions recorded successfully",
        "total_actions": controller.action_count,
        "actions": results
    }


# ============================================================
# DIFFICULTY ADJUSTMENT
# ============================================================

@app.post("/adjust-difficulty")
def adjust_difficulty(features: PlayerFeatures):

    if not MODEL_LOADED:

        return {
            "success": False,
            "error": "ML model is not loaded"
        }

    # --------------------------------------------------------
    # Prepare data
    # --------------------------------------------------------

    data = features.model_dump()

    input_data = pd.DataFrame(
        [[data[feature] for feature in FEATURES]],
        columns=FEATURES
    )

    # --------------------------------------------------------
    # ML prediction
    # --------------------------------------------------------

    prediction = int(model.predict(input_data)[0])

    probabilities = model.predict_proba(input_data)[0]

    confidence = float(max(probabilities))

    # --------------------------------------------------------
    # Meaning
    # --------------------------------------------------------

    if prediction == -1:

        meaning = "decrease"

    elif prediction == 0:

        meaning = "maintain"

    else:

        meaning = "increase"

    # --------------------------------------------------------
    # Apply guardrails through controller
    # --------------------------------------------------------

    difficulty_result = controller.apply_prediction(
        prediction,
        confidence
    )

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return {

        "success": True,

        "ml_prediction": prediction,

        "meaning": meaning,

        "confidence": confidence,

        "difficulty": difficulty_result
    }


# ============================================================
# RUN INFORMATION
# ============================================================

@app.get("/model-info")
def model_info():

    return {

        "model_loaded": MODEL_LOADED,

        "model_path": MODEL_PATH,

        "model_type": "Gradient Boosting Classifier",

        "features": FEATURES,

        "number_of_features": len(FEATURES),

        "classes": [-1, 0, 1],

        "class_meaning": {
            "-1": "Decrease difficulty",
            "0": "Maintain difficulty",
            "1": "Increase difficulty"
        },

        "guardrails": {
            "confidence_threshold": 0.65,
            "minimum_actions": 10,
            "cooldown_seconds": 30,
            "maximum_step": 1,
            "minimum_level": 1,
            "maximum_level": 5
        }
    }