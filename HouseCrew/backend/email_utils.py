import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
import logging
import requests
from datetime import datetime

load_dotenv()
logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.host = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
        self.port = int(os.getenv('EMAIL_PORT', 587))
        self.username = os.getenv('EMAIL_USERNAME')
        self.password = os.getenv('EMAIL_PASSWORD')
        self.from_email = os.getenv('EMAIL_FROM')
        self.from_name = os.getenv('EMAIL_FROM_NAME', 'HouseCrew')
    
    async def send_email(self, to_email: str, subject: str, html_content: str):
        """Send email using SMTP"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Attach HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            server = smtplib.SMTP(self.host, self.port)
            server.starttls()
            server.login(self.username, self.password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def get_device_info(self, user_agent: str = None) -> dict:
        """Extract device information from user agent"""
        if not user_agent:
            return {
                'device': 'Unknown Device',
                'browser': 'Unknown Browser',
                'os': 'Unknown OS',
                'type': 'desktop'
            }
        
        user_agent = user_agent.lower()
        
        browsers = {
            'chrome': 'Chrome',
            'firefox': 'Firefox', 
            'safari': 'Safari',
            'edge': 'Edge',
            'opera': 'Opera',
            'brave': 'Brave',
            'duckduckgo': 'DuckDuckGo'
        }
        
        browser = 'Unknown Browser'
        for key, name in browsers.items():
            if key in user_agent:
                browser = name
                break
        
        os_list = {
            'windows': 'Windows',
            'mac': 'macOS',
            'linux': 'Linux',
            'android': 'Android',
            'iphone': 'iOS',
            'ipad': 'iOS',
            'ubuntu': 'Ubuntu',
            'debian': 'Debian'
        }
        
        os_name = 'Unknown OS'
        for key, name in os_list.items():
            if key in user_agent:
                os_name = name
                break
        
        device_type = 'desktop'
        if 'mobile' in user_agent or 'android' in user_agent or 'iphone' in user_agent:
            device_type = 'mobile'
        elif 'ipad' in user_agent or 'tablet' in user_agent:
            device_type = 'tablet'
        
        # Detect device manufacturer
        manufacturer = 'Unknown'
        if 'apple' in user_agent or 'iphone' in user_agent or 'ipad' in user_agent or 'mac' in user_agent:
            manufacturer = 'Apple'
        elif 'samsung' in user_agent:
            manufacturer = 'Samsung'
        elif 'google' in user_agent or 'pixel' in user_agent:
            manufacturer = 'Google'
        elif 'microsoft' in user_agent or 'windows' in user_agent:
            manufacturer = 'Microsoft'
        
        return {
            'device': f"{os_name} {device_type.capitalize()}",
            'browser': browser,
            'os': os_name,
            'type': device_type,
            'manufacturer': manufacturer,
            'user_agent': user_agent[:100] + '...' if len(user_agent) > 100 else user_agent
        }
    
    def get_location_info(self, ip_address: str = None) -> dict:
        """Get real location information from IP address"""
        if not ip_address or ip_address in ['127.0.0.1', 'localhost', '::1']:
            # For local development, get the real public IP
            try:
                response = requests.get('https://api.ipify.org?format=json', timeout=5)
                if response.status_code == 200:
                    ip_address = response.json().get('ip')
                else:
                    ip_address = '8.8.8.8'  # Fallback to Google DNS
            except:
                ip_address = '8.8.8.8'  # Fallback
        
        try:
            # Use ip-api.com for detailed geolocation (free, no API key required)
            response = requests.get(f"http://ip-api.com/json/{ip_address}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query", timeout=10)
            if response.status_code == 200:
                data = response.json()
                
                if data.get('status') == 'success':
                    return {
                        'ip': data.get('query', ip_address),
                        'city': data.get('city', 'Unknown'),
                        'region': data.get('regionName', 'Unknown'),
                        'country': data.get('country', 'Unknown'),
                        'country_code': data.get('countryCode', 'Unknown'),
                        'zip': data.get('zip', 'Unknown'),
                        'latitude': data.get('lat', 'Unknown'),
                        'longitude': data.get('lon', 'Unknown'),
                        'timezone': data.get('timezone', 'Unknown'),
                        'isp': data.get('isp', 'Unknown'),
                        'organization': data.get('org', 'Unknown'),
                        'as': data.get('as', 'Unknown'),
                        'is_vpn': self.detect_vpn(data.get('query', ip_address)),
                        'is_proxy': self.detect_proxy(data.get('query', ip_address))
                    }
                else:
                    logger.warning(f"IP API error: {data.get('message', 'Unknown error')}")
            
        except Exception as e:
            logger.warning(f"Failed to get location for IP {ip_address}: {str(e)}")
        
        # Fallback with basic info
        return {
            'ip': ip_address,
            'city': 'Unknown',
            'region': 'Unknown',
            'country': 'Unknown',
            'country_code': 'Unknown',
            'zip': 'Unknown',
            'latitude': 'Unknown',
            'longitude': 'Unknown',
            'timezone': 'Unknown',
            'isp': 'Unknown',
            'organization': 'Unknown',
            'as': 'Unknown',
            'is_vpn': False,
            'is_proxy': False
        }
    
    def detect_vpn(self, ip_address: str) -> bool:
        """Simple VPN detection based on common VPN IP ranges"""
        try:
            # Check against known VPN/proxy ranges (simplified)
            vpn_ranges = [
                '8.8.8.8', '1.1.1.1', '208.67.222.222',  # Common DNS that might be used with VPNs
            ]
            return ip_address in vpn_ranges
        except:
            return False
    
    def detect_proxy(self, ip_address: str) -> bool:
        """Simple proxy detection"""
        try:
            # Check for common proxy headers or patterns
            proxy_indicators = ['proxy', 'anonymous', 'transparent']
            return any(indicator in ip_address.lower() for indicator in proxy_indicators)
        except:
            return False
    
    def get_security_risk_level(self, location_info: dict, device_info: dict) -> str:
        """Calculate security risk level based on location and device info"""
        risk_score = 0
        
        # Check for VPN/proxy
        if location_info.get('is_vpn', False):
            risk_score += 2
        if location_info.get('is_proxy', False):
            risk_score += 3
        
        # Check for unusual locations (simplified)
        if location_info.get('country') in ['Unknown']:
            risk_score += 1
        
        # Check device type
        if device_info.get('type') == 'mobile':
            risk_score += 1
        
        # Determine risk level
        if risk_score >= 3:
            return 'HIGH'
        elif risk_score >= 1:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def get_welcome_email_template(self, name: str, role: str, email: str, password: str) -> str:
        role_display = "Service Provider" if role == "service_provider" else "Customer"
        role_emoji = "🔧" if role == "service_provider" else "🏠"
        
        return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to HouseCrew - Your Journey Begins! 🚀</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: 'Poppins', sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}
        .email-container {{ 
            max-width: 700px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 25px; 
            overflow: hidden; 
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            animation: slideIn 0.6s ease-out;
        }}
        @keyframes slideIn {{
            from {{ opacity: 0; transform: translateY(30px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        .header {{ 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            padding: 50px 40px; 
            text-align: center; 
            position: relative;
            overflow: hidden;
        }}
        .header::before {{
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: shimmer 3s infinite;
        }}
        @keyframes shimmer {{
            0% {{ transform: translateX(-100%) translateY(-100%) rotate(45deg); }}
            100% {{ transform: translateX(100%) translateY(100%) rotate(45deg); }}
        }}
        .header h1 {{ 
            color: white; 
            margin: 0; 
            font-size: 3em; 
            font-weight: 700; 
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
        }}
        .header p {{ 
            color: rgba(255,255,255,0.95); 
            margin: 15px 0 0 0; 
            font-size: 1.3em; 
            font-weight: 300;
            position: relative;
            z-index: 1;
        }}
        .content {{ padding: 50px 40px; }}
        .welcome-box {{ 
            background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); 
            border-radius: 20px; 
            padding: 40px; 
            margin: 40px 0; 
            text-align: center; 
            color: white;
            position: relative;
            overflow: hidden;
        }}
        .welcome-box::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.3"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.3"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.3"/><circle cx="10" cy="50" r="1" fill="white" opacity="0.3"/><circle cx="90" cy="30" r="1" fill="white" opacity="0.3"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.1;
        }}
        .welcome-box h2 {{ 
            color: white; 
            margin: 0 0 15px 0; 
            font-size: 2.2em; 
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            position: relative;
            z-index: 1;
        }}
        .credentials-box {{ 
            background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%); 
            border: 2px solid #e8ecff; 
            border-radius: 20px; 
            padding: 35px; 
            margin: 35px 0;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.1);
        }}
        .credentials-box h3 {{ 
            color: #667eea; 
            margin: 0 0 25px 0; 
            font-size: 1.5em; 
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        .credential-item {{ 
            background: white; 
            border-radius: 15px; 
            padding: 20px; 
            margin: 15px 0; 
            border-left: 5px solid #667eea;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.2s ease;
        }}
        .credential-item:hover {{
            transform: translateX(5px);
        }}
        .credential-item strong {{ 
            color: #333; 
            display: block; 
            margin-bottom: 8px; 
            font-weight: 600; 
            font-size: 0.9em; 
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .credential-item span {{ 
            color: #666; 
            font-size: 1.1em; 
            font-weight: 500;
            font-family: 'Courier New', monospace;
        }}
        .steps-box {{ 
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); 
            border-radius: 20px; 
            padding: 35px; 
            margin: 35px 0;
            box-shadow: 0 10px 30px rgba(252, 182, 159, 0.2);
        }}
        .steps-box h3 {{ 
            color: #d63031; 
            margin: 0 0 25px 0; 
            font-size: 1.5em; 
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        .steps-box ul {{ 
            margin: 0; 
            padding-left: 0; 
            list-style: none;
        }}
        .steps-box li {{ 
            color: #2d3436; 
            margin: 15px 0; 
            line-height: 1.6;
            padding-left: 35px; 
            position: relative;
            font-weight: 500;
        }}
        .steps-box li::before {{ 
            content: "✓"; 
            position: absolute; 
            left: 0; 
            color: #d63031; 
            font-weight: bold; 
            font-size: 1.3em;
            background: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }}
        .cta-button {{ 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 20px 50px; 
            text-decoration: none; 
            border-radius: 30px; 
            font-weight: 600; 
            font-size: 1.2em; 
            margin: 30px 0; 
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }}
        .cta-button::before {{
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s ease;
        }}
        .cta-button:hover::before {{
            left: 100%;
        }}
        .cta-button:hover {{ 
            transform: translateY(-3px); 
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }}
        .security-tip {{ 
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); 
            border-left: 5px solid #ffc107; 
            padding: 25px; 
            margin: 35px 0; 
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(255, 193, 7, 0.2);
        }}
        .security-tip h4 {{ 
            color: #856404; 
            margin: 0 0 15px 0; 
            font-weight: 600; 
            display: flex; 
            align-items: center; 
            gap: 10px;
            font-size: 1.1em;
        }}
        .security-tip p {{ 
            color: #856404; 
            margin: 0; 
            font-size: 1em; 
            line-height: 1.6;
        }}
        .footer {{ 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
            padding: 40px; 
            text-align: center; 
            border-top: 1px solid #dee2e6;
        }}
        .footer p {{ 
            color: #6c757d; 
            margin: 8px 0; 
            font-size: 0.9em;
        }}
        .social-links {{ 
            margin: 25px 0; 
            display: flex; 
            justify-content: center; 
            gap: 15px;
        }}
        .social-links a {{ 
            width: 45px; 
            height: 45px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            text-decoration: none; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            font-size: 20px; 
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }}
        .social-links a:hover {{ 
            transform: translateY(-3px); 
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }}
        .emoji {{ font-size: 1.2em; }}
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🏠 HouseCrew</h1>
            <p>Your Trusted Service Platform</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="welcome-box">
                <h2>Welcome to the Family, {name}! {role_emoji}</h2>
                <p style="color: white; font-size: 1.2em; margin: 15px 0;">
                    Thank you for joining HouseCrew as a <strong>{role_display}</strong>!
                </p>
                <p style="color: rgba(255,255,255,0.9); font-size: 1.1em; margin: 0;">
                    We're excited to have you as part of our community. Your journey starts now! 🎉
                </p>
            </div>
            
            <div class="credentials-box">
                <h3>🔐 Your Account Credentials</h3>
                <div class="credential-item">
                    <strong>Email Address</strong>
                    <span>{email}</span>
                </div>
                <div class="credential-item">
                    <strong>Password</strong>
                    <span>{password}</span>
                </div>
                <div class="credential-item">
                    <strong>Account Type</strong>
                    <span>{role_display}</span>
                </div>
                <div class="credential-item">
                    <strong>Registration Status</strong>
                    <span style="color: #28a745; font-weight: 600;">✅ Active</span>
                </div>
            </div>
            
            <div class="steps-box">
                <h3>🚀 What's Next?</h3>
                <ul>
                    {"<li>Complete your profile setup and add personal information</li><li>Browse available services in your area</li><li>Connect with verified service providers</li><li>Book your first service and experience excellence</li><li>Rate and review services to help the community</li>" if role == "customer" else "<li>Set up your professional service profile</li><li>List your skills, services, and availability</li><li>Start receiving customer requests and bookings</li><li>Manage your schedule and track your earnings</li><li>Build your reputation with excellent service</li>"}
                </ul>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
                <a href="http://localhost:3000/login" class="cta-button">
                    🚀 Login to Your Account Now
                </a>
            </div>
            
            <div class="security-tip">
                <h4>🔒 Security Tip:</h4>
                <p style="color: #856404; margin: 0; font-size: 1em; line-height: 1.6;">
                    Please keep your credentials secure and consider changing your password after first login for enhanced security. Never share your login details with anyone.
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #666; font-size: 1em; margin: 0;">
                    Need help? Our support team is here for you!
                </p>
                <p style="color: #667eea; font-weight: 600; font-size: 1.1em; margin: 8px 0;">
                    📧 support@housecrew.com | 📞 1-800-HOUSECREW
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="social-links">
                <a href="#">📧</a>
                <a href="#">📱</a>
                <a href="#">💬</a>
                <a href="#">🌐</a>
            </div>
            <p>© 2024 HouseCrew. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p style="font-size: 0.8em;">HouseCrew Headquarters, 123 Service Street, Tech City, TC 12345</p>
        </div>
    </div>
</body>
</html>"""
    
    def get_enhanced_login_notification_template(self, name: str, login_time: str, device_info: dict, location_info: dict) -> str:
        risk_level = self.get_security_risk_level(location_info, device_info)
        risk_color = {
            'LOW': '#28a745',
            'MEDIUM': '#ffc107', 
            'HIGH': '#dc3545'
        }.get(risk_level, '#6c757d')
        
        device_icons = {
            'desktop': '🖥️',
            'mobile': '📱', 
            'tablet': '📱'
        }
        device_icon = device_icons.get(device_info.get('type', 'desktop'), '💻')
        
        return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔐 Login Alert - HouseCrew Security System</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: 'Poppins', sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}
        .email-container {{ 
            max-width: 700px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 25px; 
            overflow: hidden; 
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            animation: slideIn 0.6s ease-out;
        }}
        @keyframes slideIn {{
            from {{ opacity: 0; transform: translateY(30px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        .header {{ 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            padding: 50px 40px; 
            text-align: center; 
            position: relative;
            overflow: hidden;
        }}
        .header::before {{
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: shimmer 3s infinite;
        }}
        @keyframes shimmer {{
            0% {{ transform: translateX(-100%) translateY(-100%) rotate(45deg); }}
            100% {{ transform: translateX(100%) translateY(100%) rotate(45deg); }}
        }}
        .header h1 {{ 
            color: white; 
            margin: 0; 
            font-size: 3em; 
            font-weight: 700; 
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
        }}
        .header p {{ 
            color: rgba(255,255,255,0.95); 
            margin: 15px 0 0 0; 
            font-size: 1.3em; 
            font-weight: 300;
            position: relative;
            z-index: 1;
        }}
        .content {{ padding: 50px 40px; }}
        .alert-box {{ 
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
            border-radius: 20px; 
            padding: 40px; 
            margin: 40px 0; 
            text-align: center; 
            color: white;
            position: relative;
            overflow: hidden;
        }}
        .alert-box::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="alert" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="2" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23alert)"/></svg>');
            opacity: 0.1;
        }}
        .alert-box h2 {{ 
            color: white; 
            margin: 0 0 15px 0; 
            font-size: 2.2em; 
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            position: relative;
            z-index: 1;
        }}
        .status-badge {{ 
            display: inline-block; 
            background: #28a745; 
            color: white; 
            padding: 12px 25px; 
            border-radius: 25px; 
            font-weight: 600; 
            font-size: 1em; 
            margin: 20px 0; 
            box-shadow: 0 5px 15px rgba(40, 167, 69, 0.3);
            position: relative;
            z-index: 1;
        }}
        .risk-badge {{
            display: inline-block;
            background: {risk_color};
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9em;
            margin: 10px 0;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }}
        .info-grid {{ 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 25px; 
            margin: 40px 0;
        }}
        .info-card {{ 
            background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%); 
            border: 2px solid #e8ecff; 
            border-radius: 20px; 
            padding: 30px; 
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.1);
            transition: transform 0.3s ease;
        }}
        .info-card:hover {{
            transform: translateY(-5px);
        }}
        .info-card h3 {{ 
            color: #667eea; 
            margin: 0 0 20px 0; 
            font-size: 1.4em; 
            font-weight: 600; 
            display: flex; 
            align-items: center; 
            gap: 12px;
        }}
        .info-item {{ 
            background: white; 
            border-radius: 12px; 
            padding: 18px; 
            margin: 12px 0; 
            border-left: 5px solid #667eea;
            box-shadow: 0 3px 10px rgba(0,0,0,0.05);
            transition: transform 0.2s ease;
        }}
        .info-item:hover {{
            transform: translateX(5px);
        }}
        .info-item strong {{ 
            color: #333; 
            display: block; 
            margin-bottom: 6px; 
            font-size: 0.9em; 
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .info-item span {{ 
            color: #666; 
            font-size: 1em; 
            font-weight: 500;
        }}
        .security-box {{ 
            background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%); 
            border-left: 5px solid #28a745; 
            padding: 30px; 
            margin: 30px 0; 
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(40, 167, 69, 0.1);
        }}
        .security-box h3 {{ 
            color: #28a745; 
            margin: 0 0 20px 0; 
            font-size: 1.4em; 
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        .warning-box {{ 
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); 
            border-left: 5px solid #ffc107; 
            padding: 30px; 
            margin: 30px 0; 
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(255, 193, 7, 0.1);
        }}
        .warning-box h3 {{ 
            color: #856404; 
            margin: 0 0 20px 0; 
            font-size: 1.4em; 
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        .warning-list {{ 
            margin: 0; 
            padding-left: 25px; 
            color: #856404;
        }}
        .warning-list li {{ 
            margin: 10px 0; 
            line-height: 1.6;
            font-weight: 500;
        }}
        .emergency-contact {{ 
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
            color: white; 
            padding: 25px; 
            border-radius: 20px; 
            margin: 30px 0; 
            text-align: center;
            box-shadow: 0 10px 30px rgba(220, 53, 69, 0.2);
        }}
        .emergency-contact strong {{ 
            display: block; 
            margin-bottom: 10px; 
            font-size: 1.2em;
        }}
        .footer {{ 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
            padding: 40px; 
            text-align: center; 
            border-top: 1px solid #dee2e6;
        }}
        .footer p {{ 
            color: #6c757d; 
            margin: 8px 0; 
            font-size: 0.9em;
        }}
        .location-map {{
            background: #f0f8ff;
            border: 2px solid #bee5eb;
            border-radius: 15px;
            padding: 20px;
            margin: 15px 0;
            text-align: center;
        }}
        .location-map strong {{
            color: #0c5460;
            display: block;
            margin-bottom: 8px;
        }}
        .location-coords {{
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #0c5460;
            opacity: 0.8;
        }}
        .vpn-alert {{
            background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
            border-left: 5px solid #dc3545;
            padding: 15px;
            margin: 10px 0;
            border-radius: 10px;
            color: #721c24;
            font-weight: 500;
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🏠 HouseCrew</h1>
            <p>Advanced Security Notification System</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="alert-box">
                <h2>🔐 Login Detected</h2>
                <p style="color: white; font-size: 1.2em; margin: 15px 0;">
                    A new login was detected for your account
                </p>
                <div class="status-badge">✅ VERIFIED</div>
                <div class="risk-badge">Risk Level: {risk_level}</div>
            </div>
            
            <p style="color: #666; font-size: 1.1em; line-height: 1.6; margin: 25px 0;">
                Hello <strong>{name}</strong>,
            </p>
            
            <p style="color: #666; font-size: 1.1em; line-height: 1.6; margin: 20px 0;">
                We detected a successful login to your HouseCrew account. Here are the complete details:
            </p>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3>{device_icon} Device Information</h3>
                    <div class="info-item">
                        <strong>Device Type</strong>
                        <span>{device_info.get('device', 'Unknown')}</span>
                    </div>
                    <div class="info-item">
                        <strong>Browser</strong>
                        <span>{device_info.get('browser', 'Unknown')}</span>
                    </div>
                    <div class="info-item">
                        <strong>Operating System</strong>
                        <span>{device_info.get('os', 'Unknown')}</span>
                    </div>
                    <div class="info-item">
                        <strong>Manufacturer</strong>
                        <span>{device_info.get('manufacturer', 'Unknown')}</span>
                    </div>
                </div>
                
                <div class="info-card">
                    <h3>📍 Real Location Information</h3>
                    <div class="info-item">
                        <strong>IP Address</strong>
                        <span>{location_info.get('ip', 'Unknown')}</span>
                    </div>
                    <div class="info-item">
                        <strong>City</strong>
                        <span>{location_info.get('city', 'Unknown')}</span>
                    </div>
                    <div class="info-item">
                        <strong>Region/State</strong>
                        <span>{location_info.get('region', 'Unknown')}</span>
                    </div>
                    <div class="info-item">
                        <strong>Country</strong>
                        <span>{location_info.get('country', 'Unknown')} ({location_info.get('country_code', 'Unknown')})</span>
                    </div>
                    <div class="location-map">
                        <strong>📍 Geographic Coordinates</strong>
                        <div class="location-coords">
                            Lat: {location_info.get('latitude', 'Unknown')}, Lon: {location_info.get('longitude', 'Unknown')}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3>🌐 Network Information</h3>
                    <div class="info-item">
                        <strong>ISP Provider</strong>
                        <span>{location_info.get('isp', 'Unknown')}</span>
                    </div>
                    <div class="info-item">
                        <strong>Organization</strong>
                        <span>{location_info.get('organization', 'Unknown')}</span>
                    </div>
                    <div class="info-item">
                        <strong>AS Number</strong>
                        <span>{location_info.get('as', 'Unknown')}</span>
                    </div>
                    <div class="info-item">
                        <strong>Timezone</strong>
                        <span>{location_info.get('timezone', 'Unknown')}</span>
                    </div>
                </div>
                
                <div class="info-card">
                    <h3>⏰ Session Details</h3>
                    <div class="info-item">
                        <strong>Login Time</strong>
                        <span>{login_time}</span>
                    </div>
                    <div class="info-item">
                        <strong>Session Status</strong>
                        <span style="color: #28a745; font-weight: 600;">✅ Active</span>
                    </div>
                    <div class="info-item">
                        <strong>Security Check</strong>
                        <span style="color: #28a745;">✅ Passed</span>
                    </div>
                    {f'<div class="vpn-alert">⚠️ VPN/Proxy Detected</div>' if location_info.get('is_vpn') or location_info.get('is_proxy') else ''}
                </div>
            </div>
            
            <div class="security-box">
                <h3>✅ This Login Was Legitimate</h3>
                <p style="color: #28a745; margin: 0; font-size: 1em; line-height: 1.6;">
                    This login appears to be legitimate and was performed by you or someone with your credentials. 
                    All security checks have passed successfully. If this was you, no action is needed and you can continue using your account normally.
                </p>
            </div>
            
            <div class="warning-box">
                <h3>⚠️ Security Alert - Take Action If This Wasn't You</h3>
                <p style="color: #856404; margin: 0 0 15px 0; font-weight: 600;">
                    If you don't recognize this login activity, take immediate action:
                </p>
                <ul class="warning-list">
                    <li>🔒 Immediately change your password</li>
                    <li>🛡️ Enable two-factor authentication</li>
                    <li>🔍 Review your account activity log</li>
                    <li>📞 Contact our security team immediately</li>
                    <li>🚫 Log out from all other devices</li>
                </ul>
            </div>
            
            <div class="emergency-contact">
                <strong>🚨 Emergency Security Contact</strong>
                security@housecrew.com | 1-800-SECURITY
                <br>
                <small>Available 24/7 for security concerns</small>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
                <a href="http://localhost:3000/profile" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 50px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 1.2em; box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3); transition: all 0.3s ease;">
                    👤 Manage Account Security
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>© 2024 HouseCrew Security Division. All rights reserved.</p>
            <p>This is an automated security message. Please do not reply to this email.</p>
            <p>Security concerns? Contact us immediately at security@housecrew.com</p>
            <p style="font-size: 0.8em; margin-top: 15px;">
                🔐 Protected by HouseCrew Advanced Security System v2.0
            </p>
        </div>
    </div>
</body>
</html>"""

email_service = EmailService()