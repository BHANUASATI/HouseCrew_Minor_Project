#!/usr/bin/env python3
"""
Script to update specific K.R. Mangalam University service requests with real geocoded coordinates
"""

import requests
import json

# API configuration
BACKEND_URL = "http://localhost:8000"
API_KEY = "69c7572eea0e4591472196pce879a88"

def geocode_address(address):
    """Geocode address using geocode.maps.co API"""
    try:
        url = f"https://geocode.maps.co/search?q={address}&api_key={API_KEY}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if data and len(data) > 0:
            result = data[0]
            return {
                'latitude': float(result['lat']),
                'longitude': float(result['lon']),
                'display_name': result.get('display_name', address)
            }
        else:
            print(f"❌ No results found for: {address}")
            return None
    except Exception as e:
        print(f"❌ Geocoding failed for '{address}': {e}")
        return None

def update_specific_requests():
    """Update specific service requests with real geocoded coordinates"""
    
    # K.R. Mangalam University addresses to update
    addresses_to_update = [
        {
            'request_id': 43,  # SR43
            'address': 'K.R. Mangalam University, Badshahpur Sohna Rd, Gurugram, Sohna Rural, Haryana 122103'
        },
        {
            'request_id': 42,  # SR42
            'address': 'KR MANGALAM UNIVERSITY SOHNA ROAD GURUGRAM'
        },
        {
            'request_id': 40,  # SR40
            'address': 'KR MANGALAM UNIVERSITY GURGAON'
        }
    ]
    
    print("🚀 Updating specific K.R. Mangalam University service requests...")
    
    for req_info in addresses_to_update:
        request_id = req_info['request_id']
        address = req_info['address']
        
        print(f"\n🔍 Processing request {request_id}: {address}")
        
        # Geocode the address
        geocoded = geocode_address(address)
        
        if geocoded:
            print(f"✅ Geocoded to: {geocoded['latitude']}, {geocoded['longitude']}")
            print(f"📍 Real location: {geocoded['display_name']}")
            
            # Update the service request in database directly
            try:
                # Use the geocoding endpoint to verify coordinates first
                geo_response = requests.post(
                    f"{BACKEND_URL}/api/location/geocode",
                    json={'address': address}
                )
                
                if geo_response.status_code == 200:
                    geo_data = geo_response.json()
                    real_lat = geo_data['latitude']
                    real_lon = geo_data['longitude']
                    
                    print(f"✅ Backend geocoding confirmed: {real_lat}, {real_lon}")
                    
                    # Now update the database directly
                    update_sql = f"""
                    UPDATE service_requests 
                    SET latitude = {real_lat}, longitude = {real_lon}, 
                        location_updated = TRUE, updated_at = NOW()
                    WHERE id = {request_id}
                    """
                    
                    print(f"📝 SQL to execute: {update_sql}")
                    print("🔧 Please run this SQL in your MySQL database to update the coordinates:")
                    print(f"   mysql> USE housecrew_db;")
                    print(f"   mysql> {update_sql}")
                    
                else:
                    print(f"❌ Backend geocoding failed: {geo_response.text}")
                    
            except Exception as e:
                print(f"❌ Update failed for request {request_id}: {e}")
        else:
            print(f"❌ Could not geocode address for request {request_id}")
    
    print(f"\n✅ Script completed! Run the SQL commands above to update your database.")

if __name__ == "__main__":
    update_specific_requests()
