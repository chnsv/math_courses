import sqlite3

conn = sqlite3.connect('math_courses.db')
cursor = conn.cursor()

# Получаем topic_id для подтемы id=12
cursor.execute("SELECT topic_id FROM theory_blocks WHERE id = 12")
result = cursor.fetchone()
if result:
    topic_id = result[0]
    print(f"Подтема id=12 имеет topic_id={topic_id}")

    # Шаблоны для линейных уравнений
    templates = [
        ("Линейное уравнение ax + b = c", "{a}x + {b} = {c}", "({c} - {b}) / {a}", 1),
        ("Линейное уравнение ax - b = c", "{a}x - {b} = {c}", "({c} + {b}) / {a}", 1),
        ("Линейное уравнение с x в обеих частях", "{a}x + {b} = {c}x + {d}", "({d} - {b}) / ({a} - {c})", 2),
        ("Уравнение со скобками", "{a}(x + {b}) = {c}", "({c} / {a}) - {b}", 2),
        ("Простое уравнение x = a", "x = {a}", "{a}", 1),
        ("Уравнение x + a = b", "x + {a} = {b}", "{b} - {a}", 1),
        ("Уравнение x - a = b", "x - {a} = {b}", "{b} + {a}", 1),
    ]

    added = 0
    for title, template_text, answer_template, difficulty in templates:
        cursor.execute("""
            INSERT INTO question_templates 
            (topic_id, theory_block_id, title, template_text, answer_template, difficulty)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (topic_id, 12, title, template_text, answer_template, difficulty))
        added += 1
        print(f"Добавлен: {title}")

    conn.commit()
    print(f"\nДобавлено {added} шаблонов для подтемы 'Линейные уравнения'")
else:
    print("Подтема с id=12 не найдена!")

# Проверяем результат
cursor.execute("SELECT COUNT(*) FROM question_templates WHERE theory_block_id = 12")
count = cursor.fetchone()[0]
print(f"Теперь в подтеме id=12 шаблонов: {count}")

conn.close()