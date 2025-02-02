import json
import os
import pymysql
import boto3
import base64

# Connect to the RDS MySQL database. Connecting at the top so the conn can be reused by child functions
db_host = os.environ['DB_HOST']
db_user = os.environ['DB_USER']
db_password = os.environ['DB_PASSWORD']
db_name = os.environ['DB_NAME']

connection = pymysql.connect(
    host=db_host,
    user=db_user,
    password=db_password,
    database=db_name,
    cursorclass=pymysql.cursors.DictCursor
)

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

def addOrUpdatePlayerToLeague(player, business_name, league_id):    
    try:
        email = player['email']
        first_name = player['firstName']
        last_name = player['lastName']
        middle_name = player['middleName']
        gender = player['gender']
        usta_rating = player['usta_rating']
        with connection.cursor() as cursor:
            sql_query = """
                    CALL `tennis_ladder`.`AddPlayerToLeague`(%s,%s,%s,%s,%s,%s,%s);
                    """
            # Execute the query
            cursor.execute(sql_query, (email, first_name, last_name, league_id, usta_rating, gender, business_name))
            result = cursor.fetchall()
            league_name = result[0]["league_name"]

    except Exception as e:
        print('Error adding players into database:', e)
        return {"first_name": first_name, "last_name": last_name, "league_name": league_name, "status": "Not Added -"+str(e)}

    finally:
        return {"first_name": first_name, "last_name": last_name, "league_name": league_name, "status": "Added"}

def lambda_handler(event, context):
    token = event['headers']['Authorization']
    decoded = decode_jwt(token)
    # We only ever expect the user to be in one group only - business rule
    business_name = decoded['cognito:groups'][0]
    added_players = []

    payload = json.loads(event["body"])
    
    try:
        league_id = payload['league_id']
        for player in payload['player_data']:
            # Check for required field (email)
            if not player.get('email'):
                print(f"Skipping player due to missing required fields: {player}")
                continue
            
            result = addOrUpdatePlayerToLeague(player, business_name, league_id);
            added_players.append(result)

    except Exception as e:
        raise e
    
    connection.commit()

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
    }, 
        'body': json.dumps(added_players)
    }
