# ReqTrace

Адаптивний вебінтерфейс системи управління вимогами та тест-кейсами до програмного забезпечення.

## Можливості

- реєстрація та вхід, ролі «Бізнес-аналітик» і «QA-інженер»;
- реєстр вимог: пошук, фільтри, сортування, створення та редагування;
- тест-кейси з покроковими сценаріями та привʼязкою до вимог;
- виконання тесту з фіксацією результату та історією прогонів;
- матриця трасування «вимоги - тест-кейси»;
- дашборд з покриттям і успішністю тестування;
- експорт у CSV, резервна копія та імпорт JSON;
- світла й темна теми, адаптивність від 320 px.

## Технології

React 19, Vite 7, CSS (custom properties, Grid, Flexbox, media queries), Node.js test runner.

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # модульні тести
npm run build    # збірка у dist/
npm run preview  # перегляд збірки
```

Потрібен Node.js 20.19+ або 22.12+.

## Демо-доступ

| Роль | E-mail | Пароль |
|---|---|---|
| Бізнес-аналітик | analyst@reqtrace.dev | Analyst#2026 |
| QA-інженер | tester@reqtrace.dev | Tester#2026 |

## Структура

```
src/
  components/   UI-компоненти (Modal, Field, Layout, форми)
  context/      AuthContext, DataContext, ToastContext
  hooks/        маршрутизація, тема, debounce
  pages/        сторінки застосунку
  services/     api, auth, storage, seed
  utils/        валідація, метрики, фільтри, експорт
  styles/       global.css
tests/          модульні тести
```
