# 🚀 Razorpay Payment Integration - Quick Start Guide

## ✅ What Has Been Integrated

Your HouseCrew application now has **real Razorpay payment integration** with the following features:

### Backend (Python/FastAPI)
- ✅ Razorpay SDK installed (`razorpay==1.4.1`)
- ✅ Payment service module (`backend/razorpay_service.py`)
- ✅ Real payment order creation with Razorpay API
- ✅ Payment signature verification for security
- ✅ Payment status tracking in database
- ✅ Support for refunds and payment capture
- ✅ Webhook signature verification (ready for production)

### Frontend (React)
- ✅ Razorpay Checkout SDK integration
- ✅ Payment utility functions (`src/utils/razorpayUtils.js`)
- ✅ Updated Payments page with Razorpay integration
- ✅ Support for multiple payment methods (UPI, Cards, Net Banking, Wallets)
- ✅ Real-time payment status updates
- ✅ Error handling and user feedback

## 🎯 Next Steps to Get Started

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install the Razorpay SDK and all other required packages.

### 2. Get Your Razorpay API Keys

**For Testing (Recommended to start):**

1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Go to [Dashboard → Settings → API Keys](https://dashboard.razorpay.com/app/keys)
3. Click **"Generate Test Keys"**
4. Copy both:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret**

**Note**: You can start testing immediately without KYC verification using test keys!

### 3. Configure Your API Keys

Edit `backend/.env` file and replace the placeholder values:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY_HERE
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Important**: 
- Keep your **Key Secret** private and never commit it to Git
- The `.env` file is already in `.gitignore`

### 4. Start Your Application

**Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

**Frontend:**
```bash
# In a new terminal
npm run dev
```

### 5. Test Your Payment Integration

1. **Login as Customer**
2. **Create a Service Request**:
   - Go to "Book Service"
   - Select any service (e.g., "Plumbing")
   - Fill in details and submit

3. **Make a Test Payment**:
   - Go to "Payments" page
   - Click "Pay Now" on your pending request
   - Razorpay checkout will open
   - Use test credentials:

**Test Card:**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
Name: Test User
```

**Test UPI:**
```
UPI ID: success@razorpay
```

4. **Verify Payment**:
   - Payment should complete successfully
   - Check "Payment History" tab
   - Verify in [Razorpay Dashboard → Payments](https://dashboard.razorpay.com/app/payments)

## 🔄 Test Mode vs Production Mode

### Test Mode (Current Setup)
- Uses `rzp_test_` keys
- No real money is charged
- Test cards and UPI IDs work
- Perfect for development and testing
- No KYC required

### Production Mode (When Ready)
- Complete KYC verification on Razorpay
- Generate Live Keys (`rzp_live_`)
- Replace test keys with live keys in `.env`
- Real payments will be processed
- Requires SSL certificate (HTTPS)

## 📁 Files Modified/Created

### Backend Files
```
backend/
├── razorpay_service.py          # NEW - Razorpay service module
├── main.py                       # UPDATED - Payment endpoints
├── requirements.txt              # UPDATED - Added razorpay
└── .env                          # UPDATED - Razorpay keys
```

### Frontend Files
```
src/
├── utils/
│   └── razorpayUtils.js         # NEW - Razorpay utilities
├── services/
│   └── apiService.js            # UPDATED - Added Razorpay config endpoint
└── customer/pages/
    └── Payments.jsx             # UPDATED - Razorpay integration
```

### Documentation
```
docs/
└── RAZORPAY_SETUP.md            # NEW - Complete setup guide
```

## 🎨 Payment Flow

```
1. Customer clicks "Pay Now"
   ↓
2. Backend creates Razorpay order
   ↓
3. Frontend opens Razorpay Checkout modal
   ↓
4. Customer enters payment details
   ↓
5. Razorpay processes payment
   ↓
6. Payment response sent to backend
   ↓
7. Backend verifies signature
   ↓
8. Order status updated to "Completed"
   ↓
9. Customer sees success message
```

## 🛡️ Security Features

✅ **Payment Signature Verification**: Every payment is verified using HMAC SHA256  
✅ **Secure Key Storage**: API keys stored in environment variables  
✅ **HTTPS Ready**: Production setup requires SSL  
✅ **No Key Exposure**: Key Secret never sent to frontend  
✅ **Database Validation**: All payments logged and tracked  

## 💡 Testing Without Razorpay Keys

If you haven't configured Razorpay keys yet, the system will automatically run in **mock mode**:

- ✅ Orders are created with test IDs
- ✅ Payments are auto-approved
- ✅ No actual API calls to Razorpay
- ✅ Perfect for UI testing

Simply leave the default values in `.env` to use mock mode.

## 🐛 Common Issues & Solutions

### Issue: "Failed to load Razorpay SDK"
**Solution**: Check internet connection. Razorpay SDK loads from CDN.

### Issue: Payment modal doesn't open
**Solution**: 
- Check browser console for errors
- Verify Razorpay script is loaded
- Check if Key ID is configured

### Issue: "Invalid signature" error
**Solution**:
- Verify Key Secret matches Key ID
- Check if both keys are from same account
- Ensure no extra spaces in `.env` file

### Issue: Payment succeeds but not reflected in app
**Solution**:
- Check backend logs for verification errors
- Verify database connection
- Check payment verification endpoint

## 📊 Supported Payment Methods

Your integration supports all Razorpay payment methods:

- 💳 **Credit/Debit Cards**: Visa, Mastercard, Rupay, Amex
- 📱 **UPI**: GPay, PhonePe, Paytm, BHIM
- 🏦 **Net Banking**: All major banks
- 💰 **Wallets**: Paytm, PhonePe, Amazon Pay, Mobikwik
- 💵 **EMI**: Card EMI options
- 🌐 **International Cards**: Supported in production

## 📈 Next Steps

1. ✅ **Test the integration** with test keys
2. ✅ **Complete KYC** on Razorpay (for production)
3. ✅ **Set up webhooks** for payment notifications
4. ✅ **Configure refund policies** if needed
5. ✅ **Add payment analytics** tracking
6. ✅ **Set up email notifications** for payments

## 📚 Additional Documentation

- **Complete Setup Guide**: `docs/RAZORPAY_SETUP.md`
- **Razorpay Official Docs**: [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **Test Cards**: [https://razorpay.com/docs/payments/payments/test-card-details/](https://razorpay.com/docs/payments/payments/test-card-details/)

## 🎉 You're All Set!

Your HouseCrew application now has a **production-ready payment gateway** integrated. Start testing with test keys, and when you're ready, switch to live keys for real payments!

---

**Need Help?**
- Check `docs/RAZORPAY_SETUP.md` for detailed documentation
- Visit Razorpay Dashboard for payment logs
- Contact Razorpay support for payment-related issues
