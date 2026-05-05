import sqlite3

conn = sqlite3.connect('math_courses.db')
cursor = conn.cursor()

cursor.execute("UPDATE tasks SET question_text = REPLACE(question_text, 'Решите уравнение: ', '') WHERE type = 'equation'")

cursor.execute("SELECT id, question_text FROM tasks WHERE type = 'equation'")
rows = cursor.fetchall()

print("Исправленные уравнения:")
for row in rows:
    print(f"  Задача {row[0]}: {row[1]}")

conn.commit()
conn.close()

print("\n✅ Данные исправлены!")