#!/usr/bin/env python3
import sqlite3
import os
from werkzeug.security import generate_password_hash

def init_admin_only():
    """Инициализация базы данных только с администраторами"""
    print("Инициализация базы данных только с администраторами...")
    
    # Удаляем существующую базу данных
    if os.path.exists('electronic_library.db'):
        os.remove('electronic_library.db')
        print("Старая база данных удалена")
    
    conn = sqlite3.connect('electronic_library.db')
    db = conn.cursor()

    # Создание таблиц
    db.executescript('''
        -- Таблица ролей
        CREATE TABLE roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL
        );

        -- Таблица пользователей
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            login TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            last_name TEXT NOT NULL,
            first_name TEXT NOT NULL,
            middle_name TEXT,
            role_id INTEGER NOT NULL,
            FOREIGN KEY (role_id) REFERENCES roles(id)
        );

        -- Таблица жанров
        CREATE TABLE genres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );

        -- Таблица книг
        CREATE TABLE books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            short_description TEXT NOT NULL,
            publication_year INTEGER NOT NULL,
            publisher TEXT NOT NULL,
            author TEXT NOT NULL,
            page_count INTEGER NOT NULL
        );

        -- Связующая таблица книги-жанры
        CREATE TABLE book_genres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            genre_id INTEGER NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            FOREIGN KEY (genre_id) REFERENCES genres(id),
            UNIQUE(book_id, genre_id)
        );

        -- Таблица обложек
        CREATE TABLE book_covers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            md5_hash TEXT NOT NULL UNIQUE,
            book_id INTEGER NOT NULL,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        );

        -- Таблица статусов рецензий
        CREATE TABLE review_statuses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );

        -- Таблица рецензий
        CREATE TABLE reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status_id INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (status_id) REFERENCES review_statuses(id),
            UNIQUE(user_id, book_id)
        );

        -- Таблица истории посещений
        CREATE TABLE visit_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            book_id INTEGER NOT NULL,
            visit_date DATE NOT NULL,
            visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            visit_count INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            UNIQUE(user_id, book_id, visit_date)
        );
    ''')

    # Вставка базовых данных
    db.execute("INSERT INTO roles (name, description) VALUES (?, ?)",
               ('administrator', 'Суперпользователь, имеет полный доступ к системе'))
    db.execute("INSERT INTO roles (name, description) VALUES (?, ?)",
               ('moderator', 'Может редактировать данные книг и производить модерацию рецензий'))
    db.execute("INSERT INTO roles (name, description) VALUES (?, ?)",
               ('user', 'Может оставлять рецензии'))

    db.execute("INSERT INTO review_statuses (name) VALUES (?)", ('pending',))
    db.execute("INSERT INTO review_statuses (name) VALUES (?)", ('approved',))
    db.execute("INSERT INTO review_statuses (name) VALUES (?)", ('rejected',))

    # Базовые жанры
    genres = ['Фантастика', 'Детектив', 'Роман', 'Классическая литература',
              'Поэзия', 'Драма', 'Приключения', 'Биография', 'История',
              'Научная литература', 'Психология', 'Философия']
    for genre in genres:
        db.execute("INSERT INTO genres (name) VALUES (?)", (genre,))

    # Только администраторы
    password_hash = generate_password_hash('password')

    db.execute("""INSERT INTO users 
                  (login, password_hash, last_name, first_name, middle_name, role_id) 
                  VALUES (?, ?, ?, ?, ?, ?)""",
               ('admin', password_hash, 'Администратор', 'Системный', 'Главный', 1))

    db.execute("""INSERT INTO users 
                  (login, password_hash, last_name, first_name, middle_name, role_id) 
                  VALUES (?, ?, ?, ?, ?, ?)""",
               ('moderator', password_hash, 'Модератор', 'Главный', 'Контентный', 2))

    conn.commit()
    conn.close()
    
    print("✅ База данных успешно инициализирована только с администраторами!")
    print("Доступные пользователи:")
    print("  - admin (password) - администратор")
    print("  - moderator (password) - модератор")
    print("База данных пустая - книг нет")

if __name__ == "__main__":
    init_admin_only() 