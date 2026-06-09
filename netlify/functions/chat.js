// netlify/functions/chat.js — серверная функция для Netlify
// Формат отличается от Vercel: используем exports.handler вместо export default

exports.handler = async function (event, context) {
  // Разрешаем только POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "DEEPSEEK_API_KEY не задан в настройках Netlify" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Неверный JSON" }) };
  }

  const { system, messages } = body;

  if (!messages || !Array.isArray(messages)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Неверный формат запроса" }) };
  }

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 1500,
        messages: [
          { role: "system", content: system },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Ошибка DeepSeek API", details: err }),
      };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Пустой ответ от модели.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Внутренняя ошибка сервера", details: error.message }),
    };
  }
};
