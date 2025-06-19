#!/usr/bin/env python3
import sqlite3
import os

def check_users():
    """Проверка пользователей в базе данных"""
    if not os.path.exists('electronic_library.db'):
        print("База данных не найдена!")
        return
    
    try:
        conn = sqlite3.connect('electronic_library.db')
        cursor = conn.cursor()
        
        # Проверяем таблицы
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print("Таблицы в базе данных:")
        for table in tables:
            print(f"  - {table[0]}")
        
        print("\n" + "="*50)
        
        # Проверяем пользователей
        cursor.execute("""
            SELECT u.id, u.login, r.name as role 
            FROM users u 
            JOIN roles r ON u.role_id = r.id
        """)
        users = cursor.fetchall()
        
        print("Пользователи в базе данных:")
        if users:
            for user in users:
                print(f"  ID: {user[0]}, Login: {user[1]}, Role: {user[2]}")
        else:
            print("  Пользователи не найдены")
        
        conn.close()
        
    except Exception as e:
        print(f"Ошибка при проверке базы данных: {e}")

if __name__ == "__main__":
    check_users() 