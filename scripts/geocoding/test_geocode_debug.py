#!/usr/bin/env python3
"""
Test the geocoding flow to debug coordinate conversion issues
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# Simulate the LocationUtils forwardGeocode function
import requests

API_KEY = "69c7572eea0e4591472196pce879a88"

def test_geocoding_flow():
    """Test the complete geocoding flow for K.R. Mangalam University"""
    
    print("🔍 Testing Geocoding Flow for K.R. Mangalam University")
    print("=" * 60)
    
    # Test addresses
    test_addresses = [
        "K.R. Mangalam University, Badshahpur Sohna Rd, Gurugram, Sohna Rural, Haryana 122103",
        "KR MANGALAM UNIVERSITY SOHNA ROAD GURUGRAM",
        "KR MANGALAM UNIVERSITY GURGAON"
    ]
    
    for i, address in enumerate(test_addresses, 1):
        print(f"\n📍 Test {i}: {address}")
        print("-" * 50)
        
        # Step 1: Try geocode.maps.co API directly
        try:
            url = f"https://geocode.maps.co/search?q={address}&api_key={API_KEY}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data and len(data) > 0:
                result = data[0]
                lat = float(result['lat'])
                lon = float(result['lon'])
                display_name = result.get('display_name', address)
                
                print(f"✅ Direct API Success:")
                print(f"   Latitude: {lat}")
                print(f"   Longitude: {lon}")
                print(f"   Display Name: {display_name}")
            else:
                print(f"❌ Direct API: No results found")
                
                # Step 2: Try alternative search
                print(f"🔄 Trying alternative search...")
                
                # Extract key components
                if "MANGALAM" in address:
                    # Try searching for the World School
                    alt_query = "K.R. Mangalam World School Gurugram"
                    url = f"https://geocode.maps.co/search?q={alt_query}&api_key={API_KEY}"
                    response = requests.get(url, timeout=10)
                    response.raise_for_status()
                    
                    data = response.json()
                    
                    if data and len(data) > 0:
                        result = data[0]
                        lat = float(result['lat'])
                        lon = float(result['lon'])
                        display_name = result.get('display_name', alt_query)
                        
                        print(f"✅ Alternative Search Success:")
                        print(f"   Query: {alt_query}")
                        print(f"   Latitude: {lat}")
                        print(f"   Longitude: {lon}")
                        print(f"   Display Name: {display_name}")
                    else:
                        print(f"❌ Alternative Search: No results found")
                        
                        # Step 3: Try Badshahpur
                        print(f"🔄 Trying Badshahpur fallback...")
                        
                        badshahpur_query = "Badshahpur, Gurugram"
                        url = f"https://geocode.maps.co/search?q={badshahpur_query}&api_key={API_KEY}"
                        response = requests.get(url, timeout=10)
                        response.raise_for_status()
                        
                        data = response.json()
                        
                        if data and len(data) > 0:
                            result = data[0]
                            lat = float(result['lat'])
                            lon = float(result['lon'])
                            display_name = result.get('display_name', badshahpur_query)
                            
                            print(f"✅ Badshahpur Fallback Success:")
                            print(f"   Latitude: {lat}")
                            print(f"   Longitude: {lon}")
                            print(f"   Display Name: {display_name}")
                        else:
                            print(f"❌ Badshahpur Fallback: No results found")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 60)
    print("🔍 Testing Complete!")

if __name__ == "__main__":
    test_geocoding_flow()
