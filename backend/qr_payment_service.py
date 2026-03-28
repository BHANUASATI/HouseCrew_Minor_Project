"""
QR Code Payment Service
Generates UPI QR codes for payments
"""

import qrcode
import io
import base64
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class QRPaymentService:
    """Service for generating UPI QR codes for payments"""
    
    def __init__(self):
        self.upi_id = "housecrew@paytm"  # Replace with your actual UPI ID
        self.merchant_name = "HouseCrew Services"
        
    def generate_upi_string(self, amount: float, order_id: str, customer_name: str = "") -> str:
        """
        Generate UPI payment string
        
        Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&tn=DESCRIPTION&cu=INR
        
        Args:
            amount: Payment amount
            order_id: Order/transaction ID
            customer_name: Customer name (optional)
            
        Returns:
            UPI payment string
        """
        upi_params = {
            'pa': self.upi_id,  # Payee address (UPI ID)
            'pn': self.merchant_name,  # Payee name
            'am': f"{amount:.2f}",  # Amount
            'tn': f"HouseCrew Payment - Order {order_id}",  # Transaction note
            'cu': 'INR'  # Currency
        }
        
        # Add customer name if provided
        if customer_name:
            upi_params['tn'] = f"Payment from {customer_name} - Order {order_id}"
        
        # Build UPI string
        upi_string = "upi://pay?" + "&".join([f"{k}={v}" for k, v in upi_params.items()])
        
        return upi_string
    
    def generate_qr_code(self, upi_string: str, size: int = 10) -> bytes:
        """
        Generate QR code image from UPI string
        
        Args:
            upi_string: UPI payment string
            size: QR code size (default: 10)
            
        Returns:
            QR code image as bytes
        """
        try:
            # Create QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=size,
                border=4,
            )
            qr.add_data(upi_string)
            qr.make(fit=True)
            
            # Create image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to bytes
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            
            return img_byte_arr.getvalue()
            
        except Exception as e:
            logger.error(f"QR code generation error: {e}")
            raise
    
    def generate_qr_code_base64(self, upi_string: str, size: int = 10) -> str:
        """
        Generate QR code as base64 string for embedding in HTML/JSON
        
        Args:
            upi_string: UPI payment string
            size: QR code size (default: 10)
            
        Returns:
            Base64 encoded QR code image
        """
        try:
            qr_bytes = self.generate_qr_code(upi_string, size)
            base64_string = base64.b64encode(qr_bytes).decode('utf-8')
            return f"data:image/png;base64,{base64_string}"
            
        except Exception as e:
            logger.error(f"QR code base64 generation error: {e}")
            raise
    
    def create_payment_qr(self, amount: float, order_id: str, customer_name: str = "", 
                         size: int = 10) -> Dict[str, str]:
        """
        Create complete payment QR code data
        
        Args:
            amount: Payment amount
            order_id: Order ID
            customer_name: Customer name (optional)
            size: QR code size
            
        Returns:
            Dictionary with UPI string and base64 QR code
        """
        try:
            # Generate UPI string
            upi_string = self.generate_upi_string(amount, order_id, customer_name)
            
            # Generate QR code
            qr_code_base64 = self.generate_qr_code_base64(upi_string, size)
            
            return {
                'upi_string': upi_string,
                'qr_code': qr_code_base64,
                'amount': amount,
                'order_id': order_id,
                'merchant_name': self.merchant_name,
                'upi_id': self.upi_id
            }
            
        except Exception as e:
            logger.error(f"Payment QR creation error: {e}")
            raise
    
    def generate_razorpay_qr(self, razorpay_order_id: str, amount: float) -> Optional[str]:
        """
        Generate QR code for Razorpay order (if Razorpay QR is enabled)
        
        Note: This requires Razorpay QR Code API to be enabled on your account
        
        Args:
            razorpay_order_id: Razorpay order ID
            amount: Payment amount
            
        Returns:
            QR code data URL or None
        """
        # This is a placeholder for Razorpay QR integration
        # Razorpay provides their own QR code API
        # For now, we'll use our UPI QR code
        logger.info(f"Razorpay QR requested for order: {razorpay_order_id}")
        return None

# Create global instance
qr_payment_service = QRPaymentService()
