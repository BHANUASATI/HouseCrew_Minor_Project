import logging
from fastapi import FastAPI, HTTPException, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, field_validator
from mysql.connector import Error, connection
from mysql.connector.pooling import MySQLConnectionPool
import os
import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from decimal import Decimal
import requests
from email_utils import email_service
import mysql.connector
from contextlib import asynccontextmanager
import hashlib
from dotenv import load_dotenv
import base64

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables on startup"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Create users table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('customer', 'service_provider') NOT NULL,
                phone VARCHAR(20),
                skill VARCHAR(255),
                city VARCHAR(255),
                profile_picture VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)
        
        # Add profile_picture column if it doesn't exist (MySQL compatible syntax)
        cursor.execute("SHOW COLUMNS FROM users LIKE 'profile_picture'")
        if not cursor.fetchone():
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN profile_picture TEXT
            """)
        
        # Create notifications table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                user_type ENUM('customer', 'service_provider') NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) NOT NULL DEFAULT 'general',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_notifications (user_id, user_type),
                INDEX idx_created_at (created_at)
            )
        """)
        
        # Check if column needs to be upgraded to TEXT
        cursor.execute("SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'profile_picture'")
        result = cursor.fetchone()
        if result and result[0] != 'TEXT':
            cursor.execute("""
                ALTER TABLE users 
                MODIFY COLUMN profile_picture TEXT
            """)
        
        # Add location columns to users table
        user_location_columns = [
            ("current_latitude", "DECIMAL(10, 8) NULL"),
            ("current_longitude", "DECIMAL(11, 8) NULL"),
            ("current_address", "TEXT NULL"),
            ("location_updated_at", "TIMESTAMP NULL")
        ]
        
        for column_name, column_definition in user_location_columns:
            cursor.execute(f"SHOW COLUMNS FROM users LIKE '{column_name}'")
            if not cursor.fetchone():
                cursor.execute(f"""
                    ALTER TABLE users 
                    ADD COLUMN {column_name} {column_definition}
                """)
        
        connection.commit()
        logger.info("Database tables verified/created successfully")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS service_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NOT NULL,
                service_name VARCHAR(255) NOT NULL,
                service_category VARCHAR(100) NOT NULL,
                description TEXT,
                address TEXT NOT NULL,
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                preferred_date DATE,
                preferred_time VARCHAR(50),
                property_type VARCHAR(50),
                urgency ENUM('low', 'medium', 'high') DEFAULT 'medium',
                contact_phone VARCHAR(20),
                status ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # Add new columns if they don't exist (for existing tables)
        new_columns = [
            ("preferred_time", "VARCHAR(50)"),
            ("property_type", "VARCHAR(50)"),
            ("urgency", "ENUM('low', 'medium', 'high') DEFAULT 'medium'"),
            ("contact_phone", "VARCHAR(20)"),
            ("provider_id", "INT NULL"),
            ("location_type", "ENUM('manual', 'auto') DEFAULT 'manual'")
        ]
        
        for column_name, column_definition in new_columns:
            cursor.execute(f"SHOW COLUMNS FROM service_requests LIKE '{column_name}'")
            if not cursor.fetchone():
                cursor.execute(f"""
                    ALTER TABLE service_requests 
                    ADD COLUMN {column_name} {column_definition}
                """)
        
        # Add foreign key constraint for provider_id if it doesn't exist
        cursor.execute("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'service_requests' AND COLUMN_NAME = 'provider_id' AND CONSTRAINT_NAME IS NOT NULL")
        if not cursor.fetchone():
            cursor.execute("""
                ALTER TABLE service_requests 
                ADD CONSTRAINT fk_service_requests_provider 
                FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE SET NULL
            """)
        
        # Create provider_rejections table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS provider_rejections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                service_request_id INT NOT NULL,
                provider_id INT NOT NULL,
                rejection_reason VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
                FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_provider_request (service_request_id, provider_id)
            )
        """)
        
        # Create customer_wallets table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS customer_wallets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NOT NULL UNIQUE,
                balance DECIMAL(10, 2) DEFAULT 0.00,
                currency VARCHAR(10) DEFAULT 'INR',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # Create wallet_transactions table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS wallet_transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                wallet_id INT NOT NULL,
                transaction_type ENUM('credit', 'debit') NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                description TEXT,
                reference_id VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (wallet_id) REFERENCES customer_wallets(id) ON DELETE CASCADE
            )
        """)
        
        # Create payment_orders table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS payment_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(50) UNIQUE NOT NULL,
                service_request_id INT NOT NULL,
                customer_id INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'INR',
                status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
                payment_id VARCHAR(100),
                receipt VARCHAR(100),
                payment_method VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        connection.commit()
        logger.info("Database and tables created successfully")
        
    except Error as e:
        logger.error(f"Startup error: {e}")
        raise
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
    
    yield
    
    # Cleanup on shutdown (if needed)
    logger.info("Application shutdown")

app = FastAPI(title="HouseCrew API", version="1.0.0", description="API for HouseCrew service management", lifespan=lifespan)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'housecrew'),
    'port': 3306,
    'autocommit': False,
    'raise_on_warnings': False,
    'connect_timeout': 10,
    'auth_plugin': 'mysql_native_password'
}

# Pydantic Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  # 'customer' or 'service_provider'
    phone: Optional[str] = None
    skill: Optional[str] = None
    city: Optional[str] = None

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        if v not in ['customer', 'service_provider']:
            raise ValueError('Role must be either customer or service_provider')
        return v

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        return v.strip()

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str  # 'customer' or 'service_provider'

    @field_validator('role')
    @classmethod
    def validate_role(cls, v):
        if v not in ['customer', 'service_provider']:
            raise ValueError('Role must be either customer or service_provider')
        return v

class ServiceRequest(BaseModel):
    customer_id: int
    service_name: str
    service_category: str
    description: Optional[str] = None
    address: str
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    property_type: Optional[str] = None
    urgency: Optional[str] = "medium"
    contact_phone: Optional[str] = None
    location_type: Optional[str] = "manual"

    @field_validator('customer_id')
    @classmethod
    def validate_customer_id(cls, v):
        if v <= 0:
            raise ValueError('Customer ID must be positive')
        return v

    @field_validator('latitude')
    @classmethod
    def validate_latitude(cls, v):
        if v is not None and (v < -90 or v > 90):
            raise ValueError('Latitude must be between -90 and 90')
        return v

    @field_validator('longitude')
    @classmethod
    def validate_longitude(cls, v):
        if v is not None and (v < -180 or v > 180):
            raise ValueError('Longitude must be between -180 and 180')
        return v

    @field_validator('urgency')
    @classmethod
    def validate_urgency(cls, v):
        if v is not None and v not in ['low', 'medium', 'high']:
            raise ValueError('Urgency must be low, medium, or high')
        return v

    @field_validator('location_type')
    @classmethod
    def validate_location_type(cls, v):
        if v is not None and v not in ['manual', 'auto']:
            raise ValueError('Location type must be manual or auto')
        return v

class ServiceRequestResponse(BaseModel):
    id: int
    customer_id: int
    service_name: str
    service_category: str
    description: Optional[str] = None
    address: str
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    property_type: Optional[str] = None
    urgency: Optional[str] = None
    contact_phone: Optional[str] = None
    location_type: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    skill: Optional[str] = None
    city: Optional[str] = None
    profile_picture: Optional[str] = None
    current_latitude: Optional[Decimal] = None
    current_longitude: Optional[Decimal] = None
    current_address: Optional[str] = None
    location_updated_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class LocationUpdate(BaseModel):
    latitude: Decimal
    longitude: Decimal
    address: Optional[str] = None
    detection_method: Optional[str] = "GPS"

class LocationResponse(BaseModel):
    latitude: Decimal
    longitude: Decimal
    address: Optional[str] = None
    detection_method: str
    timestamp: datetime
    success: bool
    message: str

# Database Functions
def get_db_connection():
    """Create database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            logger.info("MySQL database connection successful")
            return connection
    except Error as e:
        logger.error(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "HouseCrew API is running", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        connection = get_db_connection()
        if connection.is_connected():
            connection.close()
            return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

@app.post("/api/auth/register")
async def register(user: UserCreate):
    """Register a new user"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = hash_password(user.password)
        
        # Insert new user
        cursor.execute("""
            INSERT INTO users (name, email, password, role, phone, skill, city)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (user.name, user.email, hashed_password, user.role, user.phone, user.skill, user.city))
        
        connection.commit()
        
        logger.info(f"User registered successfully: {user.email}")
        
        # Send welcome email
        try:
            welcome_html = email_service.get_welcome_email_template(user.name, user.role, user.email, user.password)
            await email_service.send_email(user.email, "Welcome to HouseCrew! 🏠", welcome_html)
            logger.info(f"Welcome email sent to: {user.email}")
        except Exception as e:
            logger.warning(f"Failed to send welcome email to {user.email}: {str(e)}")
        
        return {"message": "User registered successfully", "status": "success"}
        
    except Error as e:
        if connection:
            connection.rollback()
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.post("/api/auth/login")
async def login(user: UserLogin, request: Request = None):
    """Authenticate user"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Hash password
        hashed_password = hash_password(user.password)
        
        # Check user credentials
        cursor.execute("""
            SELECT id, name, email, role, phone, skill, city, profile_picture, created_at
            FROM users 
            WHERE email = %s AND password = %s AND role = %s
        """, (user.email, hashed_password, user.role))
        
        user_data = cursor.fetchone()
        
        if not user_data:
            logger.warning(f"Login failed for email: {user.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        logger.info(f"User logged in successfully: {user.email}")
        
        # Get device and location information
        client_ip = request.client.host if request else "127.0.0.1"
        user_agent = request.headers.get("user-agent", "") if request else ""
        device_info = email_service.get_device_info(user_agent)
        location_info = email_service.get_location_info(client_ip)

        # Send login notification email
        try:
            login_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            login_html = email_service.get_enhanced_login_notification_template(user_data["name"], login_time, device_info, location_info)
            await email_service.send_email(user.email, "🔐 Login Alert - HouseCrew Security", login_html)
            logger.info(f"Enhanced login notification email sent to: {user.email}")
            logger.info(f"Login from IP: {location_info.get('ip', 'Unknown')} - Location: {location_info.get('city', 'Unknown')}, {location_info.get('country', 'Unknown')}")
        except Exception as e:
            logger.warning(f"Failed to send login notification email to {user.email}: {str(e)}")
        
        return {
            "message": "Login successful",
            "status": "success",
            "user": UserResponse(**user_data).dict(),
            "token": f"housecrew_token_{user_data['id']}"
        }
        
    except Error as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.get("/api/users/profile/{user_id}")
async def get_user_profile(user_id: int):
    """Get user profile by ID"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, name, email, role, phone, skill, city, profile_picture, created_at
            FROM users 
            WHERE id = %s
        """, (user_id,))
        
        user_data = cursor.fetchone()
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(**user_data)
        
    except Error as e:
        logger.error(f"Profile fetch error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.put("/api/users/profile/{user_id}")
async def update_user_profile(user_id: int, profile_data: dict):
    """Update user profile"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update allowed fields
        allowed_fields = ['name', 'phone', 'skill', 'city', 'profile_picture']
        update_fields = []
        update_values = []
        
        for field in allowed_fields:
            if field in profile_data and profile_data[field] is not None:
                update_fields.append(f"{field} = %s")
                update_values.append(profile_data[field])
        
        if update_fields:
            update_values.append(user_id)
            cursor.execute(f"""
                UPDATE users 
                SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, update_values)
            
            connection.commit()
            logger.info(f"User profile updated: {user_id}")
        
        # Return updated profile
        cursor.execute("""
            SELECT id, name, email, role, phone, skill, city, profile_picture, created_at
            FROM users 
            WHERE id = %s
        """, (user_id,))
        
        user_data = cursor.fetchone()
        return user_data
        
    except Error as e:
        if connection:
            connection.rollback()
        logger.error(f"Profile update error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.post("/api/users/profile/{user_id}/upload-picture")
async def upload_profile_picture(user_id: int, file: UploadFile = File(...)):
    """Upload profile picture"""
    try:
        # Check if user exists
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read file content and compress
        content = await file.read()
        
        # Compress image if it's too large (simple resize for base64)
        if len(content) > 1000000:  # If larger than 1MB
            import io
            from PIL import Image
            
            # Convert bytes to PIL Image
            img = Image.open(io.BytesIO(content))
            
            # Resize to max 300x300 and compress
            img.thumbnail((300, 300), Image.Resampling.LANCZOS)
            
            # Convert back to bytes with compression
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=85, optimize=True)
            content = buffer.getvalue()
        
        # Convert to base64
        base64_image = base64.b64encode(content).decode('utf-8')
        data_url = f"data:{file.content_type};base64,{base64_image}"
        
        # Update database
        cursor.execute("""
            UPDATE users 
            SET profile_picture = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (data_url, user_id))
        
        connection.commit()
        logger.info(f"Profile picture uploaded for user: {user_id}")
        
        return {"message": "Profile picture uploaded successfully", "profile_picture": data_url}
        
    except HTTPException:
        raise
    except Error as e:
        if connection:
            connection.rollback()
        logger.error(f"Profile picture upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload profile picture: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.get("/api/service-providers")
async def get_service_providers():
    """Get all service providers"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, name, email, phone, skill, city, profile_picture, created_at
            FROM users 
            WHERE role = 'service_provider'
            ORDER BY created_at DESC
        """)
        
        providers = cursor.fetchall()
        return providers
        
    except Error as e:
        logger.error(f"Get service providers error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch service providers")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.get("/api/services")
async def get_services(skill: str = None):
    """Get services based on skill category"""
    connection = None
    cursor = None
    
    try:
        # Define services catalog for different skills
        SERVICES_CATALOG = {
            "Electrician": [
                {
                    "id": "elec_001",
                    "title": "Electrical Installation",
                    "description": "Complete electrical wiring and installation services",
                    "price": 1500,
                    "duration": "2-4 hours",
                    "category": "Installation",
                    "status": "active",
                    "icon": "⚡"
                },
                {
                    "id": "elec_002", 
                    "title": "Circuit Repair",
                    "description": "Diagnosis and repair of electrical circuits",
                    "price": 800,
                    "duration": "1-2 hours",
                    "category": "Repair",
                    "status": "active",
                    "icon": "🔧"
                },
                {
                    "id": "elec_003",
                    "title": "Lighting Installation",
                    "description": "Installation of indoor and outdoor lighting systems",
                    "price": 1200,
                    "duration": "2-3 hours",
                    "category": "Installation",
                    "status": "active",
                    "icon": "💡"
                }
            ],
            "Plumber": [
                {
                    "id": "plumb_001",
                    "title": "Pipe Installation",
                    "description": "Installation of water pipes and drainage systems",
                    "price": 1200,
                    "duration": "3-4 hours",
                    "category": "Installation",
                    "status": "active",
                    "icon": "🔧"
                },
                {
                    "id": "plumb_002",
                    "title": "Leak Repair",
                    "description": "Fix water leaks and pipe damage",
                    "price": 600,
                    "duration": "1-2 hours",
                    "category": "Repair",
                    "status": "active",
                    "icon": "�"
                },
                {
                    "id": "plumb_003",
                    "title": "Fixture Installation",
                    "description": "Install faucets, sinks, and bathroom fixtures",
                    "price": 800,
                    "duration": "2-3 hours",
                    "category": "Installation",
                    "status": "active",
                    "icon": "🚽"
                }
            ],
            "Carpenter": [
                {
                    "id": "carp_001",
                    "title": "Furniture Assembly",
                    "description": "Professional assembly of all types of furniture",
                    "price": 800,
                    "duration": "2-3 hours",
                    "category": "Assembly",
                    "status": "active",
                    "icon": "🪑"
                },
                {
                    "id": "carp_002",
                    "title": "Custom Shelving",
                    "description": "Design and install custom shelving solutions",
                    "price": 1500,
                    "duration": "4-5 hours",
                    "category": "Custom",
                    "status": "active",
                    "icon": "📚"
                },
                {
                    "id": "carp_003",
                    "title": "Door Installation",
                    "description": "Install and adjust interior and exterior doors",
                    "price": 1000,
                    "duration": "2-3 hours",
                    "category": "Installation",
                    "status": "active",
                    "icon": "🚪"
                }
            ],
            "Painter": [
                {
                    "id": "paint_001",
                    "title": "Interior Painting",
                    "description": "Professional interior wall painting services",
                    "price": 2000,
                    "duration": "4-6 hours",
                    "category": "Painting",
                    "status": "active",
                    "icon": "🎨"
                },
                {
                    "id": "paint_002",
                    "title": "Exterior Painting",
                    "description": "Exterior wall and surface painting",
                    "price": 3000,
                    "duration": "6-8 hours",
                    "category": "Painting",
                    "status": "active",
                    "icon": "🏠"
                },
                {
                    "id": "paint_003",
                    "title": "Texture Painting",
                    "description": "Specialized texture and decorative painting",
                    "price": 2500,
                    "duration": "5-7 hours",
                    "category": "Decorative",
                    "status": "active",
                    "icon": "🖼️"
                }
            ],
            "Home Cleaning": [
                {
                    "id": "clean_001",
                    "title": "Deep Home Cleaning",
                    "description": "Comprehensive deep cleaning of entire home",
                    "price": 1500,
                    "duration": "4-5 hours",
                    "category": "Cleaning",
                    "status": "active",
                    "icon": "🧹"
                },
                {
                    "id": "clean_002",
                    "title": "Kitchen Cleaning",
                    "description": "Specialized kitchen cleaning and sanitization",
                    "price": 800,
                    "duration": "2-3 hours",
                    "category": "Cleaning",
                    "status": "active",
                    "icon": "🍳"
                },
                {
                    "id": "clean_003",
                    "title": "Window Cleaning",
                    "description": "Professional window and glass cleaning",
                    "price": 600,
                    "duration": "2-3 hours",
                    "category": "Cleaning",
                    "status": "active",
                    "icon": "🪟"
                }
            ],
            "Gardening": [
                {
                    "id": "garden_001",
                    "title": "Lawn Maintenance",
                    "description": "Regular lawn mowing and maintenance",
                    "price": 800,
                    "duration": "2-3 hours",
                    "category": "Maintenance",
                    "status": "active",
                    "icon": "🌱"
                },
                {
                    "id": "garden_002",
                    "title": "Landscaping",
                    "description": "Complete garden design and landscaping",
                    "price": 3000,
                    "duration": "6-8 hours",
                    "category": "Design",
                    "status": "active",
                    "icon": "�"
                },
                {
                    "id": "garden_003",
                    "title": "Tree Pruning",
                    "description": "Professional tree pruning and maintenance",
                    "price": 1200,
                    "duration": "3-4 hours",
                    "category": "Maintenance",
                    "status": "active",
                    "icon": "✂️"
                }
            ],
            "AC Repair": [
                {
                    "id": "ac_001",
                    "title": "AC Installation",
                    "description": "Complete air conditioner installation services",
                    "price": 2500,
                    "duration": "3-4 hours",
                    "category": "Installation",
                    "status": "active",
                    "icon": "❄️"
                },
                {
                    "id": "ac_002",
                    "title": "AC Repair & Maintenance",
                    "description": "Diagnosis and repair of AC units",
                    "price": 1200,
                    "duration": "2-3 hours",
                    "category": "Repair",
                    "status": "active",
                    "icon": "🔧"
                },
                {
                    "id": "ac_003",
                    "title": "AC Gas Refilling",
                    "description": "AC gas refilling and refrigerant services",
                    "price": 800,
                    "duration": "1-2 hours",
                    "category": "Maintenance",
                    "status": "active",
                    "icon": "💨"
                },
                {
                    "id": "ac_004",
                    "title": "AC Cleaning Service",
                    "description": "Deep cleaning of AC filters and coils",
                    "price": 600,
                    "duration": "1-2 hours",
                    "category": "Cleaning",
                    "status": "active",
                    "icon": "🧹"
                }
            ]
        }
        
        # Return services for the specific skill or all services
        if skill and skill in SERVICES_CATALOG:
            return {"services": SERVICES_CATALOG[skill]}
        elif skill:
            # Try to find partial match
            for key, services in SERVICES_CATALOG.items():
                if skill.lower() in key.lower() or key.lower() in skill.lower():
                    return {"services": services}
            return {"services": []}
        else:
            # Return all services
            all_services = []
            for services in SERVICES_CATALOG.values():
                all_services.extend(services)
            return {"services": all_services}
            
    except Exception as e:
        logger.error(f"Get services error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch services")

# Service Request Endpoints
@app.post("/api/service-requests")
async def create_service_request(request: dict):
    """Create a new service request"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        logger.info(f"Received service request: {request}")
        
        # Extract data from dict
        customer_id = request.get('customer_id')
        service_name = request.get('service_name')
        service_category = request.get('service_category')
        description = request.get('description')
        address = request.get('address')
        latitude = request.get('latitude')
        longitude = request.get('longitude')
        preferred_date = request.get('preferred_date')
        preferred_time = request.get('preferred_time')
        property_type = request.get('property_type')
        urgency = request.get('urgency', 'medium')
        contact_phone = request.get('contact_phone')
        location_type = request.get('location_type', 'manual')
        
        # Verify customer exists
        cursor.execute("SELECT id FROM users WHERE id = %s AND role = 'customer'", (customer_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Insert service request
        cursor.execute("""
            INSERT INTO service_requests 
            (customer_id, service_name, service_category, description, address, latitude, longitude, preferred_date, preferred_time, property_type, urgency, contact_phone, location_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            customer_id,
            service_name,
            service_category,
            description,
            address,
            latitude,
            longitude,
            preferred_date,
            preferred_time,
            property_type,
            urgency,
            contact_phone,
            location_type
        ))
        
        connection.commit()
        logger.info(f"Service request created for customer: {customer_id}")
        
        # Get the created request
        cursor.execute("""
            SELECT id, customer_id, service_name, service_category, description, address, 
                   latitude, longitude, preferred_date, preferred_time, property_type, urgency, contact_phone, location_type, status, created_at, updated_at
            FROM service_requests 
            WHERE id = LAST_INSERT_ID()
        """)
        
        created_request = cursor.fetchone()
        logger.info(f"Created request data: {created_request}")
        
        return {"message": "Service request created successfully", "request_id": created_request['id']}
        
    except Error as e:
        if connection:
            connection.rollback()
        logger.error(f"Create service request error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create service request: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.get("/api/service-requests/{customer_id}")
async def get_customer_service_requests(customer_id: int):
    """Get all service requests for a specific customer"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Verify customer exists
        cursor.execute("SELECT id FROM users WHERE id = %s AND role = 'customer'", (customer_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Get service requests with enhanced details
        cursor.execute("""
            SELECT sr.id, sr.customer_id, sr.service_name, sr.service_category, sr.description, sr.address, 
                   sr.latitude, sr.longitude, sr.preferred_date, sr.preferred_time, sr.property_type, 
                   sr.urgency, sr.contact_phone, sr.status, sr.created_at, sr.updated_at, sr.provider_id,
                   u.name as customer_name, u.email as customer_email,
                   p.name as provider_name, p.phone as provider_phone, p.email as provider_email, 
                   p.skill as provider_skill, p.city as provider_city, p.profile_picture as provider_picture
            FROM service_requests sr
            JOIN users u ON sr.customer_id = u.id
            LEFT JOIN users p ON sr.provider_id = p.id
            WHERE sr.customer_id = %s
            ORDER BY sr.created_at DESC
        """, (customer_id,))
        
        requests = cursor.fetchall()
        
        # Format dates for JSON
        for req in requests:
            if req['created_at']:
                req['created_at'] = req['created_at'].isoformat()
            if req['updated_at']:
                req['updated_at'] = req['updated_at'].isoformat()
            if req['preferred_date']:
                req['preferred_date'] = req['preferred_date'].isoformat() if hasattr(req['preferred_date'], 'isoformat') else str(req['preferred_date'])
            # Convert Decimal to float for JSON
            if req['latitude']:
                req['latitude'] = float(req['latitude'])
            if req['longitude']:
                req['longitude'] = float(req['longitude'])
        
        return requests
        
    except Error as e:
        logger.error(f"Get customer service requests error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch service requests")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.get("/api/service-requests/provider/{provider_id}")
async def get_provider_service_requests(provider_id: int, location_filter: str = None, max_distance: float = None):
    """Get all service requests for a specific service provider based on their skill and optional location filter"""
    import math
    import re
    
    def calculate_distance(lat1, lon1, lat2, lon2):
        """Calculate distance between two points using Haversine formula (in kilometers)"""
        if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
            return None
        
        # Convert latitude and longitude from degrees to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Earth's radius in kilometers
        R = 6371.0
        distance = R * c
        
        return distance
    
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Get provider's skill and location
        cursor.execute("SELECT skill, city, latitude, longitude, address FROM users WHERE id = %s AND role = 'service_provider'", (provider_id,))
        provider = cursor.fetchone()
        
        if not provider:
            # Return empty result for non-existent provider
            return {"service_requests": [], "error": "Service provider not found"}
        
        provider_skill = provider['skill']
        provider_city = provider['city']
        provider_lat = provider['latitude']
        provider_lon = provider['longitude']
        provider_address = provider['address']
        
        if not provider_skill:
            return {"service_requests": []}
        
        # Query that excludes requests already rejected by this provider
        query = """
            SELECT sr.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
                   u.city as customer_city
            FROM service_requests sr
            JOIN users u ON sr.customer_id = u.id
            LEFT JOIN provider_rejections pr ON sr.id = pr.service_request_id AND pr.provider_id = %s
            WHERE sr.status = 'pending' 
            AND sr.provider_id IS NULL
            AND pr.service_request_id IS NULL
            ORDER BY sr.created_at DESC
            LIMIT 50
        """
        
        cursor.execute(query, (provider_id,))
        service_requests = cursor.fetchall()
        
        # Add distance information for all requests with coordinates
        city_coordinates = {
            'gurgaon': (28.4595, 77.0266),
            'delhi': (28.7041, 77.1025),
            'noida': (28.5355, 77.3910),
            'mumbai': (19.0760, 72.8777),
            'bangalore': (12.9716, 77.5946),
            'hyderabad': (17.3850, 78.4867),
            'chennai': (13.0827, 80.2707),
            'kolkata': (22.5726, 88.3639),
            'pune': (18.5204, 73.8567),
            'damoh': (23.1505, 79.0731),
            'indore': (22.7196, 75.8577),
            'jaipur': (26.9124, 75.7873),
            'lucknow': (26.8467, 80.9462),
            'ahmedabad': (23.0225, 72.5714),
            'chandigarh': (30.7333, 76.7794),
            'nagpur': (21.1458, 79.0882),
            'surat': (21.1702, 72.8311),
            'kanpur': (26.4499, 80.3319),
            'bhopal': (23.2599, 77.4126),
            'visakhapatnam': (17.6868, 83.2185),
            'coimbatore': (11.0168, 76.9558),
            'indore': (22.7196, 75.8577),
            'kochi': (9.9312, 76.2673),
            'aurangabad': (19.8762, 75.3433),
            'vadodara': (22.3072, 73.1812),
            'ludhiana': (30.9010, 75.8573),
            'agra': (27.1767, 78.0081),
            'nasik': (19.9975, 73.7898),
            'faridabad': (28.4089, 77.3178),
            'meerut': (28.9845, 77.7064),
            'rajkot': (22.3039, 70.8022),
            'kota': (25.2138, 75.8648),
            'thane': (19.2183, 72.9781),
            'gwalior': (26.2124, 78.1772),
            'varanasi': (25.3176, 82.9739),
            'patna': (25.5941, 85.1376),
            'jodhpur': (26.2389, 73.0243),
            'amritsar': (31.6340, 74.8723),
            'allahabad': (25.4358, 81.8463),
            'ranchi': (23.3441, 85.3096),
            'jabalpur': (23.1815, 79.9864),
            'vijayawada': (16.5062, 80.6480),
            'madurai': (9.9252, 78.1198),
            'guwahati': (26.1445, 91.7362),
            'chandigarh': (30.7333, 76.7794),
            'hubli': (15.3647, 75.1240),
            'srinagar': (34.0837, 74.7973),
            'tiruchirappalli': (10.7905, 78.7047),
            'coimbatore': (11.0168, 76.9558),
            'aurangabad': (19.8762, 75.3433),
            'jammu': (32.7266, 74.8570),
            'mangalore': (12.9141, 74.8560),
            'erode': (11.3340, 77.7262),
            'belgaum': (15.8481, 74.5121),
            'tirupur': (11.1085, 77.3411),
            'salem': (11.6643, 78.1460),
            'aligarh': (27.8974, 78.0880),
            'bhubaneswar': (20.2961, 85.8245),
            'thiruvananthapuram': (8.5241, 76.9366),
            'moradabad': (28.8356, 78.1378),
            'kolhapur': (16.7050, 74.2433),
            'jhansi': (25.4484, 78.5685),
            'tirunelveli': (8.7139, 77.7567),
            'guntur': (16.3067, 80.4429),
            'bikaner': (27.9944, 73.3007),
            'ajmer': (26.4499, 74.6399),
            'warangal': (17.9784, 79.5941),
            'bareilly': (28.3668, 79.4281),
            'mysore': (12.2958, 76.6394),
            'raipur': (21.2514, 81.6296),
            'kochi': (9.9312, 76.2673),
            'srinagar': (34.0837, 74.7973),
            'nellore': (14.4426, 79.9864),
            'jamshedpur': (22.8046, 86.2032),
            'bhilai': (21.1976, 81.2849),
            'cuttack': (20.4625, 85.8830),
            'firozabad': (27.1468, 78.3921),
            'kannur': (11.8745, 75.3704),
            'port_blair': (11.6234, 92.7265),
            'dehradun': (30.3165, 78.0322),
            'dhanbad': (23.7957, 86.4304),
            'asansol': (23.6851, 86.9650),
            'nanded': (19.1383, 77.3210),
            'kolhapur': (16.7050, 74.2433),
            'ajmer': (26.4499, 74.6399),
            'gulbarga': (17.3297, 76.8343),
            'jamnagar': (22.4707, 70.0577),
            'ujjain': (23.1763, 75.8948),
            'loni': (28.6909, 77.2799),
            'siliguri': (26.7271, 88.3951),
            'jalandhar': (31.3260, 75.5762),
            'sambalpur': (21.4662, 84.0402),
            'tumkur': (13.3402, 77.1059),
            'kolar': (13.1359, 77.9337),
            'dhule': (20.8583, 74.5513),
            'rohtak': (28.8955, 76.6066),
            'panipat': (29.3909, 76.9635),
            'karnal': (29.6804, 76.9902),
            'imphal': (24.8170, 93.9368),
            'raichur': (16.2076, 77.3463),
            'sagar': (23.8386, 78.8228),
            'bhiwani': (28.7559, 76.1276),
            'west_delhi': (28.6139, 77.2090),
            'south_delhi': (28.5195, 77.2135),
            'east_delhi': (28.6368, 77.2712),
            'north_delhi': (28.7174, 77.1232),
            'central_delhi': (28.6413, 77.2167)
        }
        
        # Use provider's current location if available, otherwise use city center
        provider_coords = None
        if provider_lat and provider_lon:
            # Use provider's current location (GPS coordinates)
            provider_coords = (float(provider_lat), float(provider_lon))
            provider_location_source = 'current_location'
        elif provider_city:
            # Use provider's city center as fallback
            provider_coords = city_coordinates.get(provider_city.lower())
            provider_location_source = 'city_center'
        else:
            provider_location_source = 'unknown'
        
        for request in service_requests:
            # Enhanced location comparison
            distance = None
            location_type = 'manual'
            address_details = {
                'full_address': request['address'],
                'city': request['customer_city'] or 'Unknown',
                'pincode': 'Unknown',
                'state': 'Unknown',
                'country': 'India'
            }
            
            # Customer location - use what customer provided in the form
            customer_coords = None
            customer_location_source = 'unknown'
            
            # First priority: GPS coordinates if customer selected location automatically
            if request['location_type'] == 'auto' and request['latitude'] and request['longitude']:
                location_type = 'auto'
                customer_coords = (float(request['latitude']), float(request['longitude']))
                customer_location_source = 'gps_coordinates'
                
                # Enhanced address parsing for auto-detected locations
                address_text = request['address']
                if 'Location detected automatically' in address_text:
                    # Try to extract more location details from the address
                    address_details['full_address'] = address_text
                    address_details['detection_method'] = 'GPS auto-detected'
                    address_details['coordinates'] = {
                        'latitude': float(request['latitude']),
                        'longitude': float(request['longitude'])
                    }
                    
                    # Try to extract city from customer data or address
                    if request['customer_city']:
                        address_details['city'] = request['customer_city']
                    else:
                        # Try to extract city from address
                        city_match = re.search(r'\b(Gurgaon|Delhi|Noida|Mumbai|Bangalore|Hyderabad|Chennai|Kolkata|Pune|Damoh|Indore|Jaipur|Lucknow|Ahmedabad|Chandigarh|Nagpur|Surat|Kanpur|Bhopal|Visakhapatnam|Coimbatore|Kochi|Aurangabad|Vadodara|Ludhiana|Agra|Nasik|Faridabad|Meerut|Rajkot|Kota|Thane|Gwalior|Varanasi|Patna|Jodhpur|Amritsar|Allahabad|Ranchi|Jabalpur|Vijayawada|Madurai|Guwahati|Hubli|Srinagar|Tiruchirappalli|Erode|Belgaum|Tirupur|Salem|Aligarh|Bhubaneswar|Thiruvananthapuram|Moradabad|Jhansi|Tirunelveli|Guntur|Bikaner|Warangal|Bareilly|Mysore|Raipur|Nellore|Jamshedpur|Bhilai|Cuttack|Firozabad|Kannur|Port_Blair|Dehradun|Dhanbad|Asansol|Nanded|Gulbarga|Jamnagar|Ujjain|Loni|Siliguri|Jalandhar|Sambalpur|Tumkur|Kolar|Dhule|Rohtak|Panipat|Karnal|Imphal|Raichur|Sagar|Bhiwani|West_Delhi|South_Delhi|East_Delhi|North_Delhi|Central_Delhi)\b', address_text, re.IGNORECASE)
                        if city_match:
                            address_details['city'] = city_match.group(1).replace('_', ' ')
                
            # Second priority: Customer's manually filled address details
            elif request['address'] and request['address'] != 'Location detected automatically':
                location_type = 'manual'
                customer_address = request['address']
                
                # Try to extract city from customer's provided address
                customer_city = request['customer_city']
                
                # First try to use customer's city if available
                if customer_city and customer_city.lower() != 'unknown':
                    address_details['city'] = customer_city
                    customer_coords = city_coordinates.get(customer_city.lower())
                    
                    if customer_coords:
                        customer_location_source = 'city_from_customer_city'
                        address_details['detection_method'] = 'Manual entry - customer city'
                        address_details['coordinates'] = {
                            'latitude': customer_coords[0],
                            'longitude': customer_coords[1]
                        }
                    else:
                        customer_location_source = 'city_not_found'
                        address_details['detection_method'] = 'Manual entry - city not found'
                else:
                    # Try to extract city from address text
                    city_match = re.search(r'\b(Gurgaon|Delhi|Noida|Mumbai|Bangalore|Hyderabad|Chennai|Kolkata|Pune|Damoh|Indore|Jaipur|Lucknow|Ahmedabad|Chandigarh|Nagpur|Surat|Kanpur|Bhopal|Visakhapatnam|Coimbatore|Kochi|Aurangabad|Vadodara|Ludhiana|Agra|Nasik|Faridabad|Meerut|Rajkot|Kota|Thane|Gwalior|Varanasi|Patna|Jodhpur|Amritsar|Allahabad|Ranchi|Jabalpur|Vijayawada|Madurai|Guwahati|Hubli|Srinagar|Tiruchirappalli|Erode|Belgaum|Tirupur|Salem|Aligarh|Bhubaneswar|Thiruvananthapuram|Moradabad|Jhansi|Tirunelveli|Guntur|Bikaner|Warangal|Bareilly|Mysore|Raipur|Nellore|Jamshedpur|Bhilai|Cuttack|Firozabad|Kannur|Port_Blair|Dehradun|Dhanbad|Asansol|Nanded|Gulbarga|Jamnagar|Ujjain|Loni|Siliguri|Jalandhar|Sambalpur|Tumkur|Kolar|Dhule|Rohtak|Panipat|Karnal|Imphal|Raichur|Sagar|Bhiwani|West_Delhi|South_Delhi|East_Delhi|North_Delhi|Central_Delhi)\b', customer_address, re.IGNORECASE)
                    if city_match:
                        extracted_city = city_match.group(1).replace('_', ' ')
                        address_details['city'] = extracted_city
                        customer_coords = city_coordinates.get(extracted_city.lower())
                        
                        if customer_coords:
                            customer_location_source = 'city_from_address'
                            address_details['detection_method'] = 'Manual entry - city extracted from address'
                            address_details['coordinates'] = {
                                'latitude': customer_coords[0],
                                'longitude': customer_coords[1]
                            }
                        else:
                            customer_location_source = 'city_not_found'
                            address_details['detection_method'] = 'Manual entry - city not found'
                    else:
                        customer_location_source = 'address_not_parsed'
                        address_details['detection_method'] = 'Manual entry - address could not be parsed'
            
            # Calculate distance if we have both coordinates
            if provider_coords and customer_coords:
                distance = calculate_distance(
                    provider_coords[0], provider_coords[1],
                    customer_coords[0], customer_coords[1]
                )
                
                # Update location type based on sources
                if customer_location_source == 'gps_coordinates' and provider_location_source == 'current_location':
                    location_type = 'gps_to_gps'
                elif customer_location_source == 'gps_coordinates' and provider_location_source == 'city_center':
                    location_type = 'gps_to_city'
                elif customer_location_source.startswith('city_') and provider_location_source == 'current_location':
                    location_type = 'city_to_gps'
                elif customer_location_source.startswith('city_') and provider_location_source == 'city_center':
                    location_type = 'city_to_city'
            
            # Store the location information
            request['distance_km'] = distance
            request['location_type'] = location_type
            request['provider_city'] = provider_city
            request['provider_coordinates'] = {
                'latitude': provider_coords[0] if provider_coords else None,
                'longitude': provider_coords[1] if provider_coords else None,
                'source': provider_location_source,
                'address': provider_address
            }
            request['address_details'] = address_details
            request['customer_location_source'] = customer_location_source
        
        return {"service_requests": service_requests}
        
    except Error as e:
        logger.error(f"Get provider service requests error: {e}")
        return {"service_requests": [], "error": str(e)}
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.get("/api/notifications/customer/{customer_id}")
async def get_customer_notifications(customer_id: int):
    """Get all notifications for a specific customer"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM notifications 
            WHERE user_id = %s AND user_type = 'customer'
            ORDER BY created_at DESC
        """, (customer_id,))
        
        notifications = cursor.fetchall()
        
        return {"notifications": notifications}
        
    except Error as e:
        logger.error(f"Get customer notifications error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch notifications")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.get("/api/service-provider/{provider_id}/daily-status")
async def get_provider_daily_status(provider_id: int):
    """Get provider's daily acceptance status"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Verify provider exists
        cursor.execute("SELECT id FROM users WHERE id = %s AND role = 'service_provider'", (provider_id,))
        provider = cursor.fetchone()
        
        if not provider:
            # Return default status for non-existent provider
            return {
                "today_accepted": 0,
                "max_daily": 3,
                "remaining": 3,
                "can_accept": True,
                "error": "Provider not found"
            }
        
        # Count accepted requests today
        cursor.execute("""
            SELECT COUNT(*) as today_accepted 
            FROM service_requests 
            WHERE provider_id = %s 
            AND status = 'accepted' 
            AND DATE(updated_at) = CURDATE()
        """, (provider_id,))
        
        result = cursor.fetchone()
        today_accepted = result['today_accepted']
        
        return {
            "today_accepted": today_accepted,
            "max_daily": 3,
            "remaining": 3 - today_accepted,
            "can_accept": today_accepted < 3
        }
        
    except Error as e:
        logger.error(f"Get provider daily status error: {e}")
        # Return default status on database error
        return {
            "today_accepted": 0,
            "max_daily": 3,
            "remaining": 3,
            "can_accept": True,
            "error": "Database error"
        }
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.post("/api/service-requests/{request_id}/reject")
async def reject_service_request(request_id: int, reject_data: dict):
    """Reject a service request (provider only) - removes it from provider's dashboard but keeps it for others"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        provider_id = reject_data.get('provider_id')
        rejection_reason = reject_data.get('reason', 'Not interested')
        
        if not provider_id:
            raise HTTPException(status_code=400, detail="Provider ID is required")
        
        # Verify provider exists
        cursor.execute("SELECT id FROM users WHERE id = %s AND role = 'service_provider'", (provider_id,))
        provider = cursor.fetchone()
        
        if not provider:
            raise HTTPException(status_code=404, detail="Service provider not found")
        
        # Check if service request exists and is pending
        cursor.execute("SELECT id, status FROM service_requests WHERE id = %s", (request_id,))
        service_request = cursor.fetchone()
        
        if not service_request:
            raise HTTPException(status_code=404, detail="Service request not found")
        
        if service_request['status'] != 'pending':
            raise HTTPException(status_code=400, detail="Service request is no longer available")
        
        # Check if provider already rejected this request
        cursor.execute("""
            SELECT id FROM provider_rejections 
            WHERE service_request_id = %s AND provider_id = %s
        """, (request_id, provider_id))
        
        existing_rejection = cursor.fetchone()
        if existing_rejection:
            raise HTTPException(status_code=400, detail="You have already rejected this request")
        
        # Add rejection record
        cursor.execute("""
            INSERT INTO provider_rejections (service_request_id, provider_id, rejection_reason)
            VALUES (%s, %s, %s)
        """, (request_id, provider_id, rejection_reason))
        
        connection.commit()
        logger.info(f"Service request {request_id} rejected by provider {provider_id}")
        
        return {
            "message": "Service request rejected successfully", 
            "status": "rejected"
        }
        
    except Error as e:
        if connection:
            connection.rollback()
        logger.error(f"Reject service request error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to reject service request: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.post("/api/service-requests/{request_id}/accept")
async def accept_service_request(request_id: int, accept_data: dict):
    """Accept a service request (provider only) - with daily limit of 3 requests"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        provider_id = accept_data.get('provider_id')
        
        if not provider_id:
            raise HTTPException(status_code=400, detail="Provider ID is required")
        
        # Verify provider exists
        cursor.execute("SELECT id, skill FROM users WHERE id = %s AND role = 'service_provider'", (provider_id,))
        provider = cursor.fetchone()
        
        if not provider:
            raise HTTPException(status_code=404, detail="Service provider not found")
        
        # Check daily limit: Count accepted requests today
        cursor.execute("""
            SELECT COUNT(*) as today_accepted 
            FROM service_requests 
            WHERE provider_id = %s 
            AND status = 'accepted' 
            AND DATE(updated_at) = CURDATE()
        """, (provider_id,))
        
        today_count = cursor.fetchone()['today_accepted']
        
        if today_count >= 3:
            raise HTTPException(status_code=400, detail="Daily limit of 3 accepted requests reached. Try again tomorrow!")
        
        # Check if service request exists and is pending
        cursor.execute("SELECT id, customer_id, service_name, status, provider_id FROM service_requests WHERE id = %s", (request_id,))
        service_request = cursor.fetchone()
        
        if not service_request:
            raise HTTPException(status_code=404, detail="Service request not found")
        
        if service_request['status'] != 'pending':
            raise HTTPException(status_code=400, detail="Service request is no longer available")
        
        if service_request['provider_id'] is not None:
            raise HTTPException(status_code=400, detail="Service request has already been accepted by another provider")
        
        # Update service request status and assign provider
        cursor.execute("""
            UPDATE service_requests 
            SET status = 'accepted', provider_id = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (provider_id, request_id))
        
        # Create notification for customer
        cursor.execute("""
            SELECT name FROM users WHERE id = %s
        """, (service_request['customer_id'],))
        customer = cursor.fetchone()
        
        if customer:
            notification_message = f"Your service request for '{service_request['service_name']}' has been accepted by {provider['skill']} provider!"
            
            cursor.execute("""
                INSERT INTO notifications (user_id, user_type, message, type, created_at)
                VALUES (%s, 'customer', %s, 'service_update', CURRENT_TIMESTAMP)
            """, (service_request['customer_id'], notification_message))
        
        connection.commit()
        logger.info(f"Service request {request_id} accepted by provider {provider_id} ({today_count + 1}/3 for today)")
        
        return {
            "message": "Service request accepted successfully", 
            "status": "accepted",
            "provider_id": provider_id,
            "remaining_today": 3 - (today_count + 1)
        }
        
    except Error as e:
        if connection:
            connection.rollback()
        logger.error(f"Accept service request error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to accept service request: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.put("/api/service-requests/{request_id}/status")
async def update_service_request_status(request_id: int, status_data: dict):
    """Update the status of a service request"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        new_status = status_data.get('status')
        valid_statuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled']
        
        if new_status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        # Check if service request exists
        cursor.execute("SELECT id FROM service_requests WHERE id = %s", (request_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Service request not found")
        
        # Update status
        cursor.execute("""
            UPDATE service_requests 
            SET status = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (new_status, request_id))
        
        # Get service request details for notification
        cursor.execute("""
            SELECT sr.customer_id, sr.service_name, u.name as customer_name
            FROM service_requests sr
            JOIN users u ON sr.customer_id = u.id
            WHERE sr.id = %s
        """, (request_id,))
        
        request_details = cursor.fetchone()
        
        # Create notification for customer if status changed to accepted
        if new_status == 'accepted' and request_details:
            notification_message = f"Your service request for '{request_details['service_name']}' has been accepted by the service provider!"
            
            cursor.execute("""
                INSERT INTO notifications (user_id, user_type, message, type, created_at)
                VALUES (%s, 'customer', %s, 'service_update', CURRENT_TIMESTAMP)
            """, (request_details['customer_id'], notification_message))
        
        connection.commit()
        logger.info(f"Service request {request_id} status updated to: {new_status}")
        
        return {"message": "Status updated successfully", "status": new_status}
        
    except Error as e:
        if connection:
            connection.rollback()
        logger.error(f"Update service request status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update status")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.get("/api/service-requests/{request_id}/status")
async def get_service_request_status(request_id: int):
    """Get detailed status of a specific service request"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Get service request details
        cursor.execute("""
            SELECT sr.id, sr.customer_id, sr.service_name, sr.service_category, sr.description, sr.address, 
                   sr.latitude, sr.longitude, sr.preferred_date, sr.preferred_time, sr.property_type, 
                   sr.urgency, sr.contact_phone, sr.status, sr.created_at, sr.updated_at, sr.provider_id,
                   u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
                   p.name as provider_name, p.phone as provider_phone, p.email as provider_email, 
                   p.skill as provider_skill, p.city as provider_city, p.profile_picture as provider_picture
            FROM service_requests sr
            JOIN users u ON sr.customer_id = u.id
            LEFT JOIN users p ON sr.provider_id = p.id
            WHERE sr.id = %s
        """, (request_id,))
        
        request = cursor.fetchone()
        
        if not request:
            raise HTTPException(status_code=404, detail="Service request not found")
        
        # Format dates for JSON
        if request['created_at']:
            request['created_at'] = request['created_at'].isoformat()
        if request['updated_at']:
            request['updated_at'] = request['updated_at'].isoformat()
        if request['preferred_date']:
            request['preferred_date'] = request['preferred_date'].isoformat() if hasattr(request['preferred_date'], 'isoformat') else str(request['preferred_date'])
        # Convert Decimal to float for JSON
        if request['latitude']:
            request['latitude'] = float(request['latitude'])
        if request['longitude']:
            request['longitude'] = float(request['longitude'])
        
        # Calculate progress steps based on status
        progress_steps = get_progress_steps(request['status'], request['created_at'])
        request['progress_steps'] = progress_steps
        
        return request
        
    except Error as e:
        logger.error(f"Get service request status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch service request status")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Payment Endpoints
@app.post("/api/payments/create-order")
async def create_payment_order(request_data: dict):
    """Create a payment order for a service request"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Extract data
        service_request_id = request_data.get('service_request_id')
        amount = request_data.get('amount')
        customer_id = request_data.get('customer_id')
        
        # Verify service request exists and belongs to customer
        cursor.execute("""
            SELECT id, service_name, status, customer_id 
            FROM service_requests 
            WHERE id = %s AND customer_id = %s
        """, (service_request_id, customer_id))
        
        service_request = cursor.fetchone()
        if not service_request:
            raise HTTPException(status_code=404, detail="Service request not found")
        
        # Generate order ID
        import uuid
        order_id = f"ORD_{uuid.uuid4().hex[:12].upper()}"
        
        # Create payment order
        cursor.execute("""
            INSERT INTO payment_orders 
            (order_id, service_request_id, customer_id, amount, status, created_at)
            VALUES (%s, %s, %s, %s, %s, NOW())
        """, (order_id, service_request_id, customer_id, amount, 'pending'))
        
        connection.commit()
        
        # In a real implementation, you would integrate with Razorpay, Stripe, etc.
        # For demo purposes, we'll return mock payment details
        payment_data = {
            "order_id": order_id,
            "amount": amount,
            "currency": "INR",
            "receipt": f"rcpt_{order_id}",
            "notes": {
                "service_request_id": service_request_id,
                "service_name": service_request['service_name']
            },
            "key_id": "rzp_test_1234567890",  # Mock Razorpay key
            "callback_url": f"http://localhost:8000/api/payments/verify/{order_id}"
        }
        
        return payment_data
        
    except Error as e:
        if connection:
            connection.rollback()
        logger.error(f"Create payment order error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment order")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.post("/api/payments/verify/{order_id}")
async def verify_payment(order_id: str, payment_data: dict):
    """Verify payment and update status"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Get payment order
        cursor.execute("""
            SELECT id, service_request_id, customer_id, amount, status 
            FROM payment_orders 
            WHERE order_id = %s
        """, (order_id,))
        
        payment_order = cursor.fetchone()
        if not payment_order:
            raise HTTPException(status_code=404, detail="Payment order not found")
        
        # In real implementation, verify with Razorpay/Stripe
        # For demo, we'll assume payment is successful
        payment_id = payment_data.get('payment_id', f'pay_{uuid.uuid4().hex[:12]}')
        
        # Update payment order status
        cursor.execute("""
            UPDATE payment_orders 
            SET status = 'completed', payment_id = %s, updated_at = NOW()
            WHERE order_id = %s
        """, (payment_id, order_id))
        
        # Update service request status to 'accepted'
        cursor.execute("""
            UPDATE service_requests 
            SET status = 'accepted', updated_at = NOW()
            WHERE id = %s
        """, (payment_order['service_request_id'],))
        
        connection.commit()
        
        return {
            "success": True,
            "message": "Payment verified successfully",
            "payment_id": payment_id,
            "order_id": order_id
        }
        
    except Error as e:
        if connection:
            connection.rollback()
        logger.error(f"Verify payment error: {e}")
        raise HTTPException(status_code=500, detail="Payment verification failed")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.get("/api/payments/customer/{customer_id}")
async def get_customer_payments(customer_id: int):
    """Get all payments for a customer"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT po.id, po.order_id, po.service_request_id, po.amount, po.status, 
                   po.payment_id, po.created_at, po.updated_at,
                   sr.service_name, sr.service_category
            FROM payment_orders po
            JOIN service_requests sr ON po.service_request_id = sr.id
            WHERE po.customer_id = %s
            ORDER BY po.created_at DESC
        """, (customer_id,))
        
        payments = cursor.fetchall()
        
        # Format dates
        for payment in payments:
            if payment['created_at']:
                payment['created_at'] = payment['created_at'].isoformat()
            if payment['updated_at']:
                payment['updated_at'] = payment['updated_at'].isoformat()
        
        return payments
        
    except Error as e:
        logger.error(f"Get customer payments error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch payments")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Wallet Endpoints
@app.get("/api/wallet/customer/{customer_id}")
async def get_customer_wallet(customer_id: int):
    """Get customer wallet balance and transactions"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Verify customer exists
        cursor.execute("SELECT id FROM users WHERE id = %s AND role = 'customer'", (customer_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Get or create wallet
        cursor.execute("""
            SELECT id, balance, currency, created_at, updated_at 
            FROM customer_wallets 
            WHERE customer_id = %s
        """, (customer_id,))
        
        wallet = cursor.fetchone()
        
        if not wallet:
            # Create wallet for customer
            cursor.execute("""
                INSERT INTO customer_wallets (customer_id, balance, currency)
                VALUES (%s, 0.00, 'INR')
            """, (customer_id,))
            connection.commit()
            
            cursor.execute("""
                SELECT id, balance, currency, created_at, updated_at 
                FROM customer_wallets 
                WHERE customer_id = %s
            """, (customer_id,))
            wallet = cursor.fetchone()
        
        # Get recent transactions
        cursor.execute("""
            SELECT transaction_type, amount, description, reference_id, created_at
            FROM wallet_transactions 
            WHERE wallet_id = %s
            ORDER BY created_at DESC
            LIMIT 10
        """, (wallet['id'],))
        
        transactions = cursor.fetchall()
        
        # Format dates
        if wallet['created_at']:
            wallet['created_at'] = wallet['created_at'].isoformat()
        if wallet['updated_at']:
            wallet['updated_at'] = wallet['updated_at'].isoformat()
        
        for transaction in transactions:
            if transaction['created_at']:
                transaction['created_at'] = transaction['created_at'].isoformat()
        
        return {
            "wallet": wallet,
            "transactions": transactions
        }
        
    except Error as e:
        logger.error(f"Get customer wallet error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch wallet")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.post("/api/wallet/add-funds")
async def add_wallet_funds(request_data: dict):
    """Add funds to customer wallet"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        customer_id = request_data.get('customer_id')
        amount = request_data.get('amount')
        payment_method = request_data.get('payment_method', 'card')
        
        logger.info(f"Add funds request: customer_id={customer_id}, amount={amount}")
        
        if not customer_id or not amount:
            raise HTTPException(status_code=400, detail="Customer ID and amount are required")
        
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be positive")
        
        # Get or create wallet
        cursor.execute("""
            SELECT id, balance 
            FROM customer_wallets 
            WHERE customer_id = %s
        """, (customer_id,))
        
        wallet = cursor.fetchone()
        logger.info(f"Wallet found: {wallet}")
        
        if not wallet:
            # Create wallet
            cursor.execute("""
                INSERT INTO customer_wallets (customer_id, balance)
                VALUES (%s, 0.00)
            """, (customer_id,))
            connection.commit()
            
            cursor.execute("""
                SELECT id, balance 
                FROM customer_wallets 
                WHERE customer_id = %s
            """, (customer_id,))
            wallet = cursor.fetchone()
            logger.info(f"New wallet created: {wallet}")
        
        # Add funds to wallet
        new_balance = float(wallet['balance']) + amount
        logger.info(f"Updating balance from {wallet['balance']} to {new_balance}")
        
        cursor.execute("""
            UPDATE customer_wallets 
            SET balance = %s, updated_at = NOW()
            WHERE id = %s
        """, (new_balance, wallet['id']))
        
        # Record transaction
        transaction_ref = f"txn_{uuid.uuid4().hex[:12]}"
        cursor.execute("""
            INSERT INTO wallet_transactions 
            (wallet_id, transaction_type, amount, description, reference_id)
            VALUES (%s, 'credit', %s, 'Funds added', %s)
        """, (wallet['id'], amount, transaction_ref))
        
        connection.commit()
        logger.info("Transaction committed successfully")
        
        return {
            "success": True,
            "message": f"₹{amount} added to wallet successfully",
            "new_balance": new_balance
        }
        
    except Error as e:
        if connection:
            connection.rollback()
        logger.error(f"Add wallet funds error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add funds to wallet: {str(e)}")
    except Exception as e:
        if connection:
            connection.rollback()
        logger.error(f"Add wallet funds unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add funds to wallet: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.post("/api/payments/wallet")
async def pay_with_wallet(request_data: dict):
    """Pay for service request using wallet balance"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        customer_id = request_data.get('customer_id')
        service_request_id = request_data.get('service_request_id')
        amount = request_data.get('amount')
        
        if not customer_id or not service_request_id or not amount:
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        # Get wallet
        cursor.execute("""
            SELECT id, balance 
            FROM customer_wallets 
            WHERE customer_id = %s
        """, (customer_id,))
        
        wallet = cursor.fetchone()
        
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        if float(wallet['balance']) < amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        
        # Check if service request exists and belongs to customer
        cursor.execute("""
            SELECT id, service_name, status 
            FROM service_requests 
            WHERE id = %s AND customer_id = %s
        """, (service_request_id, customer_id))
        
        service_request = cursor.fetchone()
        if not service_request:
            raise HTTPException(status_code=404, detail="Service request not found")
        
        # Deduct from wallet
        new_balance = float(wallet['balance']) - amount
        cursor.execute("""
            UPDATE customer_wallets 
            SET balance = %s, updated_at = NOW()
            WHERE id = %s
        """, (new_balance, wallet['id']))
        
        # Record transaction
        cursor.execute("""
            INSERT INTO wallet_transactions 
            (wallet_id, transaction_type, amount, description, reference_id)
            VALUES (%s, 'debit', %s, 'Service payment', %s)
        """, (wallet['id'], amount, f"pay_{service_request_id}"))
        
        # Create payment order
        order_id = f"ORD_{uuid.uuid4().hex[:12].upper()}"
        
        cursor.execute("""
            INSERT INTO payment_orders 
            (order_id, service_request_id, customer_id, amount, status, payment_method, payment_id, created_at)
            VALUES (%s, %s, %s, %s, 'completed', 'wallet', %s, NOW())
        """, (order_id, service_request_id, customer_id, amount, f"wallet_{uuid.uuid4().hex[:12]}"))
        
        # Update service request status
        cursor.execute("""
            UPDATE service_requests 
            SET status = 'accepted', updated_at = NOW()
            WHERE id = %s
        """, (service_request_id,))
        
        connection.commit()
        
        return {
            "success": True,
            "message": "Payment successful using wallet",
            "order_id": order_id,
            "amount_paid": amount,
            "remaining_balance": new_balance
        }
        
    except Error as e:
        if connection:
            connection.rollback()
        logger.error(f"Pay with wallet error: {e}")
        raise HTTPException(status_code=500, detail="Wallet payment failed")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Dashboard Endpoints
@app.get("/api/dashboard/customer/{customer_id}")
async def get_customer_dashboard(customer_id: int):
    """Get comprehensive dashboard data for customer"""
    try:
        # Test basic connection
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Verify customer exists
        cursor.execute("SELECT id FROM users WHERE id = %s AND role = 'customer'", (customer_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Get service requests statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
                COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_requests,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_requests,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests
            FROM service_requests 
            WHERE customer_id = %s
        """, (customer_id,))
        
        stats = cursor.fetchone()
        
        # Get wallet balance
        cursor.execute("""
            SELECT balance, currency 
            FROM customer_wallets 
            WHERE customer_id = %s
        """, (customer_id,))
        
        wallet = cursor.fetchone()
        wallet_balance = wallet['balance'] if wallet else 0.0
        
        # Get recent service requests
        cursor.execute("""
            SELECT id, service_name, service_category, status, created_at, updated_at
            FROM service_requests
            WHERE customer_id = %s
            ORDER BY created_at DESC
            LIMIT 5
        """, (customer_id,))
        
        recent_services = cursor.fetchall()
        
        # Format dates
        for service in recent_services:
            if service['created_at']:
                service['created_at'] = service['created_at'].isoformat()
            if service['updated_at']:
                service['updated_at'] = service['updated_at'].isoformat()
        
        # Get recent activities
        cursor.execute("""
            SELECT 
                'service_request' as type,
                service_name as title,
                status,
                created_at,
                CAST(id AS CHAR) as reference_id
            FROM service_requests 
            WHERE customer_id = %s AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY created_at DESC
            LIMIT 3
        """, (customer_id,))
        
        recent_activities = cursor.fetchall()
        
        # Format activity dates
        for activity in recent_activities:
            if activity['created_at']:
                activity['created_at'] = activity['created_at'].isoformat()
        
        return {
            "statistics": {
                "total_requests": stats['total_requests'],
                "pending_requests": stats['pending_requests'],
                "accepted_requests": stats['accepted_requests'],
                "in_progress_requests": stats['in_progress_requests'],
                "completed_requests": stats['completed_requests'],
                "wallet_balance": wallet_balance,
                "pending_payments": 0.0
            },
            "recent_services": recent_services,
            "recent_activities": recent_activities,
            "last_updated": datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
        }
        
    except Error as e:
        logger.error(f"Get customer dashboard error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard data: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

def get_progress_steps(status, created_at):
    """Calculate progress steps based on status and timestamps"""
    from datetime import datetime, timedelta
    
    steps = [
        {
            "title": "Service Requested",
            "icon": "FaCheckCircle",
            "status": "completed",
            "timestamp": created_at,
            "description": "Your service request has been received and is being processed"
        }
    ]
    
    # Add steps based on current status
    if status in ['accepted', 'in_progress', 'completed']:
        steps.append({
            "title": "Technician Assigned",
            "icon": "FaUserCog",
            "status": "completed",
            "timestamp": created_at,  # Would be actual assignment time in real system
            "description": "A qualified technician has been assigned to your request"
        })
    else:
        steps.append({
            "title": "Technician Assigned",
            "icon": "FaUserCog",
            "status": "pending",
            "timestamp": None,
            "description": "Waiting for technician assignment"
        })
    
    if status in ['in_progress', 'completed']:
        steps.append({
            "title": "On the Way",
            "icon": "FaCar",
            "status": "completed",
            "timestamp": created_at,  # Would be actual departure time
            "description": "Technician is on the way to your location"
        })
    elif status == 'accepted':
        steps.append({
            "title": "On the Way",
            "icon": "FaCar",
            "status": "pending",
            "timestamp": None,
            "description": "Technician will be on the way soon"
        })
    else:
        steps.append({
            "title": "On the Way",
            "icon": "FaCar",
            "status": "pending",
            "timestamp": None,
            "description": "Waiting for technician to start journey"
        })
    
    if status == 'completed':
        steps.append({
            "title": "Service In Progress",
            "icon": "FaTools",
            "status": "completed",
            "timestamp": created_at,  # Would be actual start time
            "description": "Technician is working on your service request"
        })
        steps.append({
            "title": "Service Completed",
            "icon": "FaCheckCircle",
            "status": "completed",
            "timestamp": created_at,  # Would be actual completion time
            "description": "Service has been completed successfully"
        })
    elif status == 'in_progress':
        steps.append({
            "title": "Service In Progress",
            "icon": "FaTools",
            "status": "active",
            "timestamp": created_at,  # Would be actual start time
            "description": "Technician is currently working on your service"
        })
    else:
        steps.append({
            "title": "Service In Progress",
            "icon": "FaTools",
            "status": "pending",
            "timestamp": None,
            "description": "Service will begin once technician arrives"
        })
    
    return steps

@app.get("/api/service-providers/by-skill/{skill}")
async def get_providers_by_skill(skill: str):
    """Get service providers by skill"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, name, email, phone, city, created_at
            FROM users 
            WHERE role = 'service_provider' AND skill LIKE %s
            ORDER BY created_at DESC
        """, (f"%{skill}%",))
        
        providers = cursor.fetchall()
        return {"providers": providers, "skill": skill, "count": len(providers)}
        
    except Error as e:
        logger.error(f"Providers by skill fetch error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch providers by skill: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.get("/api/service-providers/by-city/{city}")
async def get_providers_by_city(city: str):
    """Get service providers by city"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, name, email, phone, skill, created_at
            FROM users 
            WHERE role = 'service_provider' AND city LIKE %s
            ORDER BY created_at DESC
        """, (f"%{city}%",))
        
        providers = cursor.fetchall()
        return {"providers": providers, "city": city, "count": len(providers)}
        
    except Error as e:
        logger.error(f"Providers by city fetch error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch providers by city: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Location API endpoints
@app.put("/api/users/{user_id}/location")
async def update_user_location(user_id: int, location_data: LocationUpdate):
    """Update user's current location"""
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Check if user exists
        cursor.execute("SELECT id, role FROM users WHERE id = %s", (user_id,))
        user_data = cursor.fetchone()
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify user is either customer or service provider
        if user_data['role'] not in ['customer', 'service_provider']:
            raise HTTPException(status_code=403, detail="Only customers and service providers can update location")
        
        # Update user location
        cursor.execute("""
            UPDATE users 
            SET current_latitude = %s, 
                current_longitude = %s, 
                current_address = %s, 
                location_updated_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (location_data.latitude, location_data.longitude, location_data.address, user_id))
        
        connection.commit()
        logger.info(f"Location updated for user {user_id} ({user_data['role']}): {location_data.latitude}, {location_data.longitude}")
        
        return LocationResponse(
            latitude=location_data.latitude,
            longitude=location_data.longitude,
            address=location_data.address,
            detection_method=location_data.detection_method or "GPS",
            timestamp=datetime.now(),
            success=True,
            message="Location updated successfully"
        )
        
    except Error as e:
        if connection:
            connection.rollback()
        logger.error(f"Location update error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update location: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.get("/api/test")
async def test_endpoint():
    """Simple test endpoint"""
    return {"message": "Backend is working!", "status": "ok"}

@app.get("/api/users/{user_id}/location")
async def get_user_location(user_id: int):
    """Get user's current location"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT current_latitude, current_longitude, current_address, location_updated_at
            FROM users 
            WHERE id = %s
        """, (user_id,))
        
        user_data = cursor.fetchone()
        
        if not user_data:
            return {
                "success": False,
                "message": "User not found",
                "latitude": None,
                "longitude": None,
                "address": None,
                "timestamp": None
            }
        
        if not user_data['current_latitude'] or not user_data['current_longitude']:
            return {
                "success": False,
                "message": "No location data available",
                "latitude": None,
                "longitude": None,
                "address": None,
                "timestamp": None
            }
        
        # Convert Decimal to string to avoid JSON serialization issues
        return {
            "success": True,
            "message": "Location data retrieved successfully",
            "latitude": str(user_data['current_latitude']),
            "longitude": str(user_data['current_longitude']),
            "address": user_data['current_address'] or "Unknown",
            "timestamp": user_data['location_updated_at'].isoformat() if user_data['location_updated_at'] else None
        }
        
    except Exception as e:
        logger.error(f"Location fetch error: {e}")
        return {
            "success": False,
            "message": f"Error: {str(e)}",
            "latitude": None,
            "longitude": None,
            "address": None,
            "timestamp": None
        }
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.post("/api/location/reverse-geocode")
async def reverse_geocode(latitude: float, longitude: float):
    """Convert coordinates to address using reverse geocoding"""
    try:
        # Using OpenStreetMap Nominatim API
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&addressdetails=1"
        headers = {'User-Agent': 'HouseCrew/1.0'}
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if 'error' in data:
            raise HTTPException(status_code=400, detail="Reverse geocoding failed")
        
        # Format the address
        address = format_address_from_geocode(data)
        
        return {
            "success": True,
            "address": address,
            "latitude": latitude,
            "longitude": longitude,
            "raw_data": data
        }
        
    except requests.RequestException as e:
        logger.error(f"Reverse geocoding API error: {e}")
        raise HTTPException(status_code=500, detail="Reverse geocoding service unavailable")
    except Exception as e:
        logger.error(f"Reverse geocoding error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to reverse geocode: {str(e)}")

def format_address_from_geocode(data):
    """Format address from geocoding response with emphasis on Indian address format"""
    address = data.get('address', {})
    components = []
    
    # House number and street
    if address.get('house_number'):
        components.append(address['house_number'])
    if address.get('road'):
        components.append(address['road'])
    
    # Area/Neighborhood
    if address.get('suburb') or address.get('neighbourhood'):
        components.append(address.get('suburb') or address.get('neighbourhood'))
    
    # Sector (prioritize for Indian addresses)
    if address.get('sector'):
        components.append(f"Sector {address['sector']}")
    
    # City/Town
    if address.get('city') or address.get('town') or address.get('village'):
        components.append(address.get('city') or address.get('town') or address.get('village'))
    
    # District (important for Indian addresses)
    if address.get('state_district'):
        components.append(address['state_district'])
    
    # State
    if address.get('state'):
        components.append(address['state'])
    
    # PIN code (crucial for Indian addresses)
    if address.get('postcode'):
        components.append(address['postcode'])
    
    # Country
    if address.get('country'):
        components.append(address['country'])
    
    # If no components found, return coordinates-based location
    if not components:
        return f"Location detected (coordinates available)"
    
    return ', '.join(components)

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {"error": "Not found", "status_code": 404}

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {"error": "Internal server error", "status_code": 500}

@app.exception_handler(400)
async def bad_request_handler(request, exc):
    return {"error": "Bad request", "status_code": 400}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("API_PORT", 8003))
    uvicorn.run(app, host="0.0.0.0", port=port)