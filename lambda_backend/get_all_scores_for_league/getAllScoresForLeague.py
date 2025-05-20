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
    league_type = event["queryStringParameters"]['league_type']    
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
            if league_type.lower() == "singles":
                sql_query = """
                        SELECT sm.match_id,
                        sm.league_id, 
                        p1.first_name as "player1_name", 
                        p2.first_name as "player2_name", 
                        p3.first_name as "winner", 
                        sm.set1_p1, 
                        sm.set1_p2, 
                        sm.set2_p1, 
                        sm.set2_p2, 
                        sm.set3_p1, 
                        sm.set3_p2,  
                        l.league_name
                        FROM singles_match sm, player p1, player p2, player p3, league l
                        WHERE l.league_id = sm.league_id
                        AND p1.player_id = sm.player1_id
                        AND p2.player_id = sm.player2_id
                        AND p3.player_id = sm.winner_id
                        AND l.league_id=%s;
                        """
            elif (league_type.lower() == "doubles" or league_type.lower() == "mix doubles"):
                sql_query = """
                        SELECT sm.match_id, 
                        p1.first_name as "player 1", 
                        p2.first_name as "player2", 
                        p3.first_name as "winner", 
                        sm.set1_t1, 
                        sm.set1_t2, 
                        sm.set2_t1, 
                        sm.set2_t2, 
                        sm.set3_t1, 
                        sm.set3_t2,  
                        l.league_name
                        FROM doubles_match sm, player p1, player p2, player p3, league l
                        WHERE l.league_id = sm.league_id
                        AND p1.player_id = sm.player1_id
                        AND p2.player_id = sm.player2_id
                        AND p3.player_id = sm.winner_id
                        AND l.league_id=%s;
                        """
            else:
                raise Exception("Invalid league type: "+league_type)
        
            # Execute the query with 'FTSC' as the parameter
            cursor.execute(sql_query, (league_id))
            
            # Fetch all the rows that match the condition
            resp = cursor.fetchall()  
            league_name = resp[0]['league_name']
    
        result = {
            "League_name": league_name,
            "Scores": resp
        }

    except Exception as e:
        print('Error querying items from MySQL:', e)
        raise e

    finally:
        connection.close()
        

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://sports-ladder.onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
    },    
        'body': json.dumps(result)
    } 


