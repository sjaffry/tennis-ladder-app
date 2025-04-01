import json
import os
import pymysql
import boto3
import base64

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

def generate_matches(player_ids):
    """Generate a round-robin schedule ensuring each player plays an equal number of matches."""
    if len(player_ids) % 2 != 0:
        player_ids.append("BYE")  # Add a bye if the number of players is odd

    num_players = len(player_ids)
    rounds = num_players - 1  # Each player plays every other player once
    matches = []

    for round_num in range(rounds):
        round_matches = []
        for i in range(num_players // 2):
            player1 = player_ids[i]
            player2 = player_ids[num_players - 1 - i]
            if "BYE" not in (player1, player2):  # Exclude "bye" matches
                round_matches.append((player1, player2))
        
        matches.append({"Round": round_num + 1, "Matches": round_matches})

        # Rotate players (except the first one) to generate new pairings
        player_ids = [player_ids[0]] + [player_ids[-1]] + player_ids[1:-1]

    return matches

def lambda_handler(event, context):
    token = event['headers']['Authorization']
    decoded = decode_jwt(token)
    # We only ever expect the user to be in one group only - business rule
    business_name = decoded['cognito:groups'][0]
    payload = json.loads(event["body"])
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
    
    try:
        players = [player['player_id'] for player in payload['match_data']]
        resp = []
        league_id = payload['match_data'][0]['league_id']
        match_schedule = generate_matches(players)
        with connection.cursor() as cursor:            
            for round_info in match_schedule:
                round = round_info["Round"] # we're not using it in the output just yet but could use it in the future if needed
                for player1, player2 in round_info["Matches"]:
                    sql_query1 = """
                        SELECT match_id FROM `tennis_ladder`.`singles_match`
                        WHERE league_id = %s
                        AND ((player1_id = %s AND player2_id = %s) OR
                        (player2_id = %s AND player1_id = %s));
                        """
                    sql_query2 = """
                        INSERT IGNORE INTO `tennis_ladder`.`singles_match`
                        (
                        `match_id`,
                        `player1_id`,
                        `player2_id`,
                        `league_id`)
                        VALUES
                        (%s,
                        %s,
                        %s,
                        %s);
                        """
                    sql_query3 = """
                    SELECT concat(p1.first_name, ' ', p1.last_name) as 'player1_name', concat(p2.first_name, ' ', p2.last_name) as 'player2_name'
                    FROM player p1, player p2
                    WHERE p1.player_id = %s
                    AND p2.player_id = %s;
                    """
                    # Execute the queries
                    cursor.execute(sql_query1, (league_id, player1, player2, player1, player2))
                    result = cursor.fetchall()
                    match_id = result[0]["match_id"] if result else None

                    # If match_id is None then DB generates one
                    cursor.execute(sql_query2, (match_id, player1, player2, league_id))

                    cursor.execute(sql_query3, (player1, player2))   
                    player_names = cursor.fetchall()
                    resp.append(player_names)                 

            result = {
                "Business_name": business_name,
                "matchups": resp
            }

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
        'body': json.dumps(result)
    }
