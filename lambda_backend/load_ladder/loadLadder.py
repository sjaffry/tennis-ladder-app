import json
import boto3
import base64
import os
import pymysql

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
    league_id = event["queryStringParameters"]['league_id']
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
    
    try:
        with connection.cursor() as cursor:
            # Define the SQL query
            sql_query = """
                SELECT ROW_NUMBER() OVER() AS "rank",
                        p.`first_name`,
                        p.`last_name`,
                        sl.`points`,
                        sl.`matches`,
                        sl.`wins`,
                        sl.`losses`,
                        CAST(ROUND(sl.`wins` / sl.`matches` * 100, 2) AS CHAR) AS "win_rate"
                    FROM singles_ladder as sl, player p
                    WHERE sl.`league_id` = %s
                    AND sl.player_id = p.player_id
                    ORDER BY sl.`points` DESC
                    """
        
            # Execute the query with 'FTSC' as the parameter
            cursor.execute(sql_query, (league_id))
            
            # Fetch all the rows that match the condition
            resp = cursor.fetchall()  
    
        result = {
            "Business name": business_name,
            "ladder": resp
        }

    except Exception as e:
        print('Error querying items from MySQL:', e)
        raise e
        

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://sports-ladder.onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
    },    
        'body': json.dumps(result)
    } 

