import { useState, useRef, useEffect } from "react";

const TABS = [
  { id: "search", label: "文献搜索", labelRu: "Поиск литературы", icon: "🔍" },
  { id: "plan", label: "论文计划", labelRu: "План диссертации", icon: "📋" },
  { id: "translate", label: "翻译", labelRu: "Перевод", icon: "🌐" },
  { id: "gost", label: "ГОСТ", labelRu: "Стандарты ГОСТ", icon: "📐" },
];

const SYSTEM_PROMPTS = {
  search: `Ты — научный ассистент для китайских аспирантов, обучающихся в России. 
Помогай искать и анализировать литературу по теме диссертации.
Отвечай на русском и китайском языках одновременно.
Формат ответа:
1. Краткий анализ темы (2-3 предложения на русском)
2. 主要文献 (на китайском): список из 5-7 релевантных источников с пояснениями
3. Ключевые авторы и научные школы
4. Рекомендации по базам данных (eLibrary, CNKI, Scopus, Web of Science)
Будь конкретным и академически точным.`,

  plan: `Ты — научный руководитель-ассистент для китайских аспирантов в России.
Помогай составлять структуру диссертации по российским академическим стандартам.
Отвечай на русском языке с китайскими пояснениями в скобках.
Формат ответа:
1. Рекомендуемая структура глав (с обоснованием)
2. Примерный объём каждой части
3. Ключевые требования по российским стандартам (ВАК)
4. 时间规划 — план по времени для каждого раздела
5. Советы по методологии
Учитывай особенности российской академической системы.`,

  translate: `Ты — профессиональный переводчик научных текстов с русского на китайский и обратно.
Специализация: академические и научные тексты для диссертаций.
Инструкции:
- Определи язык входного текста автоматически
- Переведи на другой язык (RU→ZH или ZH→RU)
- Сохраняй академический стиль и терминологию
- Для ключевых терминов давай оба варианта: термин (术语)
- Если есть устойчивые научные термины — используй принятые переводы
- В конце дай краткий глоссарий ключевых терминов`,

  gost: `Ты — эксперт по российским стандартам оформления научных работ (ГОСТ).
Помогай китайским аспирантам правильно оформлять диссертации.
Основные стандарты: ГОСТ Р 7.0.11-2011, ГОСТ 7.1-2003, ГОСТ 7.80-2000, ГОСТ 7.82-2001.
Отвечай на русском с китайскими пояснениями (中文说明).
При вопросе об оформлении давай:
1. Конкретное требование ГОСТа с номером пункта
2. Пример правильного оформления
3. 中文解释 — объяснение на китайском
4. Типичные ошибки, которых следует избегать
Будь точным и ссылайся на конкретные пункты стандартов.`,
};

function Message({ msg }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: msg.role === "user" ? "row-reverse" : "row",
      gap: "10px",
      marginBottom: "16px",
      alignItems: "flex-start",
    }}>
      <div style={{
        width: "32px", height: "32px",
        borderRadius: "50%",
        background: msg.role === "user" ? "#c8102e" : "#1a1a2e",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "14px", flexShrink: 0,
        border: msg.role === "assistant" ? "2px solid #c8102e" : "none",
      }}>
        {msg.role === "user" ? "👤" : "🎓"}
      </div>
      <div style={{
        maxWidth: "75%",
        padding: "12px 16px",
        borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
        background: msg.role === "user" ? "#c8102e" : "#0f0f23",
        color: "#fff", fontSize: "14px", lineHeight: "1.6",
        border: msg.role === "assistant" ? "1px solid #2a2a4a" : "none",
        whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {msg.content}
      </div>
    </div>
  );
}

function ChatPanel({ tabId, placeholder }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Запрос идёт на наш серверный прокси /api/chat
      // API-ключ хранится на сервере, пользователи его не видят
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tab: tabId,
          system: SYSTEM_PROMPTS[tabId],
          messages: newMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.text }]);
    } catch (e) {
      setMessages([...newMessages, {
        role: "assistant",
        content: "⚠️ Ошибка соединения. Проверьте, что DEEPSEEK_API_KEY добавлен в настройках Vercel.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = {
    search: [
      "Поиск литературы по машинному обучению в медицине",
      "Найди источники по устойчивому развитию городов",
      "Литература по квантовым вычислениям на русском",
    ],
    plan: [
      "Составь план диссертации по экономике",
      "Структура диссертации по техническим наукам",
      "Как распределить главы в педагогической диссертации?",
    ],
    translate: [
      "Переведи: Диссертация на соискание учёной степени кандидата наук",
      "翻译：本研究采用定量研究方法",
      "Как перевести 'научная новизна'?",
    ],
    gost: [
      "Как оформить список литературы по ГОСТ?",
      "Требования к титульному листу диссертации",
      "Как цитировать иностранные источники?",
    ],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "12px" }}>
      {messages.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "8px 0" }}>
          <p style={{ color: "#888", fontSize: "12px", margin: 0 }}>Быстрые вопросы / 快速问题：</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {suggestions[tabId].map((s, i) => (
              <button key={i} onClick={() => setInput(s)} style={{
                background: "transparent", border: "1px solid #2a2a4a",
                color: "#aaa", borderRadius: "20px", padding: "6px 12px",
                fontSize: "12px", cursor: "pointer", transition: "all 0.2s",
              }}
                onMouseEnter={(e) => { e.target.style.borderColor = "#c8102e"; e.target.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.target.style.borderColor = "#2a2a4a"; e.target.style.color = "#aaa"; }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0", minHeight: "200px" }}>
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        {loading && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1a1a2e", border: "2px solid #c8102e", display: "flex", alignItems: "center", justifyContent: "center" }}>🎓</div>
            <div style={{ display: "flex", gap: "5px", padding: "12px 16px", background: "#0f0f23", borderRadius: "4px 18px 18px 18px", border: "1px solid #2a2a4a" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: "8px", height: "8px", borderRadius: "50%", background: "#c8102e",
                  animation: "pulse 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder={placeholder}
          rows={2}
          style={{
            flex: 1, background: "#0f0f23", border: "1px solid #2a2a4a",
            borderRadius: "12px", color: "#fff", padding: "10px 14px",
            fontSize: "14px", resize: "none", outline: "none",
            fontFamily: "inherit", lineHeight: 1.5,
          }}
          onFocus={(e) => e.target.style.borderColor = "#c8102e"}
          onBlur={(e) => e.target.style.borderColor = "#2a2a4a"}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
          width: "48px", height: "48px", borderRadius: "12px",
          background: loading || !input.trim() ? "#2a2a4a" : "#c8102e",
          border: "none", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s", alignSelf: "flex-end",
        }}>
          ➤
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("search");

  const placeholders = {
    search: "Введите тему для поиска литературы... / 输入研究主题...",
    plan: "Опишите тему диссертации для составления плана... / 描述您的论文主题...",
    translate: "Введите текст для перевода (RU или ZH) / 输入需要翻译的文本...",
    gost: "Задайте вопрос об оформлении по ГОСТ... / 询问关于ГОСТ格式的问题...",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#07071a",
      fontFamily: "'Noto Serif SC', 'Georgia', serif",
      color: "#fff", display: "flex", flexDirection: "column",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600&family=Cinzel:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a1a; }
        ::-webkit-scrollbar-thumb { background: #c8102e; border-radius: 2px; }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      `}</style>

      <header style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #0f0f23 50%, #1a0a0a 100%)",
        borderBottom: "1px solid #2a2a4a",
        padding: "16px 24px",
        display: "flex", alignItems: "center", gap: "16px",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            background: "linear-gradient(135deg, #c8102e, #8b0000)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px",
            boxShadow: "0 0 20px rgba(200,16,46,0.4)",
            border: "2px solid rgba(200,16,46,0.5)",
          }}>🎓</div>
          <div>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: "18px", fontWeight: "600",
              background: "linear-gradient(90deg, #fff, #c8102e, #fff)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              animation: "shimmer 4s linear infinite", letterSpacing: "1px",
            }}>DissertAI</div>
            <div style={{ fontSize: "11px", color: "#888", letterSpacing: "0.5px" }}>
              论文助手 · Ассистент аспиранта
            </div>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
          <span style={{ fontSize: "12px", color: "#666" }}>AI активен</span>
        </div>
      </header>

      <div style={{ display: "flex", background: "#0a0a1a", borderBottom: "1px solid #1a1a3a", overflowX: "auto" }}>
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: "1", minWidth: "120px", padding: "14px 16px",
            background: activeTab === tab.id ? "#0f0f23" : "transparent",
            border: "none",
            borderBottom: activeTab === tab.id ? "2px solid #c8102e" : "2px solid transparent",
            color: activeTab === tab.id ? "#fff" : "#666",
            cursor: "pointer", transition: "all 0.2s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
          }}>
            <span style={{ fontSize: "20px" }}>{tab.icon}</span>
            <span style={{ fontSize: "12px", fontFamily: "'Noto Serif SC', serif" }}>{tab.label}</span>
            <span style={{ fontSize: "10px", color: "#555" }}>{tab.labelRu}</span>
          </button>
        ))}
      </div>

      <main style={{
        flex: 1, maxWidth: "860px", width: "100%", margin: "0 auto",
        padding: "20px 20px 24px", display: "flex", flexDirection: "column",
        height: "calc(100vh - 130px)", animation: "fadeIn 0.3s ease",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #0f0f23, #1a0a1a)",
          border: "1px solid #2a2a4a", borderLeft: "3px solid #c8102e",
          borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
          fontSize: "12px", color: "#aaa", lineHeight: 1.5,
        }}>
          {activeTab === "search" && "🔍 Найдите академическую литературу по вашей теме. Система предложит источники на русском и китайском языках, базы данных и ключевых авторов. · 查找文献资料"}
          {activeTab === "plan" && "📋 Составьте структуру диссертации по требованиям ВАК России. Получите план с распределением глав и временной график. · 制定论文写作计划"}
          {activeTab === "translate" && "🌐 Профессиональный перевод научных текстов RU ↔ ZH с сохранением академического стиля и терминологии. · 俄中学术文本翻译"}
          {activeTab === "gost" && "📐 Справочник по оформлению диссертаций по российским стандартам ГОСТ с примерами и объяснениями на китайском. · ГОСТ论文格式规范"}
        </div>

        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <ChatPanel key={activeTab} tabId={activeTab} placeholder={placeholders[activeTab]} />
        </div>
      </main>

      <footer style={{
        textAlign: "center", padding: "8px", fontSize: "11px",
        color: "#333", borderTop: "1px solid #1a1a2e",
      }}>
        DissertAI · 专为在俄中国留学生设计 · Для китайских аспирантов в России
      </footer>
    </div>
  );
}
