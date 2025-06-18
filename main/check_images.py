import sqlite3

# Подключение к базе данных
conn = sqlite3.connect('electronic_library.db')
cursor = conn.cursor()

# Проверяем обложки
print("=== ОБЛОЖКИ В БАЗЕ ДАННЫХ ===")
cursor.execute('SELECT * FROM book_covers')
covers = cursor.fetchall()
for cover in covers:
    print(f"ID: {cover[0]}, Файл: {cover[1]}, Книга ID: {cover[4]}")

# Проверяем книги с обложками
print("\n=== КНИГИ С ОБЛОЖКАМИ ===")
cursor.execute('''
    SELECT b.id, b.title, bc.filename 
    FROM books b 
    LEFT JOIN book_covers bc ON b.id = bc.book_id
    ORDER BY b.id
''')
books = cursor.fetchall()
for book in books:
    print(f"Книга ID: {book[0]}, Название: {book[1]}, Обложка: {book[2] or 'НЕТ'}")

conn.close() 