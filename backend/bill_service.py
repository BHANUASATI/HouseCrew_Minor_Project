"""
Bill Generation Service
Handles invoice/bill generation for completed payments
"""

from datetime import datetime
from typing import Optional, Dict
import os
from decimal import Decimal

class BillService:
    """Service for generating bills and invoices"""
    
    def __init__(self):
        self.company_info = {
            'name': 'HouseCrew Services',
            'address': 'Delhi, India',
            'phone': '+91-XXXXXXXXXX',
            'email': 'support@housecrew.com',
            'website': 'www.housecrew.com',
            'gstin': 'XXXXXXXXXXXX',  # GST Number
            'pan': 'XXXXXXXXXX'
        }
    
    def generate_bill_number(self, payment_id: int) -> str:
        """Generate unique bill number"""
        timestamp = datetime.now().strftime('%Y%m%d')
        return f"HC-{timestamp}-{payment_id:06d}"
    
    def calculate_tax(self, amount: float, tax_rate: float = 18.0) -> Dict[str, float]:
        """Calculate GST/tax breakdown"""
        base_amount = amount / (1 + tax_rate / 100)
        tax_amount = amount - base_amount
        cgst = tax_amount / 2  # Central GST
        sgst = tax_amount / 2  # State GST
        
        return {
            'base_amount': round(base_amount, 2),
            'tax_rate': tax_rate,
            'cgst': round(cgst, 2),
            'sgst': round(sgst, 2),
            'total_tax': round(tax_amount, 2),
            'total_amount': round(amount, 2)
        }
    
    def generate_bill_data(self, payment_data: Dict) -> Dict:
        """Generate complete bill data structure"""
        
        # Calculate tax breakdown
        tax_breakdown = self.calculate_tax(float(payment_data['amount']))
        
        bill_data = {
            'bill_number': self.generate_bill_number(payment_data['payment_id']),
            'bill_date': datetime.now().strftime('%d-%b-%Y %I:%M %p'),
            'payment_date': payment_data.get('payment_date', datetime.now().strftime('%d-%b-%Y %I:%M %p')),
            
            # Company Information
            'company': self.company_info,
            
            # Customer Information
            'customer': {
                'name': payment_data.get('customer_name', 'N/A'),
                'email': payment_data.get('customer_email', 'N/A'),
                'phone': payment_data.get('customer_phone', 'N/A'),
                'address': payment_data.get('customer_address', 'N/A')
            },
            
            # Service Details
            'service': {
                'name': payment_data.get('service_name', 'Service'),
                'category': payment_data.get('service_category', 'General'),
                'description': payment_data.get('service_description', ''),
                'date': payment_data.get('service_date', 'N/A'),
                'time': payment_data.get('service_time', 'N/A')
            },
            
            # Payment Details
            'payment': {
                'order_id': payment_data.get('order_id', 'N/A'),
                'payment_id': payment_data.get('razorpay_payment_id', 'N/A'),
                'payment_method': payment_data.get('payment_method', 'Online'),
                'status': payment_data.get('status', 'Completed'),
                'transaction_date': payment_data.get('payment_date', datetime.now().strftime('%d-%b-%Y'))
            },
            
            # Amount Breakdown
            'amount': {
                'base_amount': tax_breakdown['base_amount'],
                'cgst': tax_breakdown['cgst'],
                'sgst': tax_breakdown['sgst'],
                'total_tax': tax_breakdown['total_tax'],
                'tax_rate': tax_breakdown['tax_rate'],
                'total_amount': tax_breakdown['total_amount'],
                'amount_in_words': self.amount_to_words(tax_breakdown['total_amount'])
            },
            
            # Additional Info
            'notes': 'Thank you for choosing HouseCrew Services!',
            'terms': [
                'Service warranty as per company policy',
                'Payment is non-refundable after service completion',
                'For any queries, contact customer support'
            ]
        }
        
        return bill_data
    
    def amount_to_words(self, amount: float) -> str:
        """Convert amount to words (Indian numbering system)"""
        # Simple implementation - can be enhanced
        ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
        tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
        teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
        
        def convert_below_thousand(n):
            if n == 0:
                return ''
            elif n < 10:
                return ones[n]
            elif n < 20:
                return teens[n - 10]
            elif n < 100:
                return tens[n // 10] + (' ' + ones[n % 10] if n % 10 != 0 else '')
            else:
                return ones[n // 100] + ' Hundred' + (' ' + convert_below_thousand(n % 100) if n % 100 != 0 else '')
        
        try:
            rupees = int(amount)
            paise = int((amount - rupees) * 100)
            
            if rupees == 0:
                result = 'Zero Rupees'
            elif rupees < 1000:
                result = convert_below_thousand(rupees) + ' Rupees'
            elif rupees < 100000:
                thousands = rupees // 1000
                remainder = rupees % 1000
                result = convert_below_thousand(thousands) + ' Thousand'
                if remainder > 0:
                    result += ' ' + convert_below_thousand(remainder)
                result += ' Rupees'
            else:
                lakhs = rupees // 100000
                remainder = rupees % 100000
                result = convert_below_thousand(lakhs) + ' Lakh'
                if remainder >= 1000:
                    thousands = remainder // 1000
                    result += ' ' + convert_below_thousand(thousands) + ' Thousand'
                    remainder = remainder % 1000
                if remainder > 0:
                    result += ' ' + convert_below_thousand(remainder)
                result += ' Rupees'
            
            if paise > 0:
                result += ' and ' + convert_below_thousand(paise) + ' Paise'
            
            result += ' Only'
            return result
        except:
            return f'Rupees {amount:.2f} Only'
    
    def generate_html_bill(self, bill_data: Dict) -> str:
        """Generate HTML invoice/bill"""
        
        html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - {bill_data['bill_number']}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }}
        
        .invoice-container {{
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }}
        
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #4F46E5;
        }}
        
        .company-info {{
            flex: 1;
        }}
        
        .company-name {{
            font-size: 28px;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 10px;
        }}
        
        .company-details {{
            color: #666;
            line-height: 1.6;
        }}
        
        .invoice-title {{
            text-align: right;
            flex: 1;
        }}
        
        .invoice-title h1 {{
            font-size: 32px;
            color: #333;
            margin-bottom: 10px;
        }}
        
        .invoice-number {{
            color: #4F46E5;
            font-weight: bold;
            font-size: 16px;
        }}
        
        .info-section {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 30px 0;
        }}
        
        .info-box {{
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
        }}
        
        .info-box h3 {{
            color: #4F46E5;
            margin-bottom: 10px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        
        .info-box p {{
            color: #666;
            line-height: 1.8;
            margin: 5px 0;
        }}
        
        .service-details {{
            margin: 30px 0;
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
        }}
        
        .service-details h3 {{
            color: #4F46E5;
            margin-bottom: 15px;
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }}
        
        th {{
            background: #4F46E5;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }}
        
        td {{
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }}
        
        tr:hover {{
            background: #f9fafb;
        }}
        
        .amount-section {{
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
        }}
        
        .amount-table {{
            width: 400px;
        }}
        
        .amount-table td {{
            padding: 10px;
        }}
        
        .amount-table .label {{
            text-align: right;
            color: #666;
            font-weight: 500;
        }}
        
        .amount-table .value {{
            text-align: right;
            font-weight: 600;
        }}
        
        .total-row {{
            background: #4F46E5;
            color: white;
            font-size: 18px;
        }}
        
        .total-row td {{
            padding: 15px 10px;
            border: none;
        }}
        
        .amount-in-words {{
            background: #f9fafb;
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #4F46E5;
            font-style: italic;
            color: #666;
        }}
        
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
        }}
        
        .terms {{
            margin: 20px 0;
        }}
        
        .terms h4 {{
            color: #333;
            margin-bottom: 10px;
        }}
        
        .terms ul {{
            list-style: none;
            padding-left: 0;
        }}
        
        .terms li {{
            color: #666;
            padding: 5px 0;
            padding-left: 20px;
            position: relative;
        }}
        
        .terms li:before {{
            content: "•";
            color: #4F46E5;
            font-weight: bold;
            position: absolute;
            left: 0;
        }}
        
        .thank-you {{
            text-align: center;
            color: #4F46E5;
            font-size: 18px;
            font-weight: bold;
            margin: 30px 0;
        }}
        
        .stamp {{
            text-align: right;
            margin-top: 40px;
            color: #666;
        }}
        
        @media print {{
            body {{
                background: white;
                padding: 0;
            }}
            
            .invoice-container {{
                box-shadow: none;
                padding: 20px;
            }}
        }}
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-name">{bill_data['company']['name']}</div>
                <div class="company-details">
                    <p>{bill_data['company']['address']}</p>
                    <p>Phone: {bill_data['company']['phone']}</p>
                    <p>Email: {bill_data['company']['email']}</p>
                    <p>GSTIN: {bill_data['company']['gstin']}</p>
                </div>
            </div>
            <div class="invoice-title">
                <h1>INVOICE</h1>
                <div class="invoice-number">{bill_data['bill_number']}</div>
                <p style="color: #666; margin-top: 10px;">Date: {bill_data['bill_date']}</p>
            </div>
        </div>
        
        <!-- Customer and Payment Info -->
        <div class="info-section">
            <div class="info-box">
                <h3>Bill To</h3>
                <p><strong>{bill_data['customer']['name']}</strong></p>
                <p>{bill_data['customer']['email']}</p>
                <p>{bill_data['customer']['phone']}</p>
                <p>{bill_data['customer']['address']}</p>
            </div>
            <div class="info-box">
                <h3>Payment Details</h3>
                <p><strong>Order ID:</strong> {bill_data['payment']['order_id']}</p>
                <p><strong>Payment ID:</strong> {bill_data['payment']['payment_id']}</p>
                <p><strong>Method:</strong> {bill_data['payment']['payment_method']}</p>
                <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">{bill_data['payment']['status']}</span></p>
                <p><strong>Date:</strong> {bill_data['payment']['transaction_date']}</p>
            </div>
        </div>
        
        <!-- Service Details Table -->
        <table>
            <thead>
                <tr>
                    <th>Service Description</th>
                    <th>Category</th>
                    <th>Date & Time</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>{bill_data['service']['name']}</strong><br>
                        <small style="color: #666;">{bill_data['service']['description']}</small>
                    </td>
                    <td>{bill_data['service']['category']}</td>
                    <td>{bill_data['service']['date']}<br>{bill_data['service']['time']}</td>
                    <td style="text-align: right;">₹{bill_data['amount']['base_amount']:.2f}</td>
                </tr>
            </tbody>
        </table>
        
        <!-- Amount Breakdown -->
        <div class="amount-section">
            <table class="amount-table">
                <tr>
                    <td class="label">Subtotal:</td>
                    <td class="value">₹{bill_data['amount']['base_amount']:.2f}</td>
                </tr>
                <tr>
                    <td class="label">CGST ({bill_data['amount']['tax_rate']/2:.1f}%):</td>
                    <td class="value">₹{bill_data['amount']['cgst']:.2f}</td>
                </tr>
                <tr>
                    <td class="label">SGST ({bill_data['amount']['tax_rate']/2:.1f}%):</td>
                    <td class="value">₹{bill_data['amount']['sgst']:.2f}</td>
                </tr>
                <tr class="total-row">
                    <td class="label"><strong>TOTAL AMOUNT:</strong></td>
                    <td class="value"><strong>₹{bill_data['amount']['total_amount']:.2f}</strong></td>
                </tr>
            </table>
        </div>
        
        <!-- Amount in Words -->
        <div class="amount-in-words">
            <strong>Amount in Words:</strong> {bill_data['amount']['amount_in_words']}
        </div>
        
        <!-- Terms and Conditions -->
        <div class="terms">
            <h4>Terms & Conditions:</h4>
            <ul>
                {''.join([f'<li>{term}</li>' for term in bill_data['terms']])}
            </ul>
        </div>
        
        <!-- Thank You -->
        <div class="thank-you">
            {bill_data['notes']}
        </div>
        
        <!-- Digital Stamp -->
        <div class="stamp">
            <p><strong>This is a computer-generated invoice</strong></p>
            <p style="font-size: 12px;">Generated on: {datetime.now().strftime('%d-%b-%Y %I:%M %p')}</p>
        </div>
    </div>
</body>
</html>
        """
        
        return html

# Create singleton instance
bill_service = BillService()
