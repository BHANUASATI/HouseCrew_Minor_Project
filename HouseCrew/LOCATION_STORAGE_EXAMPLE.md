# Location Storage in Database

## Database Schema

The system stores location data in two main tables:

### 1. Users Table (for current location)
```sql
ALTER TABLE users ADD COLUMN current_latitude DECIMAL(10, 8) NULL;
ALTER TABLE users ADD COLUMN current_longitude DECIMAL(11, 8) NULL;
ALTER TABLE users ADD COLUMN current_address TEXT NULL;
ALTER TABLE users ADD COLUMN location_updated_at TIMESTAMP NULL;
```

### 2. Service Requests Table (for service locations)
```sql
CREATE TABLE service_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    service_category VARCHAR(100) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,           -- Stores "Sector 41, Gurgaon, Haryana, 122012, India"
    latitude DECIMAL(10, 8),         -- Stores 28.455779
    longitude DECIMAL(11, 8),        -- Stores 77.057204
    location_type ENUM('manual', 'auto') DEFAULT 'manual',
    -- other fields...
);
```

## Example Data Storage

### When Location is Auto-Detected:

**Frontend sends:**
```json
{
    "customer_id": 1,
    "service_name": "Electrical Work",
    "service_category": "Electrical",
    "address": "Sector 41, Gurgaon, Haryana, 122012, India",
    "latitude": 28.455779,
    "longitude": 77.057204,
    "location_type": "auto"
}
```

**Database stores:**
```sql
INSERT INTO service_requests (
    customer_id, service_name, service_category, 
    address, latitude, longitude, location_type
) VALUES (
    1, 'Electrical Work', 'Electrical',
    'Sector 41, Gurgaon, Haryana, 122012, India',
    28.455779, 77.057204, 'auto'
);
```

### When Location is Manual Entry:

**Frontend sends:**
```json
{
    "customer_id": 1,
    "service_name": "Plumbing",
    "service_category": "Plumbing",
    "address": "123 Main Street, Damoh, Madhya Pradesh, India",
    "latitude": null,
    "longitude": null,
    "location_type": "manual"
}
```

**Database stores:**
```sql
INSERT INTO service_requests (
    customer_id, service_name, service_category,
    address, latitude, longitude, location_type
) VALUES (
    1, 'Plumbing', 'Plumbing',
    '123 Main Street, Damoh, Madhya Pradesh, India',
    NULL, NULL, 'manual'
);
```

## API Response Format

### Service Request with Location:
```json
{
    "id": 123,
    "customer_id": 1,
    "service_name": "Electrical Work",
    "service_category": "Electrical",
    "address": "Sector 41, Gurgaon, Haryana, 122012, India",
    "latitude": 28.455779,
    "longitude": 77.057204,
    "location_type": "auto",
    "status": "pending",
    "created_at": "2026-03-15T20:30:00Z"
}
```

### User Current Location:
```json
{
    "success": true,
    "message": "Location data retrieved successfully",
    "latitude": 28.455779,
    "longitude": 77.057204,
    "address": "Sector 41, Gurgaon, Haryana, 122012, India",
    "timestamp": "2026-03-15T20:30:00Z"
}
```

## Frontend Display

### Customer Dashboard Shows:
```
📍 Location detected automatically
Address: Sector 41, Gurgaon, Haryana, 122012, India
Coordinates: 📍 28.455779, 77.057204 [GPS]
```

### Service Request Shows:
```
Address: Sector 41, Gurgaon, Haryana, 122012, India
📍 Location detected automatically
Coordinates: 📍 28.455779, 77.057204 [GPS]
```

## Key Features

1. **Complete Address Storage**: Full address including sector, city, state, PIN code
2. **Precise Coordinates**: 6-decimal precision GPS coordinates
3. **Location Type Tracking**: Distinguishes between auto-detected and manual entries
4. **Timestamp Tracking**: When location was last updated
5. **Fallback Handling**: Stores coordinates even when address lookup fails

## Benefits

- **Accurate Service Delivery**: Service providers can find exact locations
- **Sector-Based Navigation**: Easy navigation in Indian cities with sector systems
- **GPS Backup**: Coordinates available even if address formatting fails
- **Type Indication**: Clear visual indicators for auto vs manual locations
