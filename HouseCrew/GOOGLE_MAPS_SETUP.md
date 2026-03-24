# Google Maps Integration Setup

## Overview
This application uses Google Maps API to show routes and calculate distances between service providers and customers.

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Directions API** 
   - **Geocoding API**
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Replace the placeholder with your actual API key:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 3. Restart the Development Server

After setting up the environment variables, restart your frontend development server:
```bash
npm start
```

## Features

### 🗺️ **Interactive Map View**
- Shows provider and customer locations
- Displays the route between them
- Zoom controls and pan functionality

### 🛣️ **Route Information**
- **Distance**: Total distance of the route
- **Duration**: Estimated travel time
- **Turn-by-turn directions**: Step-by-step navigation instructions

### 📍 **Location Details**
- **Provider location**: Based on provider's city center
- **Customer location**: GPS coordinates when available
- **Route visualization**: Color-coded path on the map

### 🔍 **Route Options**
- **Open in Google Maps**: Launches Google Maps in new tab
- **Draggable route**: Users can adjust the route by dragging waypoints
- **Travel modes**: Currently supports driving (can be extended)

## Usage

### For Service Providers:

1. **View Route Button**: Click the "📍 Route" button next to any service request
2. **Map Modal**: Opens an interactive map showing the route
3. **Route Details**: See distance, time, and turn-by-turn directions
4. **Google Maps**: Option to open the route in Google Maps for navigation

### Requirements for Route Display:

- **Customer GPS coordinates** must be available (when customer selected location automatically)
- **Provider location** is calculated based on their city center
- **Both locations** need valid coordinates for route calculation

## API Usage Limits

Google Maps API has usage limits:
- **Free tier**: 28,000 map loads per month
- **Directions API**: $5 per 1,000 requests beyond free tier
- **Geocoding API**: $5 per 1,000 requests beyond free tier

Monitor your usage in the Google Cloud Console to avoid unexpected charges.

## Troubleshooting

### Common Issues:

1. **"Failed to load Google Maps"**
   - Check your API key is correct
   - Ensure all required APIs are enabled
   - Verify your internet connection

2. **"Unable to calculate route"**
   - Check if both locations have valid coordinates
   - Ensure locations are accessible by road
   - Try refreshing the page

3. **API Key Error**
   - Make sure the API key has no restrictions or is properly restricted
   - Check if the key is enabled for the correct APIs

### Debug Mode:

To enable debug mode, add this to your `.env`:
```
REACT_APP_GOOGLE_MAPS_DEBUG=true
```

## Security Notes

- **Never commit API keys** to version control
- **Restrict your API key** to specific domains/IP addresses
- **Monitor usage** regularly in Google Cloud Console
- **Set up billing alerts** to avoid unexpected charges

## Future Enhancements

- **Multiple travel modes**: Walking, cycling, public transit
- **Traffic information**: Real-time traffic data
- **Route optimization**: Multiple stops
- **Offline maps**: Cache maps for offline use
- **Geofencing**: Service area boundaries

## Support

For Google Maps API issues:
- [Google Maps Documentation](https://developers.google.com/maps)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-maps)

For application-specific issues, check the browser console for error messages.
