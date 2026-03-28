#!/usr/bin/env python3
import mysql.connector
from mysql.connector import Error

def query_user_email():
    try:
        # Connect to MySQL database
        connection = mysql.connector.connect(
            host='127.0.0.1',
            user='root',
            password='',
            database='housecrew'
        )
        
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            
            # Query for the specific email
            cursor.execute("SELECT name, email, password, role, phone, skill, city FROM users WHERE email = %s", ('bhanuasati13@gmail.com',))
            user = cursor.fetchone()
            
            if user:
                print(f"User found:")
                print(f"Name: {user['name']}")
                print(f"Email: {user['email']}")
                print(f"Password (hash): {user['password']}")
                print(f"Role: {user['role']}")
                print(f"Phone: {user['phone']}")
                print(f"Skill: {user['skill']}")
                print(f"City: {user['city']}")
            else:
                print("User with email 'bhanuasati13@gmail.com' not found in database.")
                
                # Show all users to help identify
                cursor.execute("SELECT name, email, role FROM users")
                all_users = cursor.fetchall()
                print(f"\nAll users in database ({len(all_users)}):")
                for user in all_users:
                    print(f"- {user['name']} ({user['email']}) - Role: {user['role']}")
            
            cursor.close()
            connection.close()
            
    except Error as e:
        print(f"Error connecting to MySQL: {e}")

if __name__ == "__main__":
    query_user_email()
