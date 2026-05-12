import sqlite3

conn = sqlite3.connect('math_courses.db')
cursor = conn.cursor()

# Список учителей
cursor.execute("SELECT id, email, full_name, role FROM users WHERE role = 'teacher'")
teachers = cursor.fetchall()
print("\n=== УЧИТЕЛЯ ===")
for t in teachers:
    print(f"  ID: {t[0]}, Email: {t[1]}, Имя: {t[2]}")

# Список курсов
cursor.execute("SELECT id, title FROM courses")
courses = cursor.fetchall()
print("\n=== КУРСЫ ===")
for c in courses:
    print(f"  ID: {c[0]}, Название: {c[1]}")

# Назначенные курсы
cursor.execute('''
    SELECT u.id, u.email, c.id, c.title 
    FROM teacher_courses tc
    JOIN users u ON tc.teacher_id = u.id
    JOIN courses c ON tc.course_id = c.id
''')
assignments = cursor.fetchall()
print("\n=== НАЗНАЧЕННЫЕ КУРСЫ ===")
for a in assignments:
    print(f"  Учитель ID: {a[0]}, Email: {a[1]} -> Курс ID: {a[2]}, Название: {a[3]}")

conn.close()