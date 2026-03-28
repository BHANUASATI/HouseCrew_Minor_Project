/**
 * Razorpay Payment Utility
 * Handles Razorpay Checkout integration for HouseCrew
 */

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async ({
  orderId,
  amount,
  currency = 'INR',
  keyId,
  customerName,
  customerEmail,
  customerPhone,
  description,
  onSuccess,
  onFailure,
}) => {
  try {
    // Load Razorpay script
    const isScriptLoaded = await loadRazorpayScript();
    
    if (!isScriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Razorpay options
    const options = {
      key: keyId,
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      name: 'HouseCrew',
      description: description || 'Service Payment',
      order_id: orderId,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
      theme: {
        color: '#4F46E5', // Indigo color matching your theme
      },
      handler: function (response) {
        // Payment successful
        console.log('Razorpay payment successful:', response);
        
        if (onSuccess) {
          onSuccess({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        }
      },
      modal: {
        ondismiss: function () {
          // Payment cancelled by user
          console.log('Razorpay payment cancelled');
          
          if (onFailure) {
            onFailure(new Error('Payment cancelled by user'));
          }
        },
      },
    };

    // Create Razorpay instance and open checkout
    const razorpay = new window.Razorpay(options);
    
    razorpay.on('payment.failed', function (response) {
      // Payment failed
      console.error('Razorpay payment failed:', response.error);
      
      if (onFailure) {
        onFailure(new Error(response.error.description || 'Payment failed'));
      }
    });

    razorpay.open();
    
  } catch (error) {
    console.error('Error initiating Razorpay payment:', error);
    if (onFailure) {
      onFailure(error);
    }
  }
};

export const formatAmountForDisplay = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatAmountForRazorpay = (amount) => {
  // Convert to paise (smallest unit)
  return Math.round(amount * 100);
};
