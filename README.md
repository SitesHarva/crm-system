# CRM Programming School - бекенд

Це бекенд-частина CRM-системи.  
Проєкт зроблений згідно з технічним завданням: ролі admin/manager, пагінація, фільтри, ексель, активація менеджерів по посиланню тощо.

## Технології

- Node.js + Express
- TypeScript
- MongoDB (Atlas)
- JWT (access + refresh)
- Swagger для документації API
- Postman колекція

## Вимоги перед запуском

Node.js v18+ (або LTS)
- npm або yarn
- Обліковий запис MongoDB Atlas, або використовуй готовий URI
- Фронтенд (окремий репозиторій) - для повноцінної роботи, але API можна тестувати через Postman

##  Налаштування backend

1. **Клонуй репозиторій**

git clone <your-repo-url>
cd crm-backend

## Створи файл .env в корені проекту, скопіюй з .env.example або створи вручну

Приклад .env:

env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/crm_db?retryWrites=true&w=majority
JWT_SECRET=supersecretkey
JWT_REFRESH_SECRET=anothersecretkey
JWT_ACTIVATION_SECRET=activationsecret
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin



## Налаштування frontend

Відкрий новий термінал у папці frontend:

cd frontend
npm install

echo "VITE_API_URL=http://localhost:5000/api" > .env

Запуск фронтенду
npm run dev

Фронтенд буде доступний за адресою:
http://localhost:5173

## Ініціалізація бази даних
При першому запуску автоматично створиться:

Адмін з email: admin@gmail.com та паролем: admin
Необхідні колекції (orders, users, tokens, groups)
Тобі не потрібно нічого додатково імпортувати, адмін вже буде.

## Запуск
Режим розробки з автоперезавантаженням
npm run dev
Продакшн
npm run build
npm start
Сервер запуститься на http://localhost:5000 (або порту, який задав у .env)

## Використання
Відкрий http://localhost:5173 у браузері.

Авторизуйся за замовчуванням:

Email: admin@gmail.com
Пароль: admin

Після логіну потрапиш на сторінку заявок (/orders).
У хедері:
Для адміна доступна кнопка Admin Panel.

Кнопка Logout – вихід із системи.
 
## Документація API
Після запуску відкрий у браузері:

text
http://localhost:5000/api/docs
Там буде Swagger UI з усіма ендпоінтами.

## Postman колекція
Файл CRM System API.postman_collection.json лежить в корені репозиторію.

Щоб імпортувати:
Відкрий Postman
Натисни Import, вибери файл
У змінних колекції (baseUrl) встанови http://localhost:5000/api
Спочатку виконай запит Login (admin) - токени збережуться автоматично



## Ролі
Роль	Можливості
admin	Всі заявки, створення менеджерів, статистика, бан/анбан, генерація посилань активації
manager	Робота зі своїми заявками та заявками без менеджера, коментарі, редагування



## Примітки
Токен активації/відновлення живе 30 хвилин
Access token - 15 хвилин, refresh token -30 днів
Усі паролі хешуються bcrypt
Логи пишуться в logs/ (потрібно створити папку вручну або додати в .gitignore)
