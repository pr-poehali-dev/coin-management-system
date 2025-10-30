'''
Business: API для централизованного управления данными мониторинга валют
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с атрибутами request_id, function_name
Returns: HTTP response dict с данными системы
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            path = event.get('queryStringParameters', {}).get('path', '')
            
            if path == 'all':
                cursor.execute('SELECT * FROM users ORDER BY created_at')
                users = list(cursor.fetchall())
                
                cursor.execute('SELECT * FROM currencies ORDER BY created_at')
                currencies = list(cursor.fetchall())
                
                cursor.execute('SELECT * FROM coins ORDER BY created_at')
                coins = list(cursor.fetchall())
                
                cursor.execute('SELECT * FROM settings ORDER BY id DESC LIMIT 1')
                settings = cursor.fetchone()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'users': users,
                        'currencies': currencies,
                        'coins': coins,
                        'settings': settings
                    }, default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'add_user':
                data = body_data.get('data', {})
                cursor.execute(
                    "INSERT INTO users (username, password, role, balance) VALUES (%s, %s, %s, %s) RETURNING *",
                    (data['username'], data['password'], data['role'], data.get('balance', 0))
                )
                result = cursor.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'user': result}, default=str)
                }
            
            elif action == 'add_currency':
                data = body_data.get('data', {})
                cursor.execute(
                    "INSERT INTO currencies (code, symbol, rate) VALUES (%s, %s, %s) RETURNING *",
                    (data['code'], data['symbol'], float(data['rate']))
                )
                result = cursor.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'currency': result}, default=str)
                }
            
            elif action == 'add_coin':
                data = body_data.get('data', {})
                cursor.execute(
                    "INSERT INTO coins (name, symbol, value, change, volume) VALUES (%s, %s, %s, %s, %s) RETURNING *",
                    (data['name'], data['symbol'], float(data['value']), float(data.get('change', 0)), int(data['volume']))
                )
                result = cursor.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'coin': result}, default=str)
                }
            
            elif action == 'login':
                data = body_data.get('data', {})
                cursor.execute(
                    "SELECT * FROM users WHERE username = %s AND password = %s",
                    (data['username'], data['password'])
                )
                user = cursor.fetchone()
                if user:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'success': True, 'user': user}, default=str)
                    }
                else:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({'success': False, 'error': 'Invalid credentials'})
                    }
            
            elif action == 'register':
                data = body_data.get('data', {})
                cursor.execute(
                    "INSERT INTO users (username, password, role, balance) VALUES (%s, %s, 'Пользователь', 0) RETURNING *",
                    (data['username'], data['password'])
                )
                result = cursor.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'user': result}, default=str)
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'update_coin':
                data = body_data.get('data', {})
                cursor.execute(
                    "UPDATE coins SET value = %s, change = %s, volume = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *",
                    (float(data['value']), float(data['change']), int(data['volume']), int(data['id']))
                )
                result = cursor.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'coin': result}, default=str)
                }
            
            elif action == 'update_user_role':
                data = body_data.get('data', {})
                cursor.execute(
                    "UPDATE users SET role = %s WHERE id = %s RETURNING *",
                    (data['role'], int(data['id']))
                )
                result = cursor.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'user': result}, default=str)
                }
            
            elif action == 'update_balance':
                data = body_data.get('data', {})
                cursor.execute(
                    "UPDATE users SET balance = balance + %s WHERE id = %s RETURNING *",
                    (float(data['amount']), int(data['id']))
                )
                result = cursor.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'user': result}, default=str)
                }
            
            elif action == 'update_settings':
                data = body_data.get('data', {})
                cursor.execute(
                    "UPDATE settings SET site_name = %s, active_currency = %s, updated_at = CURRENT_TIMESTAMP WHERE id = 1 RETURNING *",
                    (data.get('site_name', 'Мониторинг валют'), data.get('active_currency', 'USD'))
                )
                result = cursor.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True, 'settings': result}, default=str)
                }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'delete_user':
                user_id = body_data.get('id')
                cursor.execute("DELETE FROM users WHERE id = %s", (int(user_id),))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'delete_currency':
                currency_id = body_data.get('id')
                cursor.execute("DELETE FROM currencies WHERE id = %s", (int(currency_id),))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
            
            elif action == 'delete_coin':
                coin_id = body_data.get('id')
                cursor.execute("DELETE FROM coins WHERE id = %s", (int(coin_id),))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Invalid request'})
        }
    
    finally:
        cursor.close()
        conn.close()
