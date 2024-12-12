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
    category = event["queryStringParameters"]['category']
    decoded = decode_jwt(token)
 
    # Since a user could also be in a tennis-admin group, we want to filter that out
    filtered_values = [value for value in decoded['cognito:groups'] if value != 'tennis-admin']

    # Assign the first remaining value to a variable (if there's at least one remaining value)
    business_name = filtered_values[0] if filtered_values else None
    
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
            sql_query = """SELECT DISTINCT l.league_id as "league_id", l.league_type as "league_type", l.league_name as "league_name" 
                        FROM league l, player_league pl, player p
                        WHERE l.league_id = pl.league_id
                        AND p.player_id = pl.player_id
                        AND l.business_name = %s
                        AND l.category = %s;
                        """
        
            # Execute the query with 'FTSC' as the parameter
            cursor.execute(sql_query, (business_name, category))
            
            # Fetch all the rows that match the condition
            resp = cursor.fetchall()  
            #league_names = [item['league_name'] for item in resp if 'league_name' in item]
    
        result = {
            "Business name": business_name,
            "Leagues": resp

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