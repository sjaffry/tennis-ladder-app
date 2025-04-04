import json
import os
import pymysql
import boto3
import base64
import random
import string

# Initialize the Cognito client
cognito_client = boto3.client("cognito-idp")

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

def generate_temp_password(length=12):
    """Generate a random temporary password with required complexity."""
    chars = string.ascii_letters + string.digits + "!@#$%^&*()"
    return "".join(random.choice(chars) for _ in range(length))

def check_user_exists(user_pool_id, email):
    """Check if a user already exists in the Cognito user pool."""

    try:
        response = cognito_client.list_users(
            UserPoolId=user_pool_id,
            Filter=f'email="{email}"'
        )

        if len(response["Users"]) > 0:
            print(f"User {email} already exists.")

        return len(response["Users"]) > 0  # True if user exists, False otherwise
    except Exception as e:
        print(f"Error checking user existence: {e}")
        return False

def create_user(user_pool_id, email, given_name, family_name, business_name):
    """Create a new Cognito user with a temporary password and email invitation."""
    temp_password = generate_temp_password()
    
    try:
        response = cognito_client.admin_create_user(
            UserPoolId=user_pool_id,
            Username=email,
            UserAttributes=[
                {"Name": "email", "Value": email},
                {"Name": "email_verified", "Value": "true"},
                {"Name": "given_name", "Value": given_name},
                {"Name": "family_name", "Value": family_name}
            ],
            TemporaryPassword=temp_password
        )

        # Force user to change password on first login
        cognito_client.admin_set_user_password(
            UserPoolId=user_pool_id,
            Username=email,
            Password=temp_password,
            Permanent=False
        )

        cognito_client.admin_add_user_to_group(
            UserPoolId=user_pool_id,
            Username=email,
            GroupName=business_name
        )

        print(f"User {email} created successfully.")
        return {"status": "success", "message": f"User {email} created successfully.", "temp_password": temp_password}
    
    except Exception as e:
        print(f"Error creating user: {e}")
        return {"status": "error", "message": str(e)}

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
                    CALL `tennis_ladder`.`AddPlayerToLeague`(%s,%s,%s,%s,%s,%s,%s,%s);
                    """
            # Execute the query
            cursor.execute(sql_query, (email, first_name, middle_name, last_name, league_id, usta_rating, gender, business_name))
            result = cursor.fetchall()
            league_name = result[0]["league_name"]
            player_id = result[0]["player_id"]

    except Exception as e:
        print('Error adding players into database:', e)
        return {"player_id": player_id, "first_name": first_name, "last_name": last_name, "league_name": league_name, "league_id": league_id, "status": "Not Added -"+str(e)}

    finally:
        return {"player_id": player_id, "middle_name": middle_name, "first_name": first_name, "last_name": last_name, "league_name": league_name, "league_id": league_id, "status": "Added"}

def lambda_handler(event, context):
    token = event['headers']['Authorization']
    decoded = decode_jwt(token)
    # We only ever expect the user to be in one group only - business rule
    business_name = decoded['cognito:groups'][0]
    user_pool_id = resource_name = decoded['iss'].split("/")[-1]
    added_players = []

    payload = json.loads(event["body"])
    
    try:
        league_id = payload['league_id']
        for player in payload['player_data']:
            # Check for required field (email)
            if not player.get('email'):
                print(f"Skipping player due to missing required fields: {player}")
                continue
            
            # First we're going to check if the user exists in the cognito pool
            user_exists = check_user_exists(user_pool_id, player['email'])
            if not user_exists:
                # If the user doesn't exist, create a new user
                create_user(user_pool_id, player['email'], player['firstName'], player['lastName'], business_name)
            
            # Now we add the user to the league
            result = addOrUpdatePlayerToLeague(player, business_name, league_id);
            added_players.append(result)

    except Exception as e:
        raise e
    
    connection.commit()

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://sports-ladder.onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
    }, 
        'body': json.dumps(added_players)
    }
