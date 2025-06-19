import sqlite3
import os
import hashlib

def get_file_md5(file_path):
    """Получение MD5 хеша файла"""
    with open(file_path, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def fix_book_covers():
    """Восстановление связей между книгами и обложками"""
    conn = sqlite3.connect('electronic_library.db')
    cursor = conn.cursor()
    
    # Получаем все книги
    cursor.execute('SELECT id, title FROM books ORDER BY id')
    books = cursor.fetchall()
    
    # Получаем все файлы изображений
    uploads_dir = 'static/uploads'
    image_files = []
    if os.path.exists(uploads_dir):
        for filename in os.listdir(uploads_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                image_files.append(filename)
    
    print(f"Найдено {len(image_files)} файлов изображений")
    print(f"Найдено {len(books)} книг")
    
    # Создаем связи между книгами и изображениями
    for i, book in enumerate(books):
        if i < len(image_files):
            image_file = image_files[i]
            image_path = os.path.join(uploads_dir, image_file)
            
            # Получаем MD5 хеш файла
            file_md5 = get_file_md5(image_path)
            
            # Определяем MIME тип
            mime_type = 'image/png' if image_file.lower().endswith('.png') else 'image/jpeg'
            
            try:
                # Проверяем, есть ли уже такая запись
                cursor.execute('SELECT id FROM book_covers WHERE book_id = ?', (book[0],))
                existing = cursor.fetchone()
                
                if existing:
                    # Обновляем существующую запись
                    cursor.execute('''
                        UPDATE book_covers 
                        SET filename = ?, mime_type = ?, md5_hash = ?
                        WHERE book_id = ?
                    ''', (image_file, mime_type, file_md5, book[0]))
                    print(f"Обновлена обложка для книги '{book[1]}' -> {image_file}")
                else:
                    # Создаем новую запись
                    cursor.execute('''
                        INSERT INTO book_covers (filename, mime_type, md5_hash, book_id)
                        VALUES (?, ?, ?, ?)
                    ''', (image_file, mime_type, file_md5, book[0]))
                    print(f"Добавлена обложка для книги '{book[1]}' -> {image_file}")
                    
            except Exception as e:
                print(f"Ошибка при обработке книги '{book[1]}': {e}")
    
    conn.commit()
    conn.close()
    print("Восстановление связей завершено!")

if __name__ == "__main__":
    fix_book_covers() 