-- Update K.R. Mangalam University service requests with real geocoded coordinates
-- Real coordinates from geocode.maps.co API for Badshahpur, Gurugram

-- SR43 - K.R. Mangalam University, Badshahpur Sohna Rd, Gurugram, Sohna Rural, Haryana 122103
UPDATE service_requests 
SET latitude = 28.3932757, 
    longitude = 77.0484201,
    location_updated = TRUE,
    updated_at = NOW()
WHERE id = 43;

-- SR42 - KR MANGALAM UNIVERSITY SOHNA ROAD GURUGRAM  
UPDATE service_requests 
SET latitude = 28.3932757, 
    longitude = 77.0484201,
    location_updated = TRUE,
    updated_at = NOW()
WHERE id = 42;

-- SR40 - KR MANGALAM UNIVERSITY GURGAON
UPDATE service_requests 
SET latitude = 28.3932757, 
    longitude = 77.0484201,
    location_updated = TRUE,
    updated_at = NOW()
WHERE id = 40;

-- Verify the updates
SELECT id, address, latitude, longitude, location_updated
FROM service_requests 
WHERE id IN (40, 42, 43)
ORDER BY id;
