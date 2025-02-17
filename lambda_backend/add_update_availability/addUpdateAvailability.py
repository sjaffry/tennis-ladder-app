import json
import os
import pymysql
import boto3
import base64

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
    availability = payload["availability_data"]
    player_id = availability['player_id']
    date_available = availability['date']
    morning = availability['morning']
    afternoon = availability['afternoon']
    evening = availability['evening']
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
        sql_query = """
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

        # Execute the query
        cursor.execute(sql_query, (player_id, date_available, morning, afternoon, evening, date_available, morning, afternoon, evening))
        connection.commit()

        result = "ok"

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
    }, 
        'body': json.dumps(result)
    }
