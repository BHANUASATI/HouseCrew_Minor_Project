#!/usr/bin/env python3
import hashlib

password = "password123"

# MD5 hash (what the login uses)
md5_hash = hashlib.md5(password.encode()).hexdigest()
print(f"Password: {password}")
print(f"MD5 Hash: {md5_hash}")

# SHA256 hash (what's in the database)
sha256_hash = hashlib.sha256(password.encode()).hexdigest()
print(f"SHA256 Hash: {sha256_hash}")

# Test what MD5 produces for comparison
print(f"\nMD5 hash length: {len(md5_hash)}")
print(f"SHA256 hash length: {len(sha256_hash)}")
