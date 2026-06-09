# DissertAI 🎓
**AI-ассистент для китайских аспирантов в России · 论文助手**

Использует DeepSeek-V3 — умная и дешёвая модель с отличным знанием китайского языка.

---

## 🚀 Деплой на Vercel (бесплатно, 10 минут)

### Шаг 1 — Получите DeepSeek API ключ
1. Зайдите на [platform.deepseek.com](https://platform.deepseek.com)
2. Зарегистрируйтесь → **API Keys** → **Create new secret key**
3. Скопируйте ключ (начинается с `sk-...`)
4. Пополните баланс — от $2, хватит на тысячи запросов

### Шаг 2 — Загрузите код на GitHub
1. Зайдите на [github.com](https://github.com) → **New repository**
2. Назовите репозиторий `dissertation-ai` → **Create repository**
3. Загрузите все файлы этой папки в репозиторий

### Шаг 3 — Задеплойте на Vercel
1. Зайдите на [vercel.com](https://vercel.com) → войдите через GitHub
2. Нажмите **Add New → Project**
3. Выберите ваш репозиторий `dissertation-ai` → **Import**
4. Нажмите **Deploy** (настройки менять не нужно)

### Шаг 4 — Добавьте API ключ
1. В Vercel откройте ваш проект → **Settings → Environment Variables**
2. Добавьте переменную:
   - **Name:** `DEEPSEEK_API_KEY`
   - **Value:** `sk-ваш-ключ-здесь`
3. Нажмите **Save** → затем **Deployments → Redeploy**

✅ Готово! Ваш сайт доступен по адресу `https://dissertation-ai-xxx.vercel.app`

---

## 💻 Локальный запуск (для разработки)

```bash
# 1. Установите зависимости
npm install

# 2. Создайте файл .env.local и добавьте ключ
echo "DEEPSEEK_API_KEY=sk-ваш-ключ" > .env.local

# 3. Запустите
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173)

---

## 📁 Структура проекта

```
dissertation-ai/
├── api/
│   └── chat.js          # Серверный прокси — скрывает API ключ
├── src/
│   ├── App.jsx          # Главный компонент
│   └── main.jsx         # Точка входа React
├── index.html
├── package.json
└── vite.config.js
```

## 🔧 Модули

| Модуль | Описание |
|--------|----------|
| 🔍 Поиск литературы | Находит источники на RU и ZH, рекомендует базы данных |
| 📋 План диссертации | Структура по требованиям ВАК с временным графиком |
| 🌐 Перевод | RU ↔ ZH с сохранением академического стиля |
| 📐 ГОСТ | Справочник по оформлению с примерами |
