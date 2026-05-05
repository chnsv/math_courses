import sqlite3

# Подключаемся к базе данных
conn = sqlite3.connect('math_courses.db')
cursor = conn.cursor()

# Удаляем старые данные (чтобы не было дублей)
cursor.execute("DELETE FROM topics")
cursor.execute("DELETE FROM tasks")
cursor.execute("DELETE FROM theory_blocks")
cursor.execute("DELETE FROM test_options")
cursor.execute("DELETE FROM task_attempts")

# Создаем корневую тему (Алгебра)
cursor.execute('''
INSERT INTO topics (id, title, description, parent_id, order_index)
VALUES (1, 'Алгебра', 'Раздел алгебры для подготовки к ЕГЭ', NULL, 1)
''')

# Создаем подтему (Линейные уравнения)
cursor.execute('''
INSERT INTO topics (id, title, description, parent_id, order_index)
VALUES (2, 'Линейные уравнения', 'Решение линейных уравнений вида ax + b = c', 1, 1)
''')

# Добавляем теорию
cursor.execute('''
INSERT INTO theory_blocks (topic_id, title, content, order_index)
VALUES (2, 'Что такое линейное уравнение', 
'<p>Уравнение вида <strong>ax + b = c</strong> называется линейным.</p>
<p>Чтобы его решить:</p>
<ol>
<li>Перенести <strong>b</strong> в правую часть: <strong>ax = c - b</strong></li>
<li>Разделить обе части на <strong>a</strong>: <strong>x = (c - b) / a</strong></li>
</ol>
<p>Пример: 2x + 5 = 13 → 2x = 8 → x = 4</p>', 1)
''')

# Добавляем задачи
# Задача 1: линейное уравнение (простое)
cursor.execute('''
INSERT INTO tasks (id, topic_id, type, question_text, correct_answer, solution_explanation, difficulty, order_index)
VALUES (1, 2, 'equation', 'Решите уравнение: 2x + 5 = 13', 'x=4', 'Переносим 5 в правую часть: 2x = 8, делим на 2: x = 4', 1, 1)
''')

# Задача 2: линейное уравнение (с отрицательным числом)
cursor.execute('''
INSERT INTO tasks (id, topic_id, type, question_text, correct_answer, solution_explanation, difficulty, order_index)
VALUES (2, 2, 'equation', 'Решите уравнение: 3x - 7 = 11', 'x=6', 'Переносим -7 в правую часть: 3x = 18, делим на 3: x = 6', 2, 2)
''')

# Задача 3: числовая задача
cursor.execute('''
INSERT INTO tasks (id, topic_id, type, question_text, correct_answer, solution_explanation, difficulty, order_index)
VALUES (3, 2, 'numeric', 'Решите уравнение: 5x = 25. Введите значение x.', '5', 'x = 25/5 = 5', 1, 3)
''')

# Задача 4: тестовое задание
cursor.execute('''
INSERT INTO tasks (id, topic_id, type, question_text, correct_answer, solution_explanation, difficulty, order_index)
VALUES (4, 2, 'test', 'Чему равен корень уравнения 4x = 32?', '8', 'x = 32/4 = 8', 1, 4)
''')

# Добавляем варианты ответов для тестового задания
cursor.execute('''
INSERT INTO test_options (task_id, option_text, is_correct, order_index)
VALUES (4, 'x = 4', 0, 1)
''')
cursor.execute('''
INSERT INTO test_options (task_id, option_text, is_correct, order_index)
VALUES (4, 'x = 6', 0, 2)
''')
cursor.execute('''
INSERT INTO test_options (task_id, option_text, is_correct, order_index)
VALUES (4, 'x = 8', 1, 3)
''')
cursor.execute('''
INSERT INTO test_options (task_id, option_text, is_correct, order_index)
VALUES (4, 'x = 10', 0, 4)
''')

# Сохраняем изменения
conn.commit()
conn.close()

print("✅ База данных успешно заполнена!")
print("Добавлены:")
print("- Тема: Алгебра")
print("- Подтема: Линейные уравнения")
print("- Теория: 1 блок")
print("- Задачи: 4 штуки (2 уравнения, 1 числовая, 1 тест)")