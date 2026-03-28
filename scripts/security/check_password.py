#!/usr/bin/env python3
import hashlib
import mysql.connector
from mysql.connector import Error

def check_password_hash():
    # The hash from database: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
    db_hash = "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
    
    # Check if it's SHA256 (64 characters) - the hash appears to be 64 chars
    print(f"Database hash length: {len(db_hash)}")
    print(f"Database hash: {db_hash}")
    
    # Try common passwords
    common_passwords = [
        "password", "123456", "12345678", "admin", "hello", "test", "user",
        "password123", "admin123", "123456789", "qwerty", "abc123",
        "bhanu", "asati", "bhanu123", "asati123", "test123", "demo"
    ]
    
    print("\nTrying common passwords with SHA256:")
    for password in common_passwords:
        sha256_hash = hashlib.sha256(password.encode()).hexdigest()
        if sha256_hash == db_hash:
            print(f"✓ Found match! Password: '{password}'")
            return password
        print(f"'{password}' -> {sha256_hash[:16]}...")
    
    print("\nTrying common passwords with MD5:")
    for password in common_passwords:
        md5_hash = hashlib.md5(password.encode()).hexdigest()
        if md5_hash == db_hash:
            print(f"✓ Found match! Password: '{password}'")
            return password
        print(f"'{password}' -> {md5_hash[:16]}...")
    
    print("\nTrying some specific patterns:")
    test_passwords = [
        "bhanuasati", "bhanuasati13", "housecrew", "service", "provider",
        "acrepair", "damoh", "testuser", "testuser123"
    ]
    
    for password in test_passwords:
        sha256_hash = hashlib.sha256(password.encode()).hexdigest()
        if sha256_hash == db_hash:
            print(f"✓ Found match with SHA256! Password: '{password}'")
            return password
        
        md5_hash = hashlib.md5(password.encode()).hexdigest()
        if md5_hash == db_hash:
            print(f"✓ Found match with MD5! Password: '{password}'")
            return password
    
    print(f"\nCould not find password match for hash: {db_hash}")
    return None

if __name__ == "__main__":
    check_password_hash()
