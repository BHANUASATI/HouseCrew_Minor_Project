#!/usr/bin/env python3
import hashlib

# Verify the password
db_hash = "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
password = "password123"

sha256_hash = hashlib.sha256(password.encode()).hexdigest()
print(f"Password: {password}")
print(f"SHA256 Hash: {sha256_hash}")
print(f"Database Hash: {db_hash}")
print(f"Match: {sha256_hash == db_hash}")
