# 📁 HouseCrew Project Structure

This document outlines the organized file structure of the HouseCrew project.

## 🏗️ Project Directory Structure

```
HouseCrew/
├── 📄 Configuration Files
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── 📚 Documentation (docs/)
│   ├── BILL_GENERATION_FIX.md
│   ├── DATABASE_SETUP.md
│   ├── GEOCODING_VERIFICATION.md
│   ├── LOGIN_FIX_GUIDE.md
│   ├── PAYMENT_ERROR_FIX.md
│   ├── PAYMENT_INTEGRATION_GUIDE.md
│   ├── PROJECT_WORKFLOW.md
│   ├── PROVIDER_BOOKINGS_FIX.md
│   ├── QR_PAYMENT_GUIDE.md
│   ├── RAZORPAY_LIVE_SETUP.md
│   ├── RAZORPAY_SETUP.md
│   ├── README.md
│   ├── REAL_TIME_PAYMENT_BILL_GUIDE.md
│   ├── WALLET_RECHARGE_FIX.md
│   └── WALLET_RECHARGE_RAZORPAY.md
│
├── 🔧 Backend (backend/)
│   ├── .env                    # Environment variables
│   ├── main.py                 # Main FastAPI application
│   ├── email_utils.py          # Email service utilities
│   ├── bill_endpoints.py       # Bill generation endpoints
│   ├── bill_service.py         # Bill generation service
│   ├── qr_payment_service.py   # QR payment service
│   ├── razorpay_service.py     # Razorpay payment integration
│   ├── requirements.txt        # Python dependencies
│   └── venv/                   # Virtual environment
│
├── 🎨 Frontend (src/)
│   ├── components/             # React components
│   ├── pages/                  # Page components
│   ├── customer/               # Customer-specific components
│   ├── service-provider/       # Service provider components
│   ├── shared/                 # Shared components
│   ├── services/               # API services
│   ├── utils/                  # Utility functions
│   ├── config/                 # Configuration files
│   ├── context/                # React context
│   ├── assets/                 # Static assets
│   ├── App.jsx                 # Main App component
│   ├── App.css                 # App styles
│   ├── index.css               # Global styles
│   └── main.jsx                # Entry point
│
├── 📜 Scripts (scripts/)
│   ├── database/               # Database-related scripts
│   │   ├── database_setup.sql
│   │   ├── query_user.py
│   │   ├── update_kr_mangalam_coordinates.sql
│   │   ├── update_old_bookings.py
│   │   └── update_specific_bookings.py
│   ├── geocoding/              # Geocoding-related scripts
│   │   ├── fix_coordinates_now.py
│   │   ├── test_geocode_debug.py
│   │   └── update_mangalam_university_correct.py
│   ├── security/               # Security-related scripts
│   │   ├── check_password.py
│   │   ├── verify_password.py
│   │   └── test_hashes.py
│   ├── testing/                # Test files
│   │   ├── test_customer_geocoding.html
│   │   ├── test_geocoding.html
│   │   ├── test_geocoding_fix.html
│   │   └── test_login.py
│   ├── dashboard_fix.py        # Utility script
│   └── project_overview.py     # Project overview script
│
├── 💾 Backups (backups/)
│   ├── main.py.backup
│   ├── main.py.backup2
│   └── email_utils.py.backup
│
├── 📊 Logs (logs/)
│   └── housecrew.db            # Database file
│
├── 🌐 Public (public/)
│   └── favicon.ico
│
└── 📦 Dependencies
    └── node_modules/           # npm packages
```

## 📋 Folder Descriptions

### 📚 `docs/`
Contains all project documentation:
- **BILL_GENERATION_FIX.md**: Bill generation troubleshooting guide
- **DATABASE_SETUP.md**: Database setup instructions
- **GEOCODING_VERIFICATION.md**: Geocoding verification and testing guide
- **LOGIN_FIX_GUIDE.md**: Login issues troubleshooting
- **PAYMENT_ERROR_FIX.md**: Payment error resolution guide
- **PAYMENT_INTEGRATION_GUIDE.md**: Payment integration documentation
- **PROJECT_WORKFLOW.md**: Development workflow guide
- **PROVIDER_BOOKINGS_FIX.md**: Provider bookings troubleshooting
- **QR_PAYMENT_GUIDE.md**: QR code payment implementation guide
- **RAZORPAY_LIVE_SETUP.md**: Razorpay live environment setup
- **RAZORPAY_SETUP.md**: Razorpay integration setup
- **README.md**: Project overview and setup
- **REAL_TIME_PAYMENT_BILL_GUIDE.md**: Real-time payment and billing guide
- **WALLET_RECHARGE_FIX.md**: Wallet recharge troubleshooting
- **WALLET_RECHARGE_RAZORPAY.md**: Wallet recharge with Razorpay guide

### 🔧 `backend/`
FastAPI backend application:
- **main.py**: Main application with all API endpoints
- **email_utils.py**: Email service with enhanced templates
- **bill_endpoints.py**: Bill generation API endpoints
- **bill_service.py**: Bill generation business logic
- **qr_payment_service.py**: QR code payment processing
- **razorpay_service.py**: Razorpay payment gateway integration
- **.env**: Environment configuration (not in version control)
- **requirements.txt**: Python dependencies
- **venv/**: Python virtual environment

### 🎨 `src/`
React frontend application:
- **components/**: Reusable React components
- **pages/**: Page-level components
- **customer/**: Customer-specific features
- **service-provider/**: Service provider features
- **shared/**: Shared components and utilities
- **services/**: API service functions
- **utils/**: Helper functions
- **config/**: Configuration files
- **context/**: React context providers
- **assets/**: Images, icons, and other static assets

### 📜 `scripts/`
Utility and maintenance scripts:
- **database/**: Database setup, query scripts, and booking updates
- **geocoding/**: Geocoding and coordinate fixing scripts
- **security/**: Password testing and security utilities
- **testing/**: Test files for geocoding, customer features, and login testing
- **dashboard_fix.py**: Dashboard repair utilities
- **project_overview.py**: Project overview generation

### 💾 `backups/`
Backup copies of important files:
- All `.backup` files from development
- Organized by date and purpose

### 📊 `logs/`
Runtime and data files:
- **housecrew.db**: SQLite database file
- Future: Application logs and error logs

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
source venv/bin/activate
python main.py
```

### Frontend Setup
```bash
npm install
npm run dev
```

### Database Setup
```bash
cd scripts/database
# Follow instructions in DATABASE_SETUP.md
```

## 📝 File Organization Rules

1. **Documentation** → `docs/`
2. **Backend Code** → `backend/`
3. **Frontend Code** → `src/`
4. **Utility Scripts** → `scripts/`
5. **Backups** → `backups/`
6. **Database & Logs** → `logs/`
7. **Configuration** → Root level or `config/`

## 🔍 Finding Files

### Need to find...
- **API endpoints?** → `backend/main.py`
- **Email templates?** → `backend/email_utils.py`
- **Bill generation?** → `backend/bill_service.py` or `backend/bill_endpoints.py`
- **Payment integration?** → `backend/razorpay_service.py` or `backend/qr_payment_service.py`
- **React components?** → `src/components/`
- **Database setup?** → `docs/DATABASE_SETUP.md` or `scripts/database/`
- **Geocoding scripts?** → `scripts/geocoding/`
- **Test files?** → `scripts/testing/`
- **Security utilities?** → `scripts/security/`
- **Payment guides?** → `docs/` (PAYMENT_INTEGRATION_GUIDE.md, QR_PAYMENT_GUIDE.md, etc.)
- **Troubleshooting guides?** → `docs/` (LOGIN_FIX_GUIDE.md, PAYMENT_ERROR_FIX.md, etc.)
- **Project documentation?** → `docs/`
- **Backup files?** → `backups/`

## 🛠️ Maintenance

- **Regular backups**: Important files are automatically backed up to `backups/`
- **Clean logs**: Check `logs/` folder periodically
- **Update docs**: Keep documentation in `docs/` current
- **Script organization**: Add new scripts to appropriate `scripts/` subfolder

This organized structure makes it easy to locate, maintain, and scale the HouseCrew project.
