<div align="center">

# 🏠 HouseCrew

### *Your Trusted Home Services Platform*

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1.18-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-Latest-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)

*A modern, full-stack web application connecting homeowners with trusted service providers for all household needs.*

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Payment Integration](#-payment-integration)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

**HouseCrew** is a comprehensive home services platform that bridges the gap between customers seeking household services and skilled service providers. Built with modern web technologies, it offers a seamless experience for booking, managing, and paying for home services.

### Why HouseCrew?

- 🔍 **Easy Discovery**: Find verified service providers in your area
- 💳 **Secure Payments**: Integrated Razorpay payment gateway with QR code support
- 📱 **Real-time Updates**: Live booking status and notifications
- 🗺️ **Location-based**: Smart geocoding for accurate service provider matching
- 💼 **Dual Interface**: Separate dashboards for customers and service providers
- 📧 **Email Notifications**: Automated email confirmations and updates

---

## ✨ Features

### For Customers
- 🔐 **Secure Authentication**: Register and login with encrypted password storage
- 🔎 **Service Search**: Browse and search for various home services
- 📅 **Easy Booking**: Book services with preferred date and time
- 💰 **Wallet System**: Recharge wallet and pay seamlessly
- 📊 **Booking History**: Track all your past and upcoming bookings
- 🧾 **Digital Bills**: Automatic bill generation and email delivery
- 📍 **Location Services**: Geocoding integration for accurate address mapping

### For Service Providers
- 📋 **Booking Management**: View and manage all service requests
- 💵 **Earnings Tracking**: Monitor your earnings and transaction history
- 📈 **Dashboard Analytics**: Comprehensive overview of your services
- ✅ **Service Completion**: Mark jobs as complete and generate bills
- 🔔 **Notifications**: Real-time updates on new bookings

### Payment Features
- 💳 **Razorpay Integration**: Secure payment processing
- 📱 **QR Code Payments**: Quick UPI payments via QR codes
- 💼 **Wallet System**: Prepaid wallet for faster transactions
- 🧾 **Auto Bill Generation**: Instant bill creation and email delivery
- 🔄 **Payment Verification**: Real-time payment status updates

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.0
- **Routing**: React Router DOM 7.12.0
- **Styling**: TailwindCSS 4.1.18
- **Animations**: Framer Motion 12.27.5
- **Icons**: React Icons 5.5.0
- **Build Tool**: Vite 7.2.4

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MySQL
- **ORM**: MySQL Connector
- **Authentication**: Custom JWT-based auth
- **Email Service**: SMTP with custom templates
- **Payment Gateway**: Razorpay 2.9.6

### Additional Tools
- **Geocoding**: Google Maps API
- **Environment Management**: python-dotenv
- **Code Quality**: ESLint
- **Version Control**: Git

---

## 📁 Project Structure

```
HouseCrew/
├── 📄 Configuration Files
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── eslint.config.js
│
├── 🔧 Backend (backend/)
│   ├── main.py                 # FastAPI application
│   ├── email_utils.py          # Email service
│   ├── bill_service.py         # Bill generation
│   ├── razorpay_service.py     # Payment integration
│   ├── qr_payment_service.py   # QR payment handling
│   └── requirements.txt        # Python dependencies
│
├── 🎨 Frontend (src/)
│   ├── components/             # Reusable components
│   ├── pages/                  # Page components
│   ├── customer/               # Customer features
│   ├── service-provider/       # Provider features
│   ├── services/               # API services
│   ├── utils/                  # Utility functions
│   └── context/                # React context
│
├── 📚 Documentation (docs/)
│   ├── DATABASE_SETUP.md
│   ├── PAYMENT_INTEGRATION_GUIDE.md
│   ├── RAZORPAY_SETUP.md
│   └── PROJECT_WORKFLOW.md
│
└── 📜 Scripts (scripts/)
    ├── database/               # DB setup scripts
    ├── geocoding/              # Location scripts
    ├── security/               # Security utilities
    └── testing/                # Test files
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- Python 3.8+
- MySQL Server
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/HouseCrew_Minor_Project.git
cd HouseCrew_Minor_Project/HouseCrew
```

### 2. Backend Setup

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

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

**Configure `.env` file:**
```env
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=housecrew_db
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 3. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE housecrew_db;
exit;

# Run database setup script
cd scripts/database
mysql -u root -p housecrew_db < database_setup.sql
```

### 4. Frontend Setup

```bash
# Navigate to project root
cd ../..

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## 💻 Usage

### Customer Workflow
1. **Register/Login** as a customer
2. **Browse Services** available in your area
3. **Book a Service** by selecting date, time, and location
4. **Recharge Wallet** using Razorpay
5. **Track Bookings** in your dashboard
6. **Receive Bills** via email after service completion

### Service Provider Workflow
1. **Register/Login** as a service provider
2. **View Bookings** assigned to you
3. **Accept/Complete** service requests
4. **Generate Bills** for completed services
5. **Track Earnings** in your dashboard

---

## 📡 API Documentation

The backend provides a comprehensive REST API. Access the interactive API documentation at:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

#### Authentication
- `POST /register` - User registration
- `POST /login` - User login

#### Bookings
- `GET /bookings` - Get all bookings
- `POST /bookings` - Create new booking
- `PUT /bookings/{id}` - Update booking status

#### Payments
- `POST /wallet/recharge` - Recharge wallet
- `POST /payment/verify` - Verify payment
- `POST /qr-payment` - Generate QR code payment

#### Bills
- `POST /bills/generate` - Generate bill
- `GET /bills/{id}` - Get bill details

---

## 💳 Payment Integration

HouseCrew uses **Razorpay** for secure payment processing:

- **Test Mode**: Use test credentials for development
- **Live Mode**: Configure live keys for production
- **Payment Methods**: UPI, Cards, Net Banking, Wallets
- **QR Codes**: Dynamic UPI QR code generation

See [`docs/RAZORPAY_SETUP.md`](HouseCrew/docs/RAZORPAY_SETUP.md) for detailed setup instructions.

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[DATABASE_SETUP.md](HouseCrew/docs/DATABASE_SETUP.md)** - Database configuration
- **[PAYMENT_INTEGRATION_GUIDE.md](HouseCrew/docs/PAYMENT_INTEGRATION_GUIDE.md)** - Payment setup
- **[RAZORPAY_SETUP.md](HouseCrew/docs/RAZORPAY_SETUP.md)** - Razorpay integration
- **[QR_PAYMENT_GUIDE.md](HouseCrew/docs/QR_PAYMENT_GUIDE.md)** - QR payment implementation
- **[PROJECT_WORKFLOW.md](HouseCrew/docs/PROJECT_WORKFLOW.md)** - Development workflow
- **[LOGIN_FIX_GUIDE.md](HouseCrew/docs/LOGIN_FIX_GUIDE.md)** - Troubleshooting login issues
- **[BILL_GENERATION_FIX.md](HouseCrew/docs/BILL_GENERATION_FIX.md)** - Bill generation guide

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Update documentation for new features
- Test thoroughly before submitting PR

---

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

**HouseCrew Team**

---

## 🙏 Acknowledgments

- React team for the amazing framework
- FastAPI for the high-performance backend framework
- Razorpay for secure payment processing
- TailwindCSS for beautiful styling utilities
- All contributors and supporters

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ by the HouseCrew Team**

[Report Bug](https://github.com/yourusername/HouseCrew_Minor_Project/issues) • [Request Feature](https://github.com/yourusername/HouseCrew_Minor_Project/issues)

</div>
