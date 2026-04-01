export async function getRiskFromML({ heart_rate, steps, sleep, medicine }) {
  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heart_rate, steps, sleep, medicine }),
    });

    if (!response.ok) {
      throw new Error(`ML API failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data?.risk) {
      throw new Error("Invalid ML API response");
    }

    return data.risk;
  } catch (error) {
    console.warn("[ML] Prediction fallback:", error?.message || error);
    return null;
  }
}
