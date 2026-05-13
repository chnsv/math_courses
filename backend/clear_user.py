import sqlite3

conn = sqlite3.connect('math_courses.db')
cursor = conn.cursor()

# Удаляем всех пользователей
cursor.execute('DELETE FROM users')
cursor.execute('DELETE FROM user_courses')
cursor.execute('DELETE FROM teacher_courses')
cursor.execute('DELETE FROM task_attempts')

# Сбрасываем счетчик ID
try:
    cursor.execute('DELETE FROM sqlite_sequence WHERE name="users"')
except:
    pass

conn.commit()
print('✅ ВСЕ ПОЛЬЗОВАТЕЛИ УДАЛЕНЫ')

# Проверяем
cursor.execute('SELECT COUNT(*) FROM users')
count = cursor.fetchone()[0]
print(f'Осталось пользователей: {count}')

conn.close()