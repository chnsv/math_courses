import sqlite3
import json

conn = sqlite3.connect('math_courses.db')
cursor = conn.cursor()

# Добавляем задачу с параметрами для генерации вариантов
# Шаблон: {a}*x + {b} = {c}
# Параметры: a от 2 до 5, b от 1 до 10, c от 10 до 30
task_data = {
    'topic_id': 2,
    'type': 'equation',
    'question_text': '{a}*x + {b} = {c}',
    'correct_answer': '(c - b)/a',
    'solution_explanation': 'Переносим {b} в правую часть: {a}*x = {c} - {b} = {c-b}, делим на {a}: x = {c-b}/{a} = {answer}',
    'difficulty': 2,
    'parameters': json.dumps({
        'a': {'min': 2, 'max': 5, 'type': 'integer'},
        'b': {'min': 1, 'max': 10, 'type': 'integer'},
        'c': {'min': 10, 'max': 30, 'type': 'integer'}
    }),
    'order_index': 5
}

cursor.execute('''
INSERT INTO tasks (topic_id, type, question_text, correct_answer, solution_explanation, difficulty, parameters, order_index)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
''', (
    task_data['topic_id'], task_data['type'], task_data['question_text'],
    task_data['correct_answer'], task_data['solution_explanation'],
    task_data['difficulty'], task_data['parameters'], task_data['order_index']
))

task_id = cursor.lastrowid
print(f"✅ Добавлена задача с генерацией вариантов (ID: {task_id})")

conn.commit()
conn.close()