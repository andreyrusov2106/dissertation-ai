// api/chat.js — серверная функция Vercel (прокси к DeepSeek API)
// API-ключ хранится в переменной окружения DEEPSEEK_API_KEY
// Пользователи его никогда не видят

export default async function handler(req, res) {
  // Разрешаем только POST-запросы
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "DEEPSEEK_API_KEY не задан в настройках Vercel" });
  }

  const { system, messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Неверный формат запроса" });
  }

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",   // DeepSeek-V3 — умный и дешёвый
        max_tokens: 1500,
        messages: [
          { role: "system", content: system },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("DeepSeek API error:", err);
      return res.status(response.status).json({ error: "Ошибка DeepSeek API", details: err });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Пустой ответ от модели.";

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: "Внутренняя ошибка сервера", details: error.message });
  }
}
