import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage job applications - submit new applications and retrieve all applications for admin
    Args: event with httpMethod (POST to submit, GET to retrieve), body for POST requests
          context with request_id
    Returns: HTTP response with application data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    
    try:
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO applications (full_name, age, has_bank_card, telegram_username, job_position) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                (
                    body_data['full_name'],
                    body_data['age'],
                    body_data['has_bank_card'],
                    body_data['telegram_username'],
                    body_data['job_position']
                )
            )
            app_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True, 'id': app_id})
            }
        
        elif method == 'GET':
            headers = event.get('headers', {})
            admin_password = headers.get('x-admin-password', headers.get('X-Admin-Password', ''))
            
            if admin_password != 'admin2024':
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Unauthorized'})
                }
            
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("SELECT id, full_name, age, has_bank_card, telegram_username, job_position, created_at FROM applications ORDER BY created_at DESC")
            applications = cur.fetchall()
            cur.close()
            
            applications_list = []
            for app in applications:
                applications_list.append({
                    'id': app['id'],
                    'full_name': app['full_name'],
                    'age': app['age'],
                    'has_bank_card': app['has_bank_card'],
                    'telegram_username': app['telegram_username'],
                    'job_position': app['job_position'],
                    'created_at': app['created_at'].isoformat() if app['created_at'] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(applications_list)
            }
        
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()
