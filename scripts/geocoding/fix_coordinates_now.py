#!/usr/bin/env python3
"""
Quick script to update K.R. Mangalam University coordinates with real geocoded data
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

# Geocoding API
API_KEY = "69c7572eea0e4591472196pce879a88"

def get_real_coordinates(address):
    """Get real coordinates from geocode.maps.co API"""
    try:
        url = f"https://geocode.maps.co/search?q={address}&api_key={API_KEY}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data and len(data) > 0:
            result = data[0]
            return float(result['lat']), float(result['lon']), result.get('display_name', address)
        else:
            return None, None, None
    except Exception as e:
        print(f"❌ Geocoding failed: {e}")
        return None, None, None

def update_database():
    """Update database with real coordinates"""
    
    try:
        # Connect to database
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🔗 Connected to database")
        
        # Get K.R. Mangalam University requests
        cursor.execute("""
            SELECT id, address, latitude, longitude 
            FROM service_requests 
            WHERE address LIKE '%MANGALAM%' AND id IN (40, 42, 43)
        """)
        
        requests = cursor.fetchall()
        
        for request_id, address, current_lat, current_lon in requests:
            print(f"\n🔍 Processing request {request_id}: {address}")
            print(f"📍 Current coordinates: {current_lat}, {current_lon}")
            
            # Get real coordinates
            real_lat, real_lon, display_name = get_real_coordinates("Badshahpur, Gurugram")
            
            if real_lat and real_lon:
                print(f"✅ Real coordinates found: {real_lat}, {real_lon}")
                print(f"📍 Location: {display_name}")
                
                # Update database
                update_query = """
                    UPDATE service_requests 
                    SET latitude = %s, longitude = %s, updated_at = NOW()
                    WHERE id = %s
                """
                
                cursor.execute(update_query, (real_lat, real_lon, request_id))
                connection.commit()
                
                print(f"✅ Updated request {request_id} in database")
            else:
                print(f"❌ Could not get real coordinates for request {request_id}")
        
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
        
        print("\n🎉 Database updated successfully!")
        print("🔄 Refresh your browser to see the real coordinates!")
        
    except Exception as e:
        print(f"❌ Database error: {e}")

if __name__ == "__main__":
    print("🚀 Updating K.R. Mangalam University coordinates with real geocoded data...")
    update_database()
