#!/usr/bin/env python3
"""
Скрипт для проверки ID в базе данных
"""

import sqlite3
import os

DATABASE = 'electronic_library.db'

def check_database_ids():
    """Проверяет ID в базе данных"""
    if not os.path.exists(DATABASE):
        print("База данных не найдена!")
        return
    
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    print("=== Проверка ID в базе данных ===\n")
    
    # Проверяем счетчики автоинкремента
    try:
        cursor.execute("SELECT name, seq FROM sqlite_sequence")
        sequences = cursor.fetchall()
        
        print("Счетчики автоинкремента:")
        for name, seq in sequences:
            print(f"  {name}: {seq}")
    except sqlite3.OperationalError:
        print("Счетчики автоинкремента: таблица sqlite_sequence не существует")
    
    print("\n" + "="*50 + "\n")
    
    # Проверяем ID книг
    try:
        cursor.execute("SELECT id, title FROM books ORDER BY id")
        books = cursor.fetchall()
        
        print("ID книг:")
        for book_id, title in books:
            print(f"  {book_id}: {title}")
    except sqlite3.OperationalError:
        print("ID книг: таблица books не существует")
    
    print("\n" + "="*50 + "\n")
    
    # Проверяем ID пользователей
    try:
        cursor.execute("SELECT id, login, first_name, last_name FROM users ORDER BY id")
        users = cursor.fetchall()
        
        print("ID пользователей:")
        for user_id, login, first_name, last_name in users:
            print(f"  {user_id}: {login} ({first_name} {last_name})")
    except sqlite3.OperationalError:
        print("ID пользователей: таблица users не существует")
    
    print("\n" + "="*50 + "\n")
    
    # Проверяем ID жанров
    try:
        cursor.execute("SELECT id, name FROM genres ORDER BY id")
        genres = cursor.fetchall()
        
        print("ID жанров:")
        for genre_id, name in genres:
            print(f"  {genre_id}: {name}")
    except sqlite3.OperationalError:
        print("ID жанров: таблица genres не существует")
    
    conn.close()

if __name__ == '__main__':
    check_database_ids() 