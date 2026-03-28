# HouseCrew - Database Integration Setup

## 🚀 Quick Setup Guide

### 1. Database Setup (MySQL)

```bash
# Install MySQL (if not already installed)
# On macOS:
brew install mysql
brew services start mysql

# On Ubuntu:
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql

# Login to MySQL
mysql -u root -p

# Create database and tables
source backend/database_setup.sql
```

### 2. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Edit .env file with your database credentials
```

### 3. Start Backend Server

```bash
# Start FastAPI server
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend Setup

```bash
# Navigate to project root
cd HouseCrew

# Install dependencies (if not already done)
npm install

# Start frontend server
npm run dev
```

## 📋 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=housecrew

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

## 🗄️ Database Schema

### Users Table
- `id`: Primary key
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password (SHA256)
- `role`: 'customer' or 'service_provider'
- `phone`: Phone number (optional)
- `skill`: Skills/Services (for providers)
- `city`: City location
- `created_at`: Registration timestamp
- `updated_at`: Last update timestamp

### Additional Tables
- `services`: Service listings by providers
- `bookings`: Booking records
- `reviews`: Customer reviews

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/me` - Get current user profile
- `GET /api/health` - Health check

### Example API Usage

#### Register New User
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "customer",
    "phone": "+1234567890",
    "city": "New York"
  }'
```

#### Login User
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

## 🧪 Demo Users

The database setup includes demo users:

**Customer:**
- Email: `customer@housecrew.com`
- Password: `hello`

**Service Provider:**
- Email: `provider@housecrew.com`
- Password: `hello`

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL service is running
   - Verify database credentials in `.env`
   - Ensure database `housecrew` exists

2. **CORS Error**
   - Frontend and backend running on different ports
   - CORS is already configured in FastAPI for localhost:5173

3. **Import Error**
   - Activate virtual environment
   - Install all requirements: `pip install -r requirements.txt`

4. **Port Already in Use**
   - Change port in `.env` file
   - Kill process using the port: `lsof -ti:8000 | xargs kill`

### Development Tips

1. **Hot Reload**: Backend auto-reloads on file changes
2. **API Documentation**: Visit `http://localhost:8000/docs` for Swagger UI
3. **Database Management**: Use MySQL Workbench or phpMyAdmin
4. **Testing**: Use the health check endpoint: `curl http://localhost:8000/api/health`

## 🚀 Production Deployment

For production deployment:

1. **Database**: Use managed MySQL service
2. **Backend**: Deploy FastAPI to cloud service
3. **Frontend**: Build and deploy to static hosting
4. **Environment**: Set production environment variables
5. **Security**: Enable HTTPS, implement JWT tokens

## 📞 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all services are running
3. Test API endpoints directly
4. Review database connection settings

---

**Happy Coding! 🎉**
