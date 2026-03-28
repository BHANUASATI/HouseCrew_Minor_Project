#!/usr/bin/env python3
"""
Script to update existing service requests with real geocoded coordinates
"""

import requests
import json
import time

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

def update_service_request_coordinates():
    """Update existing service requests with real geocoded coordinates"""
    
    # Get all service requests
    try:
        response = requests.get(f"{BACKEND_URL}/api/service-requests")
        response.raise_for_status()
        requests_data = response.json()
        
        if not requests_data.get('service_requests'):
            print("❌ No service requests found")
            return
            
        service_requests = requests_data['service_requests']
        print(f"📋 Found {len(service_requests)} service requests")
        
        updated_count = 0
        failed_count = 0
        
        for req in service_requests:
            request_id = req.get('id')
            address = req.get('address', '')
            current_lat = req.get('latitude')
            current_lon = req.get('longitude')
            
            if not address or not request_id:
                print(f"⚠️ Skipping request {request_id} - missing address or ID")
                continue
                
            # Skip if already has real coordinates (not the old static ones)
            if current_lat and current_lon:
                # Check if it's the old static coordinates
                if abs(float(current_lat) - 28.459500) > 0.001 or abs(float(current_lon) - 77.026600) > 0.001:
                    print(f"⏭️ Request {request_id} already has real coordinates")
                    continue
            
            print(f"\n🔍 Processing request {request_id}: {address}")
            
            # Try to geocode the address
            geocoded = geocode_address(address)
            
            if geocoded:
                print(f"✅ Geocoded: {geocoded['latitude']}, {geocoded['longitude']}")
                print(f"📍 Location: {geocoded['display_name']}")
                
                # Update the service request
                try:
                    update_data = {
                        'latitude': geocoded['latitude'],
                        'longitude': geocoded['longitude'],
                        'location_updated': True
                    }
                    
                    update_response = requests.put(
                        f"{BACKEND_URL}/api/service-requests/{request_id}",
                        json=update_data
                    )
                    
                    if update_response.status_code == 200:
                        print(f"✅ Updated request {request_id}")
                        updated_count += 1
                    else:
                        print(f"❌ Failed to update request {request_id}: {update_response.text}")
                        failed_count += 1
                        
                except Exception as e:
                    print(f"❌ Update failed for request {request_id}: {e}")
                    failed_count += 1
            else:
                print(f"❌ Could not geocode address for request {request_id}")
                failed_count += 1
            
            # Rate limiting to avoid overwhelming the API
            time.sleep(1)
        
        print(f"\n📊 Summary:")
        print(f"✅ Successfully updated: {updated_count}")
        print(f"❌ Failed to update: {failed_count}")
        print(f"📈 Success rate: {(updated_count/(updated_count+failed_count)*100):.1f}%")
        
    except Exception as e:
        print(f"❌ Script failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting to update old service requests with real geocoded coordinates...")
    update_service_request_coordinates()
    print("✅ Script completed!")
