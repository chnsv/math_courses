import sqlite3
import requests
import json

# Проверяем, есть ли пользователи в БД
conn = sqlite3.connect('math_courses.db')
cursor = conn.cursor()
cursor.execute('SELECT id, email, verification_token, email_verified FROM users')
rows = cursor.fetchall()
print('=== ПОЛЬЗОВАТЕЛИ ДО РЕГИСТРАЦИИ ===')
for row in rows:
    print(f'ID: {row[0]}, Email: {row[1]}, Подтверждён: {row[3]}')
conn.close()

# Отправляем запрос на регистрацию
url = "http://localhost:8081/api/v1/auth/register"
data = {
    "email": "test_debug@yandex.ru",
    "password": "123456",
    "full_name": "Тест Отладка",
    "role": "student"
}

print(f'\n=== ОТПРАВКА ЗАПРОСА ===')
print(f'URL: {url}')
print(f'Data: {data}')

try:
    response = requests.post(url, json=data)
    print(f'\n=== ОТВЕТ ===')
    print(f'Status: {response.status_code}')
    print(f'Body: {response.text}')
except Exception as e:
    print(f'Ошибка: {e}')

# Проверяем БД после регистрации
conn = sqlite3.connect('math_courses.db')
cursor = conn.cursor()
cursor.execute('SELECT id, email, verification_token, email_verified FROM users')
rows = cursor.fetchall()
print(f'\n=== ПОЛЬЗОВАТЕЛИ ПОСЛЕ РЕГИСТРАЦИИ ===')
for row in rows:
    print(f'ID: {row[0]}, Email: {row[1]}, Токен: {row[2][:20] if row[2] else "None"}..., Подтверждён: {row[3]}')
conn.close()