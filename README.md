# Ranobe Reader

Онлайн-читалка ранобэ и веб-новелл с современным анимированным дизайном: тёмная/светлая тема,
удобная читалка с настройками, закладки, рейтинги, отзывы и премиум-подписка с оплатой
криптовалютой через [@CryptoBot](https://t.me/CryptoBot) (Crypto Pay API).

## Стек

- **Next.js 14** (App Router) + **TypeScript** (strict)
- **Tailwind CSS** + свои UI-компоненты в духе shadcn/ui (Radix UI под капотом) + `tailwindcss-animate`
- **Framer Motion** — анимации (hero, карточки, 3D-tilt обложек, переходы, читалка, оплата)
- **Prisma** + **SQLite** для разработки (легко переключить на PostgreSQL — см. ниже)
- Собственная JWT-авторизация (**jose** + httpOnly cookie), пароли — **bcryptjs**
- **Zustand** — настройки читалки (persist в localStorage)
- **@tanstack/react-query** — серверное состояние на клиенте
- **CryptoBot (Crypto Pay API)** — оплата подписки в USDT/TON

## Быстрый старт

```bash
npm install
cp .env.example .env      # заполните при необходимости (по умолчанию уже готово к запуску)
npx prisma migrate dev    # создаст prisma/dev.db по схеме
npm run db:seed           # демо-данные: ранобэ, главы, жанры, тестовые пользователи
npm run dev
```

Откройте http://localhost:3000.

Тестовые аккаунты (создаются сидом):

| Email | Пароль |
|---|---|
| demo@example.com | password123 |
| reader@example.com | password123 |

> Если `npx prisma migrate dev` недоступен в вашем окружении (например, корпоративная песочница
> блокирует запуск нативных бинарников), используйте `npm run db:push` как альтернативу.

## Переменные окружения

См. `.env.example`. Ключевые:

- `DATABASE_URL` — по умолчанию `file:./dev.db` (SQLite). Для продакшена смените
  `provider = "sqlite"` на `"postgresql"` в `prisma/schema.prisma` и укажите строку подключения —
  модели данных менять не нужно.
- `JWT_SECRET` — секрет для подписи сессионных JWT. Сгенерируйте: `openssl rand -base64 32`.
- `CRYPTOBOT_API_TOKEN` — токен приложения из `@CryptoBot` → *Crypto Pay* → *My Apps* → *Create App*.
- `CRYPTOBOT_TESTNET=true` — использовать тестовую сеть (`@CryptoTestnetBot`), пока не готовы принимать реальные платежи.
- `SMTP_*` — опционально, для писем восстановления пароля. Без них ссылка на сброс пароля
  просто печатается в консоль сервера (удобно для разработки).

## Настройка CryptoBot

1. Откройте [@CryptoBot](https://t.me/CryptoBot) → *Crypto Pay* → *My Apps* → *Create App*.
2. Скопируйте API-токен в `CRYPTOBOT_API_TOKEN`.
3. В настройках приложения укажите webhook URL: `https://ваш-домен/api/cryptobot/webhook`
   (для локальной разработки — через туннель типа ngrok; либо полагайтесь на встроенный
   поллинг статуса счёта, который работает и без вебхука, см. `src/app/api/subscription/status`).
4. Тарифы и цены редактируются в `src/lib/plans.ts`.

Проверка подписи вебхука реализована по официальной схеме Crypto Pay API: HMAC-SHA256 от
сырого тела запроса с ключом `sha256(CRYPTOBOT_API_TOKEN)` (см. `src/lib/cryptobot.ts`).

## Структура проекта

```
prisma/
  schema.prisma        # модели БД
  seed.mjs             # демо-данные + генерация SVG-обложек
src/
  app/
    (main)/            # лендинг, каталог, страница ранобэ, профиль, подписка (с навбаром)
    (auth)/            # вход, регистрация, восстановление пароля (свой минимальный layout)
    reader/[slug]/[chapterNumber]/  # читалка (без навбара — полноэкранный режим чтения)
    api/               # route-хендлеры: auth, novels, subscription, cryptobot, profile...
  components/
    ui/                # базовые компоненты (button, dialog, slider, select...)
    landing/ novel/ catalog/ reader/ subscription/ profile/ layout/
  lib/                 # auth, jwt, prisma, cryptobot, plans, payments, queries, validations...
  hooks/               # use-reader-settings (zustand), use-current-user, use-auth-actions...
```

## Что реализовано

- Тёмная/светлая тема (next-themes, сохраняется в localStorage), aurora-фон на лендинге,
  скролл-анимации, hover-эффекты, 3D-tilt обложек, skeleton-загрузка, ripple на кнопках
- Каталог с поиском, фильтрами (жанр/статус/год) и сортировкой (популярность/новизна/рейтинг/название)
- Страница ранобэ: обложка, жанры, рейтинг, список глав, отзывы с оценкой, закладка
- Читалка: размер и семейство шрифта, межстрочный интервал, ширина колонки, тема
  день/ночь/сепия, автосохранение позиции (localStorage + сервер для авторизованных),
  прогресс-бар, горячие клавиши ←/→ между главами, комментарии к главе
- Личный кабинет: закладки (с экспортом/импортом JSON), история чтения, настройки профиля
- Регистрация/вход по email+паролю (bcrypt, JWT в httpOnly cookie), восстановление пароля
- Премиум-подписка: тарифы месяц/год/навсегда, оплата в USDT/TON через CryptoBot,
  QR-код, таймер счёта, поллинг статуса + вебхук, анимация успеха с конфетти
- SEO: метатеги, sitemap.xml, robots.txt, PWA-манифест

## Осознанные упрощения / точки расширения

- **OAuth (Google, Telegram Login)** не реализован — в ТЗ отмечен как опциональный. Схема БД
  и `src/lib/auth.ts` спроектированы так, чтобы добавить провайдер без переделки остального.
- **PWA** ограничен манифестом (устанавливаемость); офлайн-кеш через service worker не подключён.
- Комментарии к главам — плоские (без вложенных ответов) ради простоты.
- Пароли хешируются `bcryptjs` (чистый JS) вместо нативного `bcrypt` — то же самое
  по крипто-стойкости, но без нативной сборки, что упрощает установку на любой платформе.
