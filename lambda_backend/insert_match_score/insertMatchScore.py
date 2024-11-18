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

    # Match info
    winner_id = event['body']['winner_id']
    loser_id = event['body']['loser_id']
    entered_by = event['body']['entered_by']
    p1_confirmed = event['body']['player1_confirmed']
    p2_confirmed = event['body']['player2_confirmed']
    league_id = event['body']['league_id']
    p1_set1 = event['body']['player1_set1']
    p2_set1 = event['body']['player2_set1']
    p1_set2 = event['body']['player1_set2']
    p2_set2 = event['body']['player2_set2']
    p1_set3 = event['body']['player1_set3']
    p2_set3 = event['body']['player2_set3']

    # API Auth
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
            sql_query = "CALL `tennis_ladder`.`UpdateMatchScoreAndLadder`('2024-01-01',%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);"
        
            # Execute the query with 'FTSC' as the parameter
            cursor.execute(sql_query, (league_id, winner_id, loser_id, entered_by, p1_confirmed, p2_confirmed, p1_set1, p2_set1, p1_set2, p2_set2, p1_set3, p2_set3))
            
            # Fetch all the rows that match the condition
            resp = cursor.fetchall() 

        result = {
            "Business_name": business_name,
            "Match_data": resp[0]
        }

    except Exception as e:
        print('Error adding score into MySQL:', e)
        raise e
        

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
    },    
        'body': json.dumps(result)
    } 

