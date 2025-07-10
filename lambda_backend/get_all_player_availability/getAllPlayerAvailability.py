import json
import os
import pymysql
import base64
from datetime import datetime, timedelta

def decode_base64_url(data):
    """Add padding to the input and decode base64 url"""
    missing_padding = len(data) % 4
    if missing_padding:
        data += '=' * (4 - missing_padding)
    return base64.urlsafe_b64decode(data)

def decode_jwt(token):
    """Split the token and decode each part"""
    parts = token.split('.')
    if len(parts) != 3:  # a valid JWT has 3 parts
        raise ValueError('Token is not valid')

    header = decode_base64_url(parts[0])
    payload = decode_base64_url(parts[1])
    signature = decode_base64_url(parts[2])

    return json.loads(payload)

def lambda_handler(event, context):
    # Database connection parameters
    db_host = os.environ['DB_HOST']
    db_user = os.environ['DB_USER']
    db_password = os.environ['DB_PASSWORD']
    db_name = os.environ['DB_NAME']
    token = event['headers']['Authorization']
    league_id = event["queryStringParameters"]['league_id']
    decoded = decode_jwt(token)
    yesterday = event["queryStringParameters"]['yest_date']

    # Since a user could also be in a tennis-admin group, we want to filter that out
    filtered_values = [value for value in decoded['cognito:groups'] if value != 'tennis-admin']

    # Assign the first remaining value to a variable (if there's at least one remaining value)
    # We only ever expect one business name association to a user's profile
    business_name = filtered_values[0] if filtered_values else None

    try:
        # Connect to the database
        connection = pymysql.connect(host=db_host,
                                     user=db_user,
                                     password=db_password,
                                     database=db_name)

        with connection.cursor() as cursor:
            # Query to get player availability and player details
            query = """
				SELECT p.player_id, p.email, p.first_name, p.last_name,
                       a.available_date, a.morning, a.afternoon, a.evening
                FROM player_league pl, player p, availability a
                WHERE pl.player_id = p.player_id
                AND p.player_id = a.player_id
                AND pl.league_id = %s
                AND a.available_date > %s;
            """
            cursor.execute(query, (league_id, yesterday))
            results = cursor.fetchall()

        # Process results into the desired format
        players_availability = {}
        for row in results:
            player_id, email, first_name, last_name, date, morning, afternoon, evening = row
            
            if player_id not in players_availability:
                players_availability[player_id] = {
                    'player_id': player_id,
                    'first_name': first_name,
                    'last_name': last_name,
                    'email': email,
                    'availability': []
                }
            
            players_availability[player_id]['availability'].append({
                'date': date.strftime('%Y-%m-%d'),
                'timeSlots': {
                    'morning': bool(morning),
                    'afternoon': bool(afternoon),
                    'evening': bool(evening)
                }
            })

        return {
            'statusCode': 200,
            'headers': {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "https://sports-ladder.onreaction.com",
                "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
            },
            'body': json.dumps(list(players_availability.values()))
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if connection:
            connection.close()
