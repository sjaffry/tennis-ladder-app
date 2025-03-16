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
    league_id = payload['league_id']
    league_name = payload['league_name']
    league_admin_email = payload['league_admin_email']
    end_date = payload['end_date']
    category = payload['category']
    league_type = payload['league_type']
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
                INSERT INTO `tennis_ladder`.`league`
                (`league_id`,
                `league_name`,
                `end_date`,
                `business_name`,
                `category`,
                `league_type`,
                `league_admin_email`)
                VALUES
                (%s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
                )
                ON DUPLICATE KEY UPDATE
                league_name = %s, 
                end_date = %s,
                category = %s,
                league_type = %s,
                league_admin_email = %s;
                """

        # Execute the query
        cursor.execute(sql_query, (league_id, league_name, end_date, business_name, category, league_type, league_admin_email, league_name, end_date, category, league_type, league_admin_email))
        connection.commit()

        result = "ok"

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://sports-ladder.onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
    }, 
        'body': json.dumps(result)
    }
