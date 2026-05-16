import sqlite3

conn = sqlite3.connect('math_courses.db')
cursor = conn.cursor()

# ПРАВИЛЬНЫЕ ID ПОДТЕМ (из вашего вывода)
addition_id = 9  # Сложение и вычитание натуральных чисел
multiplication_id = 10  # Умножение и деление натуральных чисел

# Получим topic_id
cursor.execute("SELECT topic_id FROM theory_blocks WHERE id = ?", (addition_id,))
result = cursor.fetchone()
if not result:
    print(f"Подтема с ID {addition_id} не найдена!")
    exit()
topic_id = result[0]
print(f"ID темы: {topic_id}")

# Удаляем все старые шаблоны для этих подтем
cursor.execute("DELETE FROM question_templates WHERE theory_block_id IN (?, ?)", (addition_id, multiplication_id))
print("Старые шаблоны удалены")

# Новые шаблоны с правильным LaTeX
templates = [
    # Подтема: Сложение и вычитание
    (addition_id, 'Сложение двух чисел', '$${a} + {b}$$', '{a}+{b}', 1),
    (addition_id, 'Вычитание двух чисел', '$${a} - {b}$$', '{a}-{b}', 1),
    (addition_id, 'Сложение трёх чисел', '$${a} + {b} + {c}$$', '{a}+{b}+{c}', 2),
    (addition_id, 'Нахождение неизвестного слагаемого', '$$x + {a} = {b}$$', '{b}-{a}', 2),
    (addition_id, 'Нахождение неизвестного уменьшаемого', '$$x - {a} = {b}$$', '{a}+{b}', 2),
    (addition_id, 'Нахождение неизвестного вычитаемого', '$${a} - x = {b}$$', '{a}-{b}', 2),

    # Подтема: Умножение и деление
    (multiplication_id, 'Умножение двух чисел', '$${a} \\times {b}$$', '{a}*{b}', 1),
    (multiplication_id, 'Деление двух чисел', '$${a} \\div {b}$$', '{a}/{b}', 1),
    (multiplication_id, 'Умножение на 10', '$${a} \\times 10$$', '{a}*10', 1),
    (multiplication_id, 'Деление на 10', '$${a} \\div 10$$', '{a}/10', 1),
    (multiplication_id, 'Умножение двузначных', '$${a} \\times {b}$$', '{a}*{b}', 2),
    (multiplication_id, 'Деление с остатком', '$${a} \\div {b}$$', '{a}//{b}', 2),
    (multiplication_id, 'Нахождение неизвестного множителя', '$${a} \\times x = {b}$$', '{b}/{a}', 2),
    (multiplication_id, 'Нахождение неизвестного делимого', '$$x \\div {a} = {b}$$', '{a}*{b}', 2),
    (multiplication_id, 'Нахождение неизвестного делителя', '$${a} \\div x = {b}$$', '{a}/{b}', 2),
    (multiplication_id, 'Умножение трёх чисел', '$${a} \\times {b} \\times {c}$$', '{a}*{b}*{c}', 3),
]

for theory_block_id, title, template_text, answer_template, difficulty in templates:
    cursor.execute("""
        INSERT INTO question_templates (topic_id, theory_block_id, title, template_text, answer_template, difficulty)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (topic_id, theory_block_id, title, template_text, answer_template, difficulty))
    print(f"Добавлен: {title}")

conn.commit()
conn.close()
print(f"\nГотово! Добавлено {len(templates)} шаблонов")