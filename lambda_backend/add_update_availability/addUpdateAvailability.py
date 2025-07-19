import json
import os
import pymysql
import boto3
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
    db_host = os.environ['DB_HOST']
    db_user = os.environ['DB_USER']
    db_password = os.environ['DB_PASSWORD']
    db_name = os.environ['DB_NAME']
    token = event['headers']['Authorization']

    payload = json.loads(event["body"])
    print(payload)
    availability = payload["availability_data"]
    player_email = availability.get('player_email')
    date_available = availability.get('date')
    morning = availability.get('morning', 'false')
    afternoon = availability.get('afternoon', 'false')
    evening = availability.get('evening', 'false')
    recurring_flag = availability.get('recurring_flag', 'false')
    decoded = decode_jwt(token)
    # We only ever expect the user to be in one group only - business rule
    business_name = decoded['cognito:groups'][0]
    
    # Connect to the RDS MySQL database
    connection = pymysql.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        database=db_name,
        cursorclass=pymysql.cursors.DictCursor
    )

    with connection.cursor() as cursor:
        sql_query_1 = """
                SELECT player_id FROM `tennis_ladder`.`player`
                WHERE email = %s;
                """
        sql_query_2 = """
                INSERT INTO `tennis_ladder`.`availability`
                (`player_id`,
                `available_date`,
                `morning`,
                `afternoon`,
                `evening`)
                VALUES
                (%s,
                %s,
                %s,
                %s,
                %s
                )
                ON DUPLICATE KEY UPDATE
                available_date = %s, 
                morning = %s,
                afternoon = %s,
                evening = %s;
                """

        # Execute the queries
        cursor.execute(sql_query_1, (player_email))
        player_id = cursor.fetchone()['player_id']

        # First insert the original date
        cursor.execute(sql_query_2, (player_id, date_available, morning, afternoon, evening, date_available, morning, afternoon, evening))
        connection.commit()

        # If recurring flag is true, add entries for the next 8 weeks
        if recurring_flag == True:
            # Parse the original date
            base_date = datetime.strptime(date_available, '%Y-%m-%d')
            
            # Add entries for weeks 1-8
            for i in range(1, 9):
                # Calculate date for this week
                next_week_date = base_date + timedelta(days=i*7)
                formatted_date = next_week_date.strftime('%Y-%m-%d')
                
                # Insert the recurring availability
                cursor.execute(sql_query_2, (
                    player_id, 
                    formatted_date, 
                    morning, 
                    afternoon, 
                    evening, 
                    formatted_date, 
                    morning, 
                    afternoon, 
                    evening
                ))
                
                connection.commit()
        
        if recurring_flag == True:
            result = "Availability added for 8 weeks including the original date"
        else:
            result = "Availability added for the selected date"

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://sports-ladder.onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
        }, 
        'body': json.dumps(result)
    }
