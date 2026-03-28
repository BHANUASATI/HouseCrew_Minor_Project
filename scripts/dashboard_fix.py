"""
Dashboard endpoint fix for HouseCrew backend
This file contains the dashboard endpoint that needs to be added to main.py
"""

from fastapi import HTTPException
from mysql.connector import Error
from datetime import datetime

def get_customer_dashboard(customer_id: int, get_db_connection, logger):
    """Get comprehensive dashboard data for customer"""
    try:
        # Test basic connection
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Verify customer exists
        cursor.execute("SELECT id FROM users WHERE id = %s AND role = 'customer'", (customer_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Get service requests statistics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_requests,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
                COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_requests,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_requests,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests
            FROM service_requests 
            WHERE customer_id = %s
        """, (customer_id,))
        
        stats = cursor.fetchone()
        
        # Get wallet balance
        cursor.execute("""
            SELECT balance, currency 
            FROM customer_wallets 
            WHERE customer_id = %s
        """, (customer_id,))
        
        wallet = cursor.fetchone()
        wallet_balance = wallet['balance'] if wallet else 0.0
        
        # Get recent service requests
        cursor.execute("""
            SELECT id, service_name, service_category, status, created_at, updated_at
            FROM service_requests
            WHERE customer_id = %s
            ORDER BY created_at DESC
            LIMIT 5
        """, (customer_id,))
        
        recent_services = cursor.fetchall()
        
        # Format dates
        for service in recent_services:
            if service['created_at']:
                service['created_at'] = service['created_at'].isoformat()
            if service['updated_at']:
                service['updated_at'] = service['updated_at'].isoformat()
        
        # Get recent activities
        cursor.execute("""
            SELECT 
                'service_request' as type,
                service_name as title,
                status,
                created_at,
                CAST(id AS CHAR) as reference_id
            FROM service_requests 
            WHERE customer_id = %s AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY created_at DESC
            LIMIT 3
        """, (customer_id,))
        
        recent_activities = cursor.fetchall()
        
        # Format activity dates
        for activity in recent_activities:
            if activity['created_at']:
                activity['created_at'] = activity['created_at'].isoformat()
        
        return {
            "statistics": {
                "total_requests": stats['total_requests'],
                "pending_requests": stats['pending_requests'],
                "accepted_requests": stats['accepted_requests'],
                "in_progress_requests": stats['in_progress_requests'],
                "completed_requests": stats['completed_requests'],
                "wallet_balance": wallet_balance,
                "pending_payments": 0.0
            },
            "recent_services": recent_services,
            "recent_activities": recent_activities,
            "last_updated": datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
        }
        
    except Error as e:
        logger.error(f"Get customer dashboard error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard data: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
