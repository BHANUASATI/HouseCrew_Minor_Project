import razorpay
import os
import logging
from dotenv import load_dotenv
import hmac
import hashlib

load_dotenv()

logger = logging.getLogger(__name__)

class RazorpayService:
    """Service class for handling Razorpay payment operations"""
    
    def __init__(self):
        self.key_id = os.getenv('RAZORPAY_KEY_ID')
        self.key_secret = os.getenv('RAZORPAY_KEY_SECRET')
        self.webhook_secret = os.getenv('RAZORPAY_WEBHOOK_SECRET')
        
        # Check if credentials are placeholder values or not set
        is_placeholder = (
            not self.key_id or 
            not self.key_secret or 
            self.key_id == 'your_razorpay_key_id_here' or
            self.key_secret == 'your_razorpay_key_secret_here' or
            len(self.key_id) < 10
        )
        
        if is_placeholder:
            logger.warning("Razorpay credentials not configured. Using test mode.")
            self.client = None
            self.key_id = 'rzp_test_demo'  # Set demo key for frontend
        else:
            try:
                self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
                logger.info("Razorpay client initialized successfully")
            except Exception as e:
                logger.error(f"Razorpay initialization failed: {e}. Using test mode.")
                self.client = None
                self.key_id = 'rzp_test_demo'
    
    def create_order(self, amount, currency='INR', receipt=None, notes=None):
        """
        Create a Razorpay order
        
        Args:
            amount: Amount in smallest currency unit (paise for INR)
            currency: Currency code (default: INR)
            receipt: Receipt ID for reference
            notes: Additional notes as dictionary
            
        Returns:
            dict: Order details from Razorpay
        """
        try:
            if not self.client:
                # Return mock order for testing without credentials
                import uuid
                return {
                    'id': f'order_test_{uuid.uuid4().hex[:12]}',
                    'amount': amount,
                    'currency': currency,
                    'receipt': receipt,
                    'status': 'created',
                    'test_mode': True
                }
            
            # Convert amount to paise (smallest unit)
            amount_in_paise = int(amount * 100)
            
            order_data = {
                'amount': amount_in_paise,
                'currency': currency,
                'receipt': receipt or f'rcpt_{os.urandom(8).hex()}',
            }
            
            if notes:
                order_data['notes'] = notes
            
            order = self.client.order.create(data=order_data)
            logger.info(f"Razorpay order created: {order['id']}")
            return order
            
        except Exception as e:
            logger.error(f"Error creating Razorpay order: {e}")
            raise
    
    def verify_payment_signature(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        """
        Verify Razorpay payment signature
        
        Args:
            razorpay_order_id: Order ID from Razorpay
            razorpay_payment_id: Payment ID from Razorpay
            razorpay_signature: Signature from Razorpay
            
        Returns:
            bool: True if signature is valid, False otherwise
        """
        try:
            if not self.client:
                # In test mode, accept any signature
                logger.warning("Test mode: Skipping signature verification")
                return True
            
            # Create signature string
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            
            # Generate expected signature
            expected_signature = hmac.new(
                self.key_secret.encode('utf-8'),
                message.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            # Compare signatures
            is_valid = hmac.compare_digest(expected_signature, razorpay_signature)
            
            if is_valid:
                logger.info(f"Payment signature verified for order: {razorpay_order_id}")
            else:
                logger.warning(f"Invalid payment signature for order: {razorpay_order_id}")
            
            return is_valid
            
        except Exception as e:
            logger.error(f"Error verifying payment signature: {e}")
            return False
    
    def fetch_payment(self, payment_id):
        """
        Fetch payment details from Razorpay
        
        Args:
            payment_id: Razorpay payment ID
            
        Returns:
            dict: Payment details
        """
        try:
            if not self.client:
                return {
                    'id': payment_id,
                    'status': 'captured',
                    'test_mode': True
                }
            
            payment = self.client.payment.fetch(payment_id)
            logger.info(f"Fetched payment details: {payment_id}")
            return payment
            
        except Exception as e:
            logger.error(f"Error fetching payment: {e}")
            raise
    
    def capture_payment(self, payment_id, amount, currency='INR'):
        """
        Capture a payment
        
        Args:
            payment_id: Razorpay payment ID
            amount: Amount to capture in smallest unit
            currency: Currency code
            
        Returns:
            dict: Captured payment details
        """
        try:
            if not self.client:
                return {
                    'id': payment_id,
                    'status': 'captured',
                    'amount': amount,
                    'test_mode': True
                }
            
            amount_in_paise = int(amount * 100)
            payment = self.client.payment.capture(payment_id, amount_in_paise, {'currency': currency})
            logger.info(f"Payment captured: {payment_id}")
            return payment
            
        except Exception as e:
            logger.error(f"Error capturing payment: {e}")
            raise
    
    def create_refund(self, payment_id, amount=None, notes=None):
        """
        Create a refund for a payment
        
        Args:
            payment_id: Razorpay payment ID
            amount: Amount to refund (None for full refund)
            notes: Additional notes
            
        Returns:
            dict: Refund details
        """
        try:
            if not self.client:
                import uuid
                return {
                    'id': f'rfnd_test_{uuid.uuid4().hex[:12]}',
                    'payment_id': payment_id,
                    'amount': amount,
                    'status': 'processed',
                    'test_mode': True
                }
            
            refund_data = {'payment_id': payment_id}
            
            if amount:
                refund_data['amount'] = int(amount * 100)
            
            if notes:
                refund_data['notes'] = notes
            
            refund = self.client.payment.refund(payment_id, refund_data)
            logger.info(f"Refund created: {refund['id']} for payment: {payment_id}")
            return refund
            
        except Exception as e:
            logger.error(f"Error creating refund: {e}")
            raise
    
    def verify_webhook_signature(self, payload, signature):
        """
        Verify webhook signature from Razorpay
        
        Args:
            payload: Webhook payload as string
            signature: Signature from webhook header
            
        Returns:
            bool: True if signature is valid
        """
        try:
            if not self.webhook_secret:
                logger.warning("Webhook secret not configured")
                return False
            
            expected_signature = hmac.new(
                self.webhook_secret.encode('utf-8'),
                payload.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, signature)
            
        except Exception as e:
            logger.error(f"Error verifying webhook signature: {e}")
            return False
    
    def get_key_id(self):
        """Get Razorpay Key ID for frontend"""
        return self.key_id or 'rzp_test_demo'

# Create singleton instance
razorpay_service = RazorpayService()
