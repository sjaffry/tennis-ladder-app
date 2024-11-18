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
    email = event["queryStringParameters"]['email']
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
                    WITH matches AS (
                        SELECT
                        p1.first_name as player1_fname,
                        p1.last_name as player1_lname,
                        p2.first_name as player2_fname,
                        p2.last_name as player2_lname,
                        p1.email as player1_email,
                        p2.email as player2_email,
                        sm.player1_id,
                        sm.player2_id,
                        sm.entered_by,
                        sm.player1_confirmed,
                        sm.player2_confirmed,
                        sm.league_id,
                        sm.winner_id,
                        sm.loser_id,
                        sm.set1_p1,
                        sm.set1_p2,
                        sm.set2_p1,
                        sm.set2_p2,
                        sm.set3_p1,
                        sm.set3_p2
                        FROM singles_match sm, player p1, player p2
                        WHERE sm.player1_id = p1.player_id
                        AND sm.player2_id = p2.player_id
                        AND sm.league_id = %s)
                    SELECT m.* 
                    FROM player p, matches m
                    WHERE p.email = %s
                    AND (p.player_id = m.player1_id OR p.player_id = m.player2_id);
                    """
        
            # Execute the query with 'FTSC' as the parameter
            cursor.execute(sql_query, (league_id, email))
            
            # Fetch all the rows that match the condition
            resp = cursor.fetchall()  
            print(resp)
    
        result = {
            "Business name": business_name,
            "matchups": resp

        }

    except Exception as e:
        print('Error querying items from MySQL:', e)
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
