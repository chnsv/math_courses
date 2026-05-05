import sqlite3

conn = sqlite3.connect('math_courses.db')
cursor = conn.cursor()

# Добавляем знак умножения (*) между числом и x
cursor.execute("UPDATE tasks SET question_text = REPLACE(question_text, '2x', '2*x') WHERE id = 1")
cursor.execute("UPDATE tasks SET question_text = REPLACE(question_text, '3x', '3*x') WHERE id = 2")

# Проверяем результат
cursor.execute("SELECT id, question_text FROM tasks WHERE id IN (1, 2)")
rows = cursor.fetchall()

print("Исправленные уравнения:")
for row in rows:
    print(f"  Задача {row[0]}: {row[1]}")

conn.commit()
conn.close()

print("\n✅ Уравнения исправлены! Теперь в них есть знак умножения (*)")