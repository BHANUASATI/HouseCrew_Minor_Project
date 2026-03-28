"""
Bill/Invoice API Endpoints
Add these endpoints to main.py
"""

# Add after the payment endpoints in main.py

"""
@app.get("/api/bills/customer/{customer_id}")
async def get_customer_bills(customer_id: int):
    '''Get all bills for a customer'''
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute('''
            SELECT b.id, b.bill_number, b.amount, b.tax_amount, b.total_amount,
                   b.status, b.created_at, b.updated_at,
                   po.order_id, po.payment_id, po.payment_method,
                   sr.service_name, sr.service_category
            FROM bills b
            JOIN payment_orders po ON b.payment_order_id = po.id
            JOIN service_requests sr ON b.service_request_id = sr.id
            WHERE b.customer_id = %s
            ORDER BY b.created_at DESC
        ''', (customer_id,))
        
        bills = cursor.fetchall()
        
        # Format dates
        for bill in bills:
            if bill['created_at']:
                bill['created_at'] = bill['created_at'].isoformat()
            if bill['updated_at']:
                bill['updated_at'] = bill['updated_at'].isoformat()
        
        return bills
        
    except Error as e:
        logger.error(f"Get customer bills error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch bills")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.get("/api/bills/{bill_number}")
async def get_bill_by_number(bill_number: str):
    '''Get bill details by bill number'''
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute('''
            SELECT b.*, po.order_id, po.payment_id, po.payment_method,
                   sr.service_name, sr.service_category,
                   u.name as customer_name, u.email as customer_email
            FROM bills b
            JOIN payment_orders po ON b.payment_order_id = po.id
            JOIN service_requests sr ON b.service_request_id = sr.id
            JOIN users u ON b.customer_id = u.id
            WHERE b.bill_number = %s
        ''', (bill_number,))
        
        bill = cursor.fetchone()
        
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        
        # Parse JSON bill_data
        if bill.get('bill_data'):
            bill['bill_data'] = json.loads(bill['bill_data'])
        
        # Format dates
        if bill.get('created_at'):
            bill['created_at'] = bill['created_at'].isoformat()
        if bill.get('updated_at'):
            bill['updated_at'] = bill['updated_at'].isoformat()
        
        return bill
        
    except Error as e:
        logger.error(f"Get bill error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch bill")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.get("/api/bills/{bill_number}/html")
async def get_bill_html(bill_number: str):
    '''Get bill HTML for viewing/downloading'''
    from fastapi.responses import HTMLResponse
    
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute('''
            SELECT bill_html, status
            FROM bills
            WHERE bill_number = %s
        ''', (bill_number,))
        
        bill = cursor.fetchone()
        
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        
        # Update status to downloaded
        cursor.execute('''
            UPDATE bills 
            SET status = 'downloaded', updated_at = NOW()
            WHERE bill_number = %s AND status = 'generated'
        ''', (bill_number,))
        connection.commit()
        
        return HTMLResponse(content=bill['bill_html'])
        
    except Error as e:
        logger.error(f"Get bill HTML error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch bill HTML")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

@app.get("/api/bills/{bill_number}/download")
async def download_bill(bill_number: str):
    '''Download bill as HTML file'''
    from fastapi.responses import Response
    
    connection = None
    cursor = None
    
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute('''
            SELECT bill_html
            FROM bills
            WHERE bill_number = %s
        ''', (bill_number,))
        
        bill = cursor.fetchone()
        
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        
        # Update status to downloaded
        cursor.execute('''
            UPDATE bills 
            SET status = 'downloaded', updated_at = NOW()
            WHERE bill_number = %s
        ''', (bill_number,))
        connection.commit()
        
        return Response(
            content=bill['bill_html'],
            media_type='text/html',
            headers={
                'Content-Disposition': f'attachment; filename="Invoice_{bill_number}.html"'
            }
        )
        
    except Error as e:
        logger.error(f"Download bill error: {e}")
        raise HTTPException(status_code=500, detail="Failed to download bill")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
"""
