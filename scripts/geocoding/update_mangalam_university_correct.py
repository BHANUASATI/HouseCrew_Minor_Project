#!/usr/bin/env python3
"""
Update K.R. Mangalam University with the correct coordinates
Based on K.R. Mangalam World School location in Sector 41, which is part of the same institution
"""

import mysql.connector
import requests

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'housecrew'
}

# The correct coordinates based on K.R. Mangalam World School in Sector 41
# This is the closest we can get to the university location
CORRECT_COORDINATES = {
    'latitude': 28.4602413,
    'longitude': 77.0660931,
    'location_name': 'K.R. Mangalam World School, Sector 41, Gurugram (Closest to University)',
    'address': 'K.R. Mangalam University, Badshahpur Sohna Rd, Gurugram, Sohna Rural, Haryana 122103'
}

def update_mangalam_coordinates():
    """Update K.R. Mangalam University coordinates with correct location"""
    
    try:
        # Connect to database
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🔗 Connected to database")
        
        # Get all K.R. Mangalam requests
        cursor.execute("""
            SELECT id, address, latitude, longitude 
            FROM service_requests 
            WHERE address LIKE '%MANGALAM%' 
            AND id IN (40, 42, 43)
        """)
        
        requests = cursor.fetchall()
        
        for request_id, address, current_lat, current_lon in requests:
            print(f"\n🔍 Updating request {request_id}: {address}")
            print(f"📍 Current coordinates: {current_lat}, {current_lon}")
            print(f"✅ New coordinates: {CORRECT_COORDINATES['latitude']}, {CORRECT_COORDINATES['longitude']}")
            print(f"📍 Location: {CORRECT_COORDINATES['location_name']}")
            
            # Update database with correct coordinates
            update_query = """
                UPDATE service_requests 
                SET latitude = %s, longitude = %s, updated_at = NOW()
                WHERE id = %s
            """
            
            cursor.execute(update_query, (
                CORRECT_COORDINATES['latitude'], 
                CORRECT_COORDINATES['longitude'], 
                request_id
            ))
            connection.commit()
            
            print(f"✅ Updated request {request_id} with correct coordinates")
        
        # Verify updates
        print("\n🔍 Verifying updates...")
        cursor.execute("""
            SELECT id, address, latitude, longitude 
            FROM service_requests 
            WHERE id IN (40, 42, 43)
            ORDER BY id
        """)
        
        updated_requests = cursor.fetchall()
        
        for request_id, address, lat, lon in updated_requests:
            print(f"✅ Request {request_id}: {lat}, {lon}")
        
        cursor.close()
        connection.close()
        
        print(f"\n🎉 K.R. Mangalam University coordinates updated successfully!")
        print(f"📍 New coordinates: {CORRECT_COORDINATES['latitude']}, {CORRECT_COORDINATES['longitude']}")
        print(f"🏫 Based on: {CORRECT_COORDINATES['location_name']}")
        print(f"🔄 Refresh your browser to see the updated coordinates!")
        
    except Exception as e:
        print(f"❌ Database error: {e}")

if __name__ == "__main__":
    print("🚀 Updating K.R. Mangalam University with CORRECT coordinates...")
    update_mangalam_coordinates()
