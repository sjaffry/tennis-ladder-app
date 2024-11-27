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

def decode_playerdata(payload):
    decoded_payload = decode_base64_url(payload)
    decoded_payload_str = decoded_payload.decode('utf-8')

    """Split the payload and decode each part"""
    parts = decoded_payload_str.split('/')
    if len(parts) != 4:  # a valid payload must have 4 parts
        raise ValueError(f'Payload is not valid. Valid payload must have 4 parts but found {len(parts)}')

    score_confirm_data = {
        "email": parts[0],
        "player_designation": parts[1],
        "match_id": parts[2],
        "business_name": parts[3]
    }

    return score_confirm_data

def lambda_handler(event, context):
    print(event)
    db_host = os.environ['DB_HOST']
    db_user = os.environ['DB_USER']
    db_password = os.environ['DB_PASSWORD']
    db_name = os.environ['DB_NAME']
    payload = event["queryStringParameters"]["payload"]

    # Match confirmation data
    confirmation_data = decode_playerdata(payload)
    match_id = confirmation_data['match_id']
    player_designation = confirmation_data['player_designation']
    email = confirmation_data['email']
    business_name = confirmation_data['business_name']
    
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
            sql_query = f'update singles_match set player{player_designation}_confirmed=%s where match_id=%s;'
            # Execute the query with 'FTSC' as the parameter
            cursor.execute(sql_query, (email, match_id))
            connection.commit()

        result = {
            "Business_name": business_name,
            "Score_confirmed": "Ok"
        }

    except Exception as e:
        print('Error adding score into MySQL:', e)
        raise e

    finally:
        connection.close()        

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
    },    
        'body': json.dumps(result)
    } 

