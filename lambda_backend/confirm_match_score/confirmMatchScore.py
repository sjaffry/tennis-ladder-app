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
    if len(parts) != 7:  # a valid payload must have 7 parts
        raise ValueError(f'Payload is not valid. Valid payload must have 7 parts but found {len(parts)}')

    score_confirm_data = {
        "email": parts[0],
        "designation": parts[1], #This represents the order in which the player or team is listed in the match table
        "match_id": parts[2],
        "winner_id": parts[3],
        "loser_id": parts[4],
        "league_id": parts[5],
        "match_type": parts[6]
    }

    return score_confirm_data

def lambda_handler(event, context):
    db_host = os.environ['DB_HOST']
    db_user = os.environ['DB_USER']
    db_password = os.environ['DB_PASSWORD']
    db_name = os.environ['DB_NAME']
    payload = event["queryStringParameters"]["payload"]

    # Match confirmation data
    confirmation_data = decode_playerdata(payload)
    match_id = confirmation_data['match_id']
    designation = confirmation_data['designation']
    email = confirmation_data['email']
    winner_id = confirmation_data['winner_id']
    loser_id = confirmation_data['loser_id']
    league_id = confirmation_data['league_id']
    match_type = confirmation_data['match_type']
    
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
            if match_type == "singles":
                # Define the SQL query for singles
                sql_query = f'CALL `tennis_ladder`.`ConfirmSinglesScoreAndUpdateLadder`(%s, %s, %s, %s, %s, %s);'
            elif match_type == "doubles":
                # Define the SQL query for doubles
                sql_query = f'CALL `tennis_ladder`.`ConfirmDoublesScoreAndUpdateLadder`(%s, %s, %s, %s, %s, %s);'
                            
            cursor.execute(sql_query, (match_id, designation, email, winner_id, loser_id, league_id))
            connection.commit()

        result = """
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Score Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 50px;
        }
        h1 {
            color: #4CAF50;
        }
    </style>
</head>
<body>
    <h1>Score Confirmed</h1>
    <p> You may close this window </p>
</body>
</html>
        """

    except Exception as e:
        print('Error adding score into MySQL:', e)
        raise e

    finally:
        connection.close()        

    return {
        'statusCode': 200,
        'headers': {
            "Content-Type": 'text/html',
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
    },    
        'body': result
    } 

