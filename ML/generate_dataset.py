import numpy as np
import pandas as pd


# ============================================================
# GAME DIFFICULTY AUTO-BALANCING SYSTEM
# SYNTHETIC GAMEPLAY DATASET GENERATOR
# ============================================================

np.random.seed(42)

NUMBER_OF_RECORDS = 12000

records = []


# ============================================================
# GENERATE 12,000 GAMEPLAY RECORDS
# ============================================================

for i in range(NUMBER_OF_RECORDS):

    # --------------------------------------------------------
    # 1. Current Difficulty
    # --------------------------------------------------------

    current_difficulty = np.random.randint(1, 6)


    # --------------------------------------------------------
    # 2. Accuracy
    # --------------------------------------------------------

    accuracy = np.clip(
        np.random.normal(0.70, 0.18),
        0,
        1
    )


    # --------------------------------------------------------
    # 3. Win Rate
    # --------------------------------------------------------

    win_rate = np.clip(
        np.random.normal(0.60, 0.20),
        0,
        1
    )


    # --------------------------------------------------------
    # 4. Death Rate
    # --------------------------------------------------------

    death_rate = np.clip(
        np.random.normal(0.25, 0.15),
        0,
        1
    )


    # --------------------------------------------------------
    # 5. Survival Rate
    # --------------------------------------------------------

    survival_rate = np.clip(
        np.random.normal(0.70, 0.18),
        0,
        1
    )


    # --------------------------------------------------------
    # 6. Average Score
    # --------------------------------------------------------

    average_score = max(
        0,
        np.random.normal(500, 180)
    )


    # --------------------------------------------------------
    # 7. Reaction Time
    # --------------------------------------------------------

    reaction_time = max(
        100,
        np.random.normal(650, 180)
    )


    # --------------------------------------------------------
    # 8. Completion Time
    # --------------------------------------------------------

    completion_time = max(
        5,
        np.random.normal(60, 20)
    )


    # --------------------------------------------------------
    # 9. Performance Trend
    # --------------------------------------------------------

    performance_trend = np.clip(
        np.random.normal(0, 0.25),
        -1,
        1
    )


    # --------------------------------------------------------
    # 10. Consecutive Wins
    # --------------------------------------------------------

    consecutive_wins = np.random.randint(0, 8)


    # --------------------------------------------------------
    # 11. Consecutive Losses
    # --------------------------------------------------------

    consecutive_losses = np.random.randint(0, 6)


    # --------------------------------------------------------
    # 12. Recent Accuracy
    # --------------------------------------------------------

    recent_accuracy = np.clip(
        np.random.normal(0.70, 0.20),
        0,
        1
    )


    # --------------------------------------------------------
    # 13. Recent Win Rate
    # --------------------------------------------------------

    recent_win_rate = np.clip(
        np.random.normal(0.60, 0.25),
        0,
        1
    )


    # --------------------------------------------------------
    # 14. Recent Score
    # --------------------------------------------------------

    recent_score = max(
        0,
        np.random.normal(500, 200)
    )


    # ========================================================
    # PLAYER PERFORMANCE SCORE
    # ========================================================

    performance_score = (

        accuracy * 0.20

        + win_rate * 0.15

        + survival_rate * 0.15

        + recent_accuracy * 0.15

        + recent_win_rate * 0.15

        + performance_trend * 0.10

        + min(consecutive_wins / 5, 1) * 0.10

    )


    # ========================================================
    # PLAYER STRUGGLE SCORE
    # ========================================================

    struggle_score = (

        death_rate * 0.35

        + (1 - recent_win_rate) * 0.25

        + (1 - recent_accuracy) * 0.20

        + min(consecutive_losses / 5, 1) * 0.20

    )


    # ========================================================
    # CONTROL SCORE
    #
    # Positive  -> player performing well
    # Negative  -> player struggling
    # ========================================================

    control_score = (
        performance_score - struggle_score
    )


    # ========================================================
    # STORE RECORD
    # ========================================================

    records.append([

        current_difficulty,

        accuracy,

        win_rate,

        death_rate,

        survival_rate,

        average_score,

        reaction_time,

        completion_time,

        performance_trend,

        consecutive_wins,

        consecutive_losses,

        recent_accuracy,

        recent_win_rate,

        recent_score,

        control_score

    ])


# ============================================================
# CREATE DATAFRAME
# ============================================================

columns = [

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

    "recent_score",

    "control_score"

]


df = pd.DataFrame(
    records,
    columns=columns
)


# ============================================================
# CREATE TARGET CLASSES
#
# Approximately:
# -1 = 25%
#  0 = 43%
# +1 = 32%
# ============================================================

lower_threshold = df["control_score"].quantile(0.25)

upper_threshold = df["control_score"].quantile(0.68)


def assign_target(score):

    if score <= lower_threshold:

        return -1

    elif score >= upper_threshold:

        return 1

    else:

        return 0


df["target"] = df["control_score"].apply(
    assign_target
)


# ============================================================
# REMOVE HELPER COLUMN
# ============================================================

df = df.drop(
    columns=["control_score"]
)


# ============================================================
# SAVE DATASET
# ============================================================

df.to_csv(
    "gameplay_dataset.csv",
    index=False
)


# ============================================================
# DISPLAY RESULTS
# ============================================================

print("=" * 60)

print(
    "GAME DIFFICULTY AUTO-BALANCING SYSTEM"
)

print(
    "Synthetic Gameplay Dataset Generator"
)

print("=" * 60)

print()

print(
    "Dataset generated successfully!"
)

print(
    f"Number of records: {len(df)}"
)

print(
    "Number of features: 14"
)

print()

print(
    "Target distribution:"
)

print(
    df["target"].value_counts().sort_index()
)

print()

print(
    "Target meaning:"
)

print(
    "-1 = Decrease difficulty"
)

print(
    " 0 = Maintain difficulty"
)

print(
    "+1 = Increase difficulty"
)

print()

print(
    "Dataset saved as:"
)

print(
    "gameplay_dataset.csv"
)

print("=" * 60)