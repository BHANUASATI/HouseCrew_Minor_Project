# 💳 Razorpay Payment Integration Guide

This guide explains how to set up and use Razorpay payment gateway in the HouseCrew application.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Testing](#testing)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

HouseCrew uses **Razorpay** as the payment gateway to process payments for service requests. The integration supports:

- ✅ UPI Payments (GPay, PhonePe, Paytm)
- ✅ Credit/Debit Cards (Visa, Mastercard, Rupay)
- ✅ Net Banking
- ✅ Digital Wallets
- ✅ Payment verification with signature validation
- ✅ Secure payment processing

## 📦 Prerequisites

1. **Razorpay Account**: Sign up at [https://razorpay.com](https://razorpay.com)
2. **API Keys**: Get your API keys from [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
3. **Python 3.9+** for backend
4. **Node.js 16+** for frontend

## 🔧 Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `razorpay==1.4.1` - Official Razorpay Python SDK
- Other required dependencies

### Step 2: Configure Environment Variables

Edit `backend/.env` file and add your Razorpay credentials:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**How to get these keys:**

1. **Key ID & Secret**: 
   - Go to [Razorpay Dashboard → Settings → API Keys](https://dashboard.razorpay.com/app/keys)
   - Click "Generate Test Keys" for testing or "Generate Live Keys" for production
   - Copy both Key ID and Key Secret

2. **Webhook Secret**:
   - Go to [Razorpay Dashboard → Settings → Webhooks](https://dashboard.razorpay.com/app/webhooks)
   - Create a new webhook with your server URL
   - Copy the webhook secret

### Step 3: Database Schema

The payment integration uses the following tables (automatically created):

```sql
-- Payment orders table
CREATE TABLE payment_orders (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Step 4: Start Backend Server

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

The server will start on `http://localhost:8003`

## 🎨 Frontend Setup

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `razorpay` - Razorpay SDK for frontend
- Other React dependencies

### Step 2: Start Frontend Development Server

```bash
npm run dev
```

The app will start on `http://localhost:5173`

## 🧪 Testing

### Test Mode (Using Test Keys)

1. **Use Test API Keys**: In `.env`, use keys starting with `rzp_test_`
2. **Test Cards**: Use Razorpay test cards for testing

**Test Card Details:**
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

**Test UPI:**
```
UPI ID: success@razorpay
```

### Testing Payment Flow

1. **Create a Service Request**:
   - Login as a customer
   - Navigate to "Book Service"
   - Select a service and create a request

2. **Make Payment**:
   - Go to "Payments" page
   - Click "Pay Now" on pending request
   - Select payment method (UPI/Card/Net Banking)
   - Complete payment using test credentials

3. **Verify Payment**:
   - Check payment status in "Payment History"
   - Verify in Razorpay Dashboard → Payments

### Testing Without Razorpay Credentials

If you haven't configured Razorpay keys, the system will run in **test mode**:
- Mock orders are created
- Payments are auto-approved
- No actual Razorpay API calls are made

## 🚀 Production Deployment

### Step 1: Get Live API Keys

1. Complete KYC verification on Razorpay
2. Activate your account
3. Generate Live API Keys from dashboard
4. Replace test keys with live keys in `.env`

### Step 2: Update Environment Variables

```env
# Production Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key
RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret
```

### Step 3: Configure Webhooks

Set up webhooks for production:

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
4. Copy the webhook secret to `.env`

### Step 4: SSL Certificate

Ensure your production server has a valid SSL certificate (HTTPS) as Razorpay requires secure connections.

## 🔍 API Endpoints

### Get Razorpay Configuration
```
GET /api/payments/razorpay-config
```

Returns Razorpay Key ID for frontend.

### Create Payment Order
```
POST /api/payments/create-order
Body: {
  "service_request_id": 123,
  "amount": 500,
  "customer_id": 456
}
```

Creates a Razorpay order and returns order details.

### Verify Payment
```
POST /api/payments/verify/{order_id}
Body: {
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_order_id": "order_xxxxx",
  "razorpay_signature": "signature_xxxxx"
}
```

Verifies payment signature and updates order status.

### Get Customer Payments
```
GET /api/payments/customer/{customer_id}
```

Returns all payments for a customer.

## 🛠️ Troubleshooting

### Issue: "Failed to load Razorpay SDK"

**Solution**: Check your internet connection. The Razorpay checkout script loads from CDN.

### Issue: "Invalid API Key"

**Solution**: 
- Verify your API keys in `.env`
- Ensure no extra spaces in the keys
- Check if you're using test keys in test mode

### Issue: "Payment signature verification failed"

**Solution**:
- Ensure Key Secret matches the Key ID
- Check if the signature is being passed correctly from frontend
- Verify the HMAC signature generation logic

### Issue: "Order not found"

**Solution**:
- Check database connection
- Verify the order was created successfully
- Check order_id format

### Issue: Payments work in test mode but fail in production

**Solution**:
- Verify KYC is completed
- Check if live keys are activated
- Ensure SSL certificate is valid
- Check webhook configuration

## 📊 Payment Flow Diagram

```
Customer → Select Service → Create Order
    ↓
Backend creates Razorpay order
    ↓
Frontend opens Razorpay Checkout
    ↓
Customer completes payment
    ↓
Razorpay sends payment response
    ↓
Frontend sends to backend for verification
    ↓
Backend verifies signature with Razorpay
    ↓
Update order status → Payment Complete
```

## 🔐 Security Best Practices

1. **Never expose Key Secret**: Keep it only in backend `.env`
2. **Always verify signatures**: Don't trust frontend data without verification
3. **Use HTTPS**: All production traffic must be encrypted
4. **Validate amounts**: Always verify payment amount matches order amount
5. **Log transactions**: Keep audit logs of all payment activities
6. **Handle webhooks**: Implement webhook handlers for payment status updates

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Razorpay Checkout Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)

## 💡 Support

For issues related to:
- **Razorpay Integration**: Contact Razorpay Support
- **HouseCrew Application**: Check application logs and documentation
- **Payment Failures**: Check Razorpay Dashboard → Payments for detailed error messages

---

**Last Updated**: March 2026  
**Version**: 1.0.0
