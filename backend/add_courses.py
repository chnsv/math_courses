import sqlite3

conn = sqlite3.connect('math_courses.db')
cursor = conn.cursor()

# Создаём таблицу курсов (если ещё нет)
cursor.execute('''
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

# Добавляем курсы
courses = [
    ('Математика 5-6 класс', 'Базовый курс для младших школьников', 'math-5-6', 1),
    ('Алгебра 7-8 класс', 'Изучение выражений, уравнений, функций', 'algebra-7-8', 2),
    ('Геометрия 7-8 класс', 'Фигуры, теоремы, доказательства', 'geometry-7-8', 3),
    ('Подготовка к ОГЭ', 'Подготовка к Основному государственному экзамену', 'oge', 4),
    ('Подготовка к ЕГЭ', 'Подготовка к Единому государственному экзамену', 'ege', 5),
]

for title, desc, slug, order in courses:
    cursor.execute('''
    INSERT OR REPLACE INTO courses (title, description, slug, order_index)
    VALUES (?, ?, ?, ?)
    ''', (title, desc, slug, order))

conn.commit()
conn.close()

print("Курсы добавлены!")