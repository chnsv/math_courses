import sqlite3

conn = sqlite3.connect('math_courses.db')
cursor = conn.cursor()

cursor.execute("DELETE FROM users")
print(f"Удалено пользователей: {cursor.rowcount}")

try:
    cursor.execute("DELETE FROM sqlite_sequence WHERE name='users'")
    print("Счётчик ID сброшен")
except sqlite3.OperationalError:
    print("ℹТаблица sqlite_sequence не найдена (это нормально)")

try:
    cursor.execute("UPDATE sqlite_sequence SET seq = 0 WHERE name = 'users'")
except:
    pass

conn.commit()
conn.close()

print("База данных очищена, все пользователи удалены")