import time


class DifficultyController:

    def __init__(self):
        # Game difficulty levels: 1 to 5
        self.current_level = 3

        # Safety settings
        self.min_level = 1
        self.max_level = 5

        # Maximum change allowed in one decision
        self.max_step = 1

        # 30-second cooldown
        self.cooldown_seconds = 30
        self.last_change_time = 0

        # Minimum confidence required
        self.confidence_threshold = 0.65

        # Minimum gameplay actions
        self.minimum_actions = 10

        # Number of actions performed
        self.action_count = 0

    def record_action(self):
        """
        Record one gameplay action.
        """
        self.action_count += 1

    def can_change(self, confidence):
        """
        Check whether difficulty is allowed to change.
        """

        # Check minimum number of actions
        if self.action_count < self.minimum_actions:
            return False, "Not enough gameplay actions"

        # Check confidence
        if confidence < self.confidence_threshold:
            return False, "ML confidence is too low"

        # Check cooldown
        current_time = time.time()

        if current_time - self.last_change_time < self.cooldown_seconds:
            return False, "Difficulty change is on cooldown"

        return True, "Change allowed"

    def apply_prediction(self, prediction, confidence):
        """
        Apply ML prediction to current difficulty.
        
        prediction:
            -1 = decrease
             0 = maintain
             1 = increase
        """

        allowed, reason = self.can_change(confidence)

        if not allowed:
            return {
                "changed": False,
                "old_level": self.current_level,
                "new_level": self.current_level,
                "prediction": prediction,
                "confidence": confidence,
                "reason": reason
            }

        old_level = self.current_level

        # Limit ML decision to one level
        if prediction > 0:
            step = self.max_step
        elif prediction < 0:
            step = -self.max_step
        else:
            step = 0

        # Calculate new level
        new_level = old_level + step

        # Keep level between 1 and 5
        new_level = max(
            self.min_level,
            min(self.max_level, new_level)
        )

        # Update only if level actually changes
        if new_level != old_level:
            self.current_level = new_level
            self.last_change_time = time.time()

            return {
                "changed": True,
                "old_level": old_level,
                "new_level": new_level,
                "prediction": prediction,
                "confidence": confidence,
                "reason": "Difficulty updated successfully"
            }

        return {
            "changed": False,
            "old_level": old_level,
            "new_level": new_level,
            "prediction": prediction,
            "confidence": confidence,
            "reason": "Difficulty already at boundary"
        }


# Simple test
if __name__ == "__main__":

    controller = DifficultyController()

    print("Initial difficulty:", controller.current_level)

    # Simulate 10 gameplay actions
    for _ in range(10):
        controller.record_action()

    # ML says increase difficulty
    result = controller.apply_prediction(
        prediction=1,
        confidence=0.999
    )

    print("\nML Decision:")
    print(result)