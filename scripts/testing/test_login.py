#!/usr/bin/env python3
"""
Login Diagnostic Script
Tests the login functionality and identifies issues
"""

import requests
import json
import sys

# Test configuration
API_BASE_URL = "http://localhost:8003/api"
TEST_USER = {
    "email": "test@example.com",
    "password": "test123",
    "role": "customer"
}

def test_health():
    """Test if backend is running"""
    print("=" * 60)
    print("1. Testing Backend Health...")
    print("=" * 60)
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        print(f"✅ Backend is running!")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.json()}")
        return True
    except requests.exceptions.ConnectionError:
        print(f"❌ Backend is NOT running on {API_BASE_URL}")
        print(f"   Please start the backend server:")
        print(f"   cd backend && python main.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_login():
    """Test login endpoint"""
    print("\n" + "=" * 60)
    print("2. Testing Login Endpoint...")
    print("=" * 60)
    print(f"   Attempting login with: {TEST_USER['email']}")
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            json=TEST_USER,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✅ Login successful!")
            data = response.json()
            print(f"   User: {data.get('user', {}).get('name', 'N/A')}")
            print(f"   Token: {data.get('token', 'N/A')[:30]}...")
            return True
        elif response.status_code == 401:
            print(f"❌ Login failed: Invalid credentials")
            print(f"   Response: {response.json()}")
            print(f"\n   💡 This user might not exist in the database.")
            print(f"   Try registering first or use existing credentials.")
            return False
        else:
            print(f"❌ Unexpected response")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return False

def test_register():
    """Test registration endpoint"""
    print("\n" + "=" * 60)
    print("3. Testing Registration (Creating Test User)...")
    print("=" * 60)
    
    test_register_data = {
        "name": "Test User",
        "email": TEST_USER["email"],
        "password": TEST_USER["password"],
        "role": TEST_USER["role"]
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/register",
            json=test_register_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200 or response.status_code == 201:
            print(f"✅ Registration successful!")
            print(f"   Response: {response.json()}")
            return True
        elif response.status_code == 400:
            data = response.json()
            if "already exists" in data.get("detail", "").lower():
                print(f"ℹ️  User already exists (this is OK)")
                return True
            else:
                print(f"❌ Registration failed: {data.get('detail')}")
                return False
        else:
            print(f"❌ Unexpected response")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during registration: {e}")
        return False

def test_database_connection():
    """Check database connection"""
    print("\n" + "=" * 60)
    print("4. Checking Database Connection...")
    print("=" * 60)
    
    try:
        import mysql.connector
        from dotenv import load_dotenv
        import os
        
        # Load environment variables
        load_dotenv('backend/.env')
        
        config = {
            'host': os.getenv('DB_HOST', '127.0.0.1'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'housecrew'),
        }
        
        print(f"   Connecting to: {config['user']}@{config['host']}/{config['database']}")
        
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        # Check if users table exists
        cursor.execute("SHOW TABLES LIKE 'users'")
        if cursor.fetchone():
            print(f"✅ Database connected successfully!")
            
            # Count users
            cursor.execute("SELECT COUNT(*) FROM users")
            count = cursor.fetchone()[0]
            print(f"   Total users in database: {count}")
            
            # Check for test user
            cursor.execute("SELECT id, name, email, role FROM users WHERE email = %s", (TEST_USER['email'],))
            user = cursor.fetchone()
            if user:
                print(f"   Test user exists: {user}")
            else:
                print(f"   Test user does NOT exist in database")
        else:
            print(f"❌ Users table does not exist!")
            
        cursor.close()
        connection.close()
        return True
        
    except ImportError:
        print(f"⚠️  mysql-connector-python not installed")
        print(f"   Install: pip install mysql-connector-python")
        return False
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def main():
    print("\n" + "🔍 HouseCrew Login Diagnostic Tool" + "\n")
    
    results = []
    
    # Run tests
    results.append(("Backend Health", test_health()))
    
    if results[0][1]:  # Only continue if backend is running
        results.append(("Database Connection", test_database_connection()))
        results.append(("User Registration", test_register()))
        results.append(("User Login", test_login()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 DIAGNOSTIC SUMMARY")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    # Recommendations
    print("\n" + "=" * 60)
    print("💡 RECOMMENDATIONS")
    print("=" * 60)
    
    if not results[0][1]:
        print("1. Start the backend server:")
        print("   cd backend")
        print("   python main.py")
    elif len(results) > 1 and not results[1][1]:
        print("1. Check database connection:")
        print("   - Ensure MySQL is running")
        print("   - Verify credentials in backend/.env")
        print("   - Check database 'housecrew' exists")
    elif len(results) > 3 and not results[3][1]:
        print("1. User credentials might be incorrect")
        print("2. Try registering a new user first")
        print("3. Check backend logs for errors")
    else:
        print("✅ All tests passed! Login should work.")
        print("\nIf you still can't login from the frontend:")
        print("1. Check browser console for errors (F12)")
        print("2. Verify frontend is running on http://localhost:5173")
        print("3. Check CORS errors in browser network tab")
        print("4. Clear browser cache and localStorage")

if __name__ == "__main__":
    main()
