# MathCourses

Образовательная платформа для изучения математики с автоматической проверкой решений, генерацией вариантов контрольных работ и личными кабинетами для учеников, учителей и администраторов.

---

## Технологии

### Backend
- Python 3.11+
- FastAPI
- SQLAlchemy
- SQLite
- SymPy
- Uvicorn

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Axios
- MathJax

---

## Требования

- Python 3.11 или выше
- Node.js 18 или выше
- npm

---

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/chnsv/math_courses.git
cd math_courses
```

### 2. Настройка Backend

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

### 3. Настройка Frontend

cd frontend
npm install

### 4. Инициализация базы данных

База данных SQLite (math_courses.db) создаётся автоматически при первом запуске. Если необходимо создать вручную:

cd backend
python -c "from app.database import engine, Base; from app.models import *; Base.metadata.create_all(bind=engine)"

### 5. Добавление шаблонов заданий (опционально)

cd backend
python baza_shablonov.py
python shablon.py

### Запуск проекта

### Запуск Backend

cd backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8083

Backend доступен по адресу: http://localhost:8083

Документация API: http://localhost:8083/docs

### Запуск Frontend

cd frontend
npm run dev -- --host 0.0.0.0

Frontend доступен по адресу: http://localhost:5173

### Тестовые аккаунты

Роль	Email	Пароль
Администратор	chernyshova.nika0303@yandex.ru	admin
Учитель	 fdayana2@yandex.ru	dayana
Учитель  innesagrigonite@yandex.ru  innesa
Ученик	kirillberlov@yandex.ru	kirill
Ученик  maximmishustov@yandex.ru  maxim
Ученик  s.dyom14@yandex.ru  sergey