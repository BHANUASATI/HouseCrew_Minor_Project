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
        
        return {
            'device': f"{os_name} {browser}",
            'browser': browser,
            'os': os_name,
            'type': device_type
        }
    
    def get_security_risk_level(self, location_info: dict, device_info: dict) -> str:
        """Calculate security risk level based on location and device info"""
        # Simple risk assessment - you can enhance this
        risk_factors = 0
        
        # Check if location is unknown
        if location_info.get('city') == 'Unknown':
            risk_factors += 1
        
        # Check if device is new (this would require tracking in a real system)
        # For now, we'll assume low risk for known devices
        if device_info.get('type') == 'mobile':
            risk_factors += 0.5
        
        if risk_factors >= 1.5:
            return 'HIGH'
        elif risk_factors >= 0.5:
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
            animation: slideIn 0.8s ease-out;
        }}
        @keyframes slideIn {{
            from {{ opacity: 0; transform: translateY(50px) scale(0.9); }}
            to {{ opacity: 1; transform: translateY(0) scale(1); }}
        }}
        .header {{ 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            padding: 60px 40px; 
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
            font-size: 3.5em; 
            font-weight: 700; 
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
            animation: bounceIn 1s ease-out 0.3s both;
        }}
        @keyframes bounceIn {{
            0% {{ transform: scale(0.3); opacity: 0; }}
            50% {{ transform: scale(1.05); }}
            70% {{ transform: scale(0.9); }}
            100% {{ transform: scale(1); opacity: 1; }}
        }}
        .header p {{ 
            color: rgba(255,255,255,0.95); 
            margin: 20px 0 0 0; 
            font-size: 1.4em; 
            font-weight: 300;
            position: relative;
            z-index: 1;
            animation: fadeInUp 1s ease-out 0.6s both;
        }}
        @keyframes fadeInUp {{
            from {{ opacity: 0; transform: translateY(30px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        .content {{ padding: 60px 40px; }}
        .welcome-box {{ 
            background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); 
            border-radius: 25px; 
            padding: 50px; 
            margin: 50px 0; 
            text-align: center; 
            color: white;
            position: relative;
            overflow: hidden;
            animation: slideInLeft 1s ease-out 0.9s both;
        }}
        @keyframes slideInLeft {{
            from {{ opacity: 0; transform: translateX(-50px); }}
            to {{ opacity: 1; transform: translateX(0); }}
        }}
        .welcome-box h2 {{ 
            color: white; 
            margin: 0 0 20px 0; 
            font-size: 2.5em; 
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            position: relative;
            z-index: 1;
        }}
        .welcome-box .role-icon {{
            font-size: 4em;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }}
        @keyframes pulse {{
            0%, 100% {{ transform: scale(1); }}
            50% {{ transform: scale(1.1); }}
        }}
        .details-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin: 50px 0;
        }}
        .detail-card {{
            background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
            border-radius: 20px;
            padding: 30px;
            border: 2px solid #e8ecff;
            transition: all 0.3s ease;
            animation: fadeInUp 1s ease-out 1.2s both;
        }}
        .detail-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(102, 126, 234, 0.2);
            border-color: #667eea;
        }}
        .detail-card h3 {{
            color: #667eea;
            margin: 0 0 15px 0;
            font-size: 1.3em;
            font-weight: 600;
        }}
        .detail-card p {{
            color: #666;
            margin: 5px 0;
            font-size: 1.1em;
        }}
        .cta-button {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 40px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1.1em;
            transition: all 0.3s ease;
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
            animation: slideInUp 1s ease-out 1.5s both;
        }}
        @keyframes slideInUp {{
            from {{ opacity: 0; transform: translateY(30px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        .cta-button:hover {{
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }}
        .next-steps {{
            background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
            border-radius: 20px;
            padding: 40px;
            margin: 50px 0;
            border-left: 5px solid #28a745;
            animation: slideInRight 1s ease-out 1.8s both;
        }}
        @keyframes slideInRight {{
            from {{ opacity: 0; transform: translateX(50px); }}
            to {{ opacity: 1; transform: translateX(0); }}
        }}
        .next-steps h3 {{
            color: #28a745;
            margin: 0 0 20px 0;
            font-size: 1.8em;
            font-weight: 600;
        }}
        .next-steps ul {{
            color: #666;
            line-height: 1.8;
            font-size: 1.1em;
            margin-left: 20px;
        }}
        .footer {{
            text-align: center;
            padding: 40px 20px;
            border-top: 1px solid #eee;
            background: #f9f9f9;
            animation: fadeIn 1s ease-out 2.1s both;
        }}
        @keyframes fadeIn {{
            from {{ opacity: 0; }}
            to {{ opacity: 1; }}
        }}
        @media (max-width: 768px) {{
            .email-container {{
                margin: 10px;
                border-radius: 15px;
            }}
            .header {{
                padding: 40px 20px;
            }}
            .header h1 {{
                font-size: 2.5em;
            }}
            .content {{
                padding: 40px 20px;
            }}
            .welcome-box {{
                padding: 30px 20px;
                margin: 30px 0;
            }}
            .details-grid {{
                grid-template-columns: 1fr;
                gap: 20px;
            }}
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Welcome to HouseCrew! 🏠</h1>
            <p>Your trusted home services platform</p>
        </div>
        
        <div class="content">
            <div class="welcome-box">
                <div class="role-icon">{role_emoji}</div>
                <h2>Welcome, {name}!</h2>
                <p style="font-size: 1.2em; margin-bottom: 0;">You're now part of our {role_display} community</p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
                <h2 style="color: #333; margin-bottom: 10px;">Your Account Details</h2>
                <p style="color: #666;">Here's your login information</p>
            </div>
            
            <div class="details-grid">
                <div class="detail-card">
                    <h3>📧 Email Address</h3>
                    <p><strong>{email}</strong></p>
                </div>
                
                <div class="detail-card">
                    <h3>� Password</h3>
                    <p><strong style="color: #667eea; font-family: 'Courier New', monospace;">{password}</strong></p>
                </div>
                
                <div class="detail-card">
                    <h3>� Account Type</h3>
                    <p><strong>{role_display}</strong></p>
                </div>
                
                <div class="detail-card">
                    <h3>📅 Registration Date</h3>
                    <p><strong>{datetime.now().strftime('%B %d, %Y')}</strong></p>
                </div>
                
                <div class="detail-card">
                    <h3>🛡️ Account Status</h3>
                    <p><strong style="color: #28a745;">Active ✅</strong></p>
                </div>
                
                <div class="detail-card">
                    <h3>🌐 Login URL</h3>
                    <p><strong><a href="http://localhost:5173/auth" style="color: #667eea;">housecrew.com/auth</a></strong></p>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); border-left: 5px solid #ffc107; padding: 30px; margin: 40px 0; border-radius: 20px;">
                <h3 style="color: #856404; margin: 0 0 20px 0; font-size: 1.4em;">🔐 Important Security Information</h3>
                <div style="background: white; border-radius: 15px; padding: 25px; margin: 20px 0;">
                    <h4 style="color: #333; margin: 0 0 15px 0;">Your Login Credentials:</h4>
                    <div style="background: #f8f9ff; border: 2px solid #e8ecff; border-radius: 10px; padding: 20px; margin: 15px 0;">
                        <p style="margin: 8px 0;"><strong>Email:</strong> <span style="color: #667eea;">{email}</span></p>
                        <p style="margin: 8px 0;"><strong>Password:</strong> <span style="color: #dc3545; font-family: 'Courier New', monospace; font-weight: bold;">{password}</span></p>
                    </div>
                    <p style="color: #856404; margin: 15px 0 0 0; font-size: 0.9em;">
                        ⚠️ Please save these credentials securely. You can change your password after login.
                    </p>
                </div>
            </div>
            
            <div style="text-align: center; margin: 50px 0;">
                <a href="http://localhost:5173/auth" class="cta-button">
                    🔐 Login to Your Account Now
                </a>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin: 50px 0;">
                <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d1ecf1 100%); border-radius: 20px; padding: 30px; border-left: 5px solid #17a2b8;">
                    <h3 style="color: #17a2b8; margin: 0 0 20px 0; font-size: 1.4em;">🚀 Quick Actions</h3>
                    <div style="background: white; border-radius: 15px; padding: 20px;">
                        <a href="http://localhost:5173/auth" style="display: block; background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 15px 20px; text-decoration: none; border-radius: 10px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s ease;">
                            🔐 Go to Login
                        </a>
                        <a href="http://localhost:5173/dashboard" style="display: block; background: linear-gradient(135deg, #28a745 0%, #218838 100%); color: white; padding: 15px 20px; text-decoration: none; border-radius: 10px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s ease;">
                            📊 Visit Dashboard
                        </a>
                        <a href="http://localhost:5173/profile" style="display: block; background: linear-gradient(135deg, #667eea 0%, #5a6fd8 100%); color: white; padding: 15px 20px; text-decoration: none; border-radius: 10px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s ease;">
                            👤 Update Profile
                        </a>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%); border-radius: 20px; padding: 30px; border-left: 5px solid #667eea;">
                    <h3 style="color: #667eea; margin: 0 0 20px 0; font-size: 1.4em;">💬 Support & Help</h3>
                    <div style="background: white; border-radius: 15px; padding: 20px;">
                        <a href="mailto:support@housecrew.com" style="display: block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 20px; text-decoration: none; border-radius: 10px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s ease;">
                            📧 Email Support
                        </a>
                        <a href="tel:+919876543210" style="display: block; background: linear-gradient(135deg, #28a745 0%, #218838 100%); color: white; padding: 15px 20px; text-decoration: none; border-radius: 10px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s ease;">
                            📞 Call Support: +91 98765 43210
                        </a>
                        <a href="http://localhost:5173/help" style="display: block; background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); color: #333; padding: 15px 20px; text-decoration: none; border-radius: 10px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s ease;">
                            📚 Help Center
                        </a>
                        <a href="http://localhost:5173/faq" style="display: block; background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 15px 20px; text-decoration: none; border-radius: 10px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s ease;">
                            ❓ FAQs
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="next-steps">
                <h3>🚀 What's Next?</h3>"""
        
        if role == 'customer':
            next_steps = """
                <ul>
                    <li>Browse available home services in your area</li>
                    <li>Book appointments with trusted service providers</li>
                    <li>Manage your service requests and bookings</li>
                    <li>Rate and review service providers</li>
                    <li>Get exclusive discounts on first bookings</li>
                </ul>"""
        else:
            next_steps = """
                <ul>
                    <li>Complete your service provider profile</li>
                    <li>Showcase your skills and experience</li>
                    <li>Set your service areas and availability</li>
                    <li>Start receiving service requests from customers</li>
                    <li>Build your reputation with positive reviews</li>
                </ul>"""
        
        return f"""{next_steps}
            </div>
            
            <div class="footer">
                <p style="color: #999; margin: 20px 0 10px 0;">
                    🎧 Need help? Contact us at 
                    <a href="mailto:support@housecrew.com" style="color: #667eea;">support@housecrew.com</a>
                </p>
                
                <p style="color: #999; margin: 10px 0 0 0; font-size: 0.9em;">
                    © 2024 HouseCrew. All rights reserved. | 
                    <a href="#" style="color: #667eea;">Privacy Policy</a> | 
                    <a href="#" style="color: #667eea;">Terms of Service</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>"""
    
    def get_enhanced_login_notification_template(self, name: str, login_time: str, device_info: dict, location_info: dict) -> str:
        risk_level = self.get_security_risk_level(location_info, device_info)
        risk_colors = {
            'LOW': '#28a745',
            'MEDIUM': '#ffc107', 
            'HIGH': '#dc3545'
        }
        risk_color = risk_colors.get(risk_level, '#6c757d')
        
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
            animation: slideIn 0.8s ease-out;
        }}
        @keyframes slideIn {{
            from {{ opacity: 0; transform: translateY(50px) scale(0.9); }}
            to {{ opacity: 1; transform: translateY(0) scale(1); }}
        }}
        .header {{ 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            padding: 60px 40px; 
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
            font-size: 3.5em; 
            font-weight: 700; 
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
            animation: bounceIn 1s ease-out 0.3s both;
        }}
        @keyframes bounceIn {{
            0% {{ transform: scale(0.3); opacity: 0; }}
            50% {{ transform: scale(1.05); }}
            70% {{ transform: scale(0.9); }}
            100% {{ transform: scale(1); opacity: 1; }}
        }}
        .header p {{ 
            color: rgba(255,255,255,0.95); 
            margin: 20px 0 0 0; 
            font-size: 1.4em; 
            font-weight: 300;
            position: relative;
            z-index: 1;
            animation: fadeInUp 1s ease-out 0.6s both;
        }}
        @keyframes fadeInUp {{
            from {{ opacity: 0; transform: translateY(30px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        .content {{ padding: 60px 40px; }}
        .alert-box {{ 
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
            border-radius: 25px; 
            padding: 50px; 
            margin: 50px 0; 
            text-align: center; 
            color: white;
            position: relative;
            overflow: hidden;
            animation: slideInLeft 1s ease-out 0.9s both;
        }}
        @keyframes slideInLeft {{
            from {{ opacity: 0; transform: translateX(-50px); }}
            to {{ opacity: 1; transform: translateX(0); }}
        }}
        .alert-box h2 {{ 
            color: white; 
            margin: 0 0 20px 0; 
            font-size: 2.5em; 
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            position: relative;
            z-index: 1;
        }}
        .alert-box .alert-icon {{
            font-size: 4em;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
        }}
        @keyframes pulse {{
            0%, 100% {{ transform: scale(1); }}
            50% {{ transform: scale(1.1); }}
        }}
        .details-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin: 50px 0;
        }}
        .detail-card {{
            background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
            border-radius: 20px;
            padding: 30px;
            border: 2px solid #e8ecff;
            transition: all 0.3s ease;
            animation: fadeInUp 1s ease-out 1.2s both;
        }}
        .detail-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(102, 126, 234, 0.2);
            border-color: #667eea;
        }}
        .detail-card h3 {{
            color: #667eea;
            margin: 0 0 15px 0;
            font-size: 1.3em;
            font-weight: 600;
        }}
        .detail-card p {{
            color: #666;
            margin: 5px 0;
            font-size: 1.1em;
        }}
        .security-status {{
            background: {risk_color}; 
            color: white; 
            padding: 30px; 
            border-radius: 20px; 
            margin: 40px 0; 
            text-align: center;
            animation: slideInUp 1s ease-out 1.5s both;
        }}
        .security-status h3 {{
            margin: 0 0 15px 0;
            font-size: 1.8em;
            font-weight: 600;
        }}
        .security-status p {{
            margin: 0;
            font-size: 1.2em;
        }}
        .action-buttons {{
            text-align: center; 
            margin: 50px 0;
        }}
        .action-button {{
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 40px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1.1em;
            margin: 0 15px;
            transition: all 0.3s ease;
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
            animation: slideInUp 1s ease-out 1.8s both;
        }}
        .action-button:hover {{
            transform: translateY(-3px);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }}
        .action-button.danger {{
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            box-shadow: 0 10px 25px rgba(220, 53, 69, 0.3);
        }}
        .action-button.danger:hover {{
            box-shadow: 0 15px 35px rgba(220, 53, 69, 0.4);
        }}
        .security-tips {{
            background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
            border-radius: 20px;
            padding: 40px;
            margin: 50px 0;
            border-left: 5px solid #28a745;
            animation: slideInRight 1s ease-out 2.1s both;
        }}
        @keyframes slideInRight {{
            from {{ opacity: 0; transform: translateX(50px); }}
            to {{ opacity: 1; transform: translateX(0); }}
        }}
        .security-tips h3 {{
            color: #28a745;
            margin: 0 0 25px 0;
            font-size: 1.8em;
            font-weight: 600;
        }}
        .security-tips ul {{
            color: #666;
            line-height: 1.8;
            font-size: 1.1em;
            margin-left: 20px;
        }}
        .footer {{
            text-align: center;
            padding: 40px 20px;
            border-top: 1px solid #eee;
            background: #f9f9f9;
            animation: fadeIn 1s ease-out 2.4s both;
        }}
        @keyframes fadeIn {{
            from {{ opacity: 0; }}
            to {{ opacity: 1; }}
        }}
        @media (max-width: 768px) {{
            .email-container {{
                margin: 10px;
                border-radius: 15px;
            }}
            .header {{
                padding: 40px 20px;
            }}
            .header h1 {{
                font-size: 2.5em;
            }}
            .content {{
                padding: 40px 20px;
            }}
            .alert-box {{
                padding: 30px 20px;
                margin: 30px 0;
            }}
            .details-grid {{
                grid-template-columns: 1fr;
                gap: 20px;
            }}
            .action-button {{
                display: block;
                margin: 15px 0;
            }}
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🔐 Login Alert</h1>
            <p>New sign-in detected for your account</p>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <div class="alert-icon">🛡️</div>
                <h2>Hello, {name}!</h2>
                <p style="font-size: 1.2em; margin-bottom: 0;">We detected a new login to your HouseCrew account</p>
            </div>
            
            <div class="details-grid">
                <div class="detail-card">
                    <h3>👤 Account Name</h3>
                    <p><strong>{name}</strong></p>
                </div>
                
                <div class="detail-card">
                    <h3>⏰ Login Time</h3>
                    <p><strong>{login_time}</strong></p>
                </div>
                
                <div class="detail-card">
                    <h3>🌍 IP Address</h3>
                    <p><strong>{location_info.get('ip', 'Unknown')}</strong></p>
                </div>
                
                <div class="detail-card">
                    <h3>📍 Location</h3>
                    <p><strong>{location_info.get('city', 'Unknown')}, {location_info.get('country', 'Unknown')}</strong></p>
                </div>
                
                <div class="detail-card">
                    <h3>💻 Device Type</h3>
                    <p><strong>{device_info.get('type', 'Unknown').title()}</strong></p>
                </div>
                
                <div class="detail-card">
                    <h3>🌐 Browser</h3>
                    <p><strong>{device_info.get('browser', 'Unknown')}</strong></p>
                </div>
                
                <div class="detail-card">
                    <h3>⚙️ Operating System</h3>
                    <p><strong>{device_info.get('os', 'Unknown')}</strong></p>
                </div>
                
                <div class="detail-card">
                    <h3>📱 Full Device Info</h3>
                    <p><strong>{device_info.get('device', 'Unknown')}</strong></p>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%); border-radius: 20px; padding: 30px; margin: 40px 0; border-left: 5px solid #667eea;">
                <h3 style="color: #667eea; margin: 0 0 20px 0; font-size: 1.4em;">🔍 Detailed Login Information</h3>
                <div style="background: white; border-radius: 15px; padding: 25px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                        <div>
                            <h4 style="color: #333; margin: 0 0 10px 0; font-size: 1.1em;">Network Details:</h4>
                            <p style="margin: 5px 0; color: #666;"><strong>IP Address:</strong> {location_info.get('ip', 'Unknown')}</p>
                            <p style="margin: 5px 0; color: #666;"><strong>Location:</strong> {location_info.get('city', 'Unknown')}, {location_info.get('country', 'Unknown')}</p>
                        </div>
                        <div>
                            <h4 style="color: #333; margin: 0 0 10px 0; font-size: 1.1em;">Device Details:</h4>
                            <p style="margin: 5px 0; color: #666;"><strong>Type:</strong> {device_info.get('type', 'Unknown').title()}</p>
                            <p style="margin: 5px 0; color: #666;"><strong>OS:</strong> {device_info.get('os', 'Unknown')}</p>
                            <p style="margin: 5px 0; color: #666;"><strong>Browser:</strong> {device_info.get('browser', 'Unknown')}</p>
                        </div>
                        <div>
                            <h4 style="color: #333; margin: 0 0 10px 0; font-size: 1.1em;">Session Info:</h4>
                            <p style="margin: 5px 0; color: #666;"><strong>Login Time:</strong> {login_time}</p>
                            <p style="margin: 5px 0; color: #666;"><strong>Date:</strong> {datetime.now().strftime('%B %d, %Y')}</strong></p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="security-status">
                <h3>🔒 Security Status</h3>
                <p>Risk Level: <strong>{risk_level}</strong></p>
                <p style="margin: 10px 0 0 0; font-size: 0.9em;">
                    {('This login appears to be from a trusted location and device.' if risk_level == 'LOW' else 'This login is from an unrecognized location or device.' if risk_level == 'MEDIUM' else 'This login is suspicious and requires immediate attention.')}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin: 50px 0;">
                <div style="background: linear-gradient(135deg, #e8f4f8 0%, #d1ecf1 100%); border-radius: 20px; padding: 30px; border-left: 5px solid #17a2b8;">
                    <h3 style="color: #17a2b8; margin: 0 0 20px 0; font-size: 1.4em;">🚀 Quick Actions</h3>
                    <div style="background: white; border-radius: 15px; padding: 20px;">
                        <a href="http://localhost:5173/auth" style="display: block; background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 15px 20px; text-decoration: none; border-radius: 10px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s ease;">
                            👁️ View Account Activity
                        </a>
                        <a href="http://localhost:5173/security" style="display: block; background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); color: #333; padding: 15px 20px; text-decoration: none; border-radius: 10px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s ease;">
                            � Security Settings
                        </a>
                        <a href="http://localhost:5173/change-password" style="display: block; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 15px 20px; text-decoration: none; border-radius: 10px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s ease;">
                            🔑 Change Password
                        </a>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%); border-radius: 20px; padding: 30px; border-left: 5px solid #667eea;">
                    <h3 style="color: #667eea; margin: 0 0 20px 0; font-size: 1.4em;">🆘 Emergency Support</h3>
                    <div style="background: white; border-radius: 15px; padding: 20px;">
                        <a href="mailto:support@housecrew.com" style="display: block; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 15px 20px; text-decoration: none; border-radius: 10px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s ease;">
                            🚨 Report Suspicious Activity
                        </a>
                        <a href="tel:+919876543210" style="display: block; background: linear-gradient(135deg, #28a745 0%, #218838 100%); color: white; padding: 15px 20px; text-decoration: none; border-radius: 10px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s ease;">
                            � Emergency Support: +91 98765 43210
                        </a>
                        <a href="http://localhost:5173/help" style="display: block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 20px; text-decoration: none; border-radius: 10px; margin: 10px 0; text-align: center; font-weight: 600; transition: all 0.3s ease;">
                            📚 Security Help Center
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="security-tips">
                <h3>🔐 Security Tips</h3>
                <ul>
                    <li>Use strong, unique passwords with letters, numbers, and symbols</li>
                    <li>Enable two-factor authentication for extra security</li>
                    <li>Regularly monitor your account activity</li>
                    <li>Never share your login credentials with anyone</li>
                    <li>Always log out from shared or public devices</li>
                </ul>
            </div>
            
            <div class="footer">
                <p style="color: #999; margin: 20px 0 10px 0;">
                    🎧 Need help? Contact us at 
                    <a href="mailto:support@housecrew.com" style="color: #667eea;">support@housecrew.com</a>
                </p>
                
                <p style="color: #999; margin: 10px 0 0 0; font-size: 0.9em;">
                    © 2024 HouseCrew. All rights reserved. | 
                    <a href="#" style="color: #667eea;">Privacy Policy</a> | 
                    <a href="#" style="color: #667eea;">Terms of Service</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>"""
