import sqlite3

conn = sqlite3.connect('math_courses.db')
cursor = conn.cursor()

cursor.execute('SELECT id, email, verification_token, email_verified FROM users')
rows = cursor.fetchall()

print('=== ПОЛЬЗОВАТЕЛИ ===')
for row in rows:
    token = row[2][:30] if row[2] else 'None'
    print(f'ID: {row[0]}, Email: {row[1]}, Токен: {token}..., Подтверждён: {row[3]}')

conn.close()