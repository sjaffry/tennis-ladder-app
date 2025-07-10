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

def send_email_to_opponent(
        aws_acc_id,
        match_type, 
        match_id, 
        business_name, 
        player1_id, 
        player2_id,
        league_id, 
        winner_id, 
        loser_id, 
        entered_by, 
        p1_set1, 
        p2_set1, 
        p1_set2, 
        p2_set2, 
        p1_set3, 
        p2_set3):
  
    # We're going to reuse the existing lambda prepareScoreEmail
    # to send the email to the opponent
    payload = {
        "body": {
        "Business_name": business_name,
        "Match_data": {
        "Match_type": match_type,
        "match_id": match_id,
        "player1_id": player1_id,
        "player2_id": player2_id,
        "entered_by": entered_by,
        "player1_confirmed": None,
        "player2_confirmed": None,
        "league_id": league_id,
        "winner_id": winner_id,
        "loser_id": loser_id,
        "entered_by": entered_by,
        "set1_p1": p1_set1,
        "set1_p2": p2_set1,
        "set2_p1": p1_set2,
        "set2_p2": p2_set2,
        "set3_p1": p1_set3,
        "set3_p2": p2_set3
            }
        }
    }

    # Invoke AWS step functions state machine
    client = boto3.client('stepfunctions', region_name='us-west-2')
    print('invoking prepareScoreConfirmationTest')
    response = client.start_execution(
        stateMachineArn='arn:aws:states:us-west-2:{}:stateMachine:PlayerMatchEntryStateMachine'.format(aws_acc_id),
        input=json.dumps(payload)
    )
    if response['ResponseMetadata']['HTTPStatusCode'] != 200:
        print('Error invoking state machine PlayerMatchEntryStateMachine', response)
    else:
        print('Lambda prepScoreEmail successfully executed:', response['executionArn'])

    return "done"

def lambda_handler(event, context):

    db_host = os.environ['DB_HOST']
    aws_acc_id = os.environ['AWS_ACC_ID']
    db_user = os.environ['DB_USER']
    db_password = os.environ['DB_PASSWORD']
    db_name = os.environ['DB_NAME']
    token = event['headers']['Authorization']
    body = event.get('body', {})
    match_type = body.get('match_type', None)
    match_id = body.get('match_id', None)
    entered_by = body.get('entered_by', None)
    winner_confirmed = body.get('winner_confirmed', None)
    loser_confirmed = body.get('loser_confirmed', None)
    league_id = body.get('league_id', None)

    # Singles Match info
    player1_id = body.get('player1_id', None)
    player2_id = body.get('player2_id', None)
    winner_id = body.get('winner_id', None)
    loser_id = body.get('loser_id', None)
    opponent_email = body.get('opponent_email', None)

    # Double Match info
    team1_player1_id = body.get('team1_player1_id', None)
    team1_player2_id = body.get('team1_player2_id', None)
    team2_player1_id = body.get('team2_player1_id', None)
    team2_player2_id = body.get('team2_player2_id', None)
    winners = body.get('winner_ids', None)
    losers = body.get('loser_ids', None)
    winner_player1_id = winners[0] if winners else None
    winner_player2_id = winners[1] if winners else None
    loser_player1_id = losers[0] if losers else None
    loser_player2_id = losers[1] if losers else None
    
    # Singles Match score
    p1_confirmed = body.get('player1_confirmed', None)
    p2_confirmed = body.get('player2_confirmed', None)
    p1_set1 = body.get('player1_set1', None)
    p2_set1 = body.get('player2_set1', None)
    p1_set2 = body.get('player1_set2', None)
    p2_set2 = body.get('player2_set2', None)
    p1_set3 = body.get('player1_set3', None)
    p2_set3 = body.get('player2_set3', None)

    # Doubles Match score
    team1_set1 = body.get('team1_set1', None)
    team2_set1 = body.get('team2_set1', None)
    team1_set2 = body.get('team1_set2', None)
    team2_set2 = body.get('team2_set2', None)
    team1_set3 = body.get('team1_set3', None)
    team2_set3 = body.get('team2_set3', None)    

    # API Auth
    decoded = decode_jwt(token)

    # Since a user could also be in a tennis-admin group, we want to filter that out
    filtered_values = [value for value in decoded['cognito:groups'] if value != 'tennis-admin']

    # Assign the first remaining value to a variable (if there's at least one remaining value)
    # We only ever expect one business name association to a user's profile
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
            if match_type == 'singles':
                sql_query = "CALL `tennis_ladder`.`UpdateMatchScoreAndLadderTest`('2024-01-01', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"
                # Execute the query
                cursor.execute(sql_query, (match_id, league_id, winner_id, loser_id, entered_by, p1_confirmed, p2_confirmed, p1_set1, p2_set1, p1_set2, p2_set2, p1_set3, p2_set3))
            elif match_type == 'doubles':
                sql_query = "CALL `tennis_ladder`.`UpdateDoublesMatchScoreAndLadder`('2024-01-01',%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"
                # Execute the query
                cursor.execute(sql_query, (match_id, league_id, winner_player1_id, winner_player2_id, loser_player1_id, loser_player2_id, entered_by, winner_confirmed, loser_confirmed, team1_set1, team2_set1, team1_set2, team2_set2, team1_set3, team2_set3))
            else:
                print('Invalid match type:', match_type)
                raise ValueError('Invalid match type')
            
            # Fetch all the rows that match the condition
            resp = cursor.fetchall() 
            print(resp)

        result = {
            "Business_name": business_name,
            "Match_data": resp[0]
        }

    except Exception as e:
        print('Error adding score into MySQL:', e)
        raise e
    
    # This is a secondary process to send an email to the opponent
    # We do not want failure to send email to stop the broader process
    # of updating the match score and ladder
    if match_type == 'singles':
        resp = send_email_to_opponent(
            aws_acc_id,
            match_type, 
            match_id, 
            business_name, 
            player1_id, 
            player2_id,
            league_id, 
            winner_id, 
            loser_id, 
            entered_by, 
            p1_set1, 
            p2_set1, 
            p1_set2, 
            p2_set2, 
            p1_set3, 
            p2_set3)
    
    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://sports-ladder.onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
    },    
        'body': json.dumps(result)
    }

