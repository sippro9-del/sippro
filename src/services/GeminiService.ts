// Client-side helper to communicate with our server-side Gemini API proxy.
// This prevents exposing any API keys to the browser and avoids bundling Node-only modules in the client.

export const getGeminiResponse = async (prompt: string, context?: string): Promise<string> => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: prompt,
        context: context,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    return data.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("Error communicating with Gemini proxy:", error);
    throw error;
  }
};
