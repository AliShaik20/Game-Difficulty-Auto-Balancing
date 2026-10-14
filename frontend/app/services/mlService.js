const ML_API_URL =
  process.env.NEXT_PUBLIC_ML_API_URL ||
  "http://localhost:8000";

/**
 * Check whether the ML API is available
 */
export async function checkMLHealth() {
  const response = await fetch(`${ML_API_URL}/health`);

  if (!response.ok) {
    throw new Error("ML service is unavailable.");
  }

  return await response.json();
}

/**
 * Send player performance features
 * to the ML prediction engine.
 */
export async function predictDifficulty(features) {
  const response = await fetch(`${ML_API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(features),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.message ||
        "Difficulty prediction failed."
    );
  }

  return data;
}