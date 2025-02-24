import json
import boto3
import base64
import os
import pymysql

def encode_b64 (player_data):
    text = f'{player_data['email']}/{player_data['designation']}/{player_data['match_id']}/{player_data['winner_id']}/{player_data['loser_id']}/{player_data['league_id']}/{player_data['match_type']}'
    # generate base64 of the match score data
    encoded_text = base64.urlsafe_b64encode(text.encode("utf-8")).decode("utf-8")
    return encoded_text

def send_confirm_email_doubles(score_data):
    player1_data = {
        "email": score_data["player1_email"],
        "designation": 1,
        "match_id": score_data["match_id"],
        "winner_id": score_data["winner_id"],
        "loser_id": score_data["loser_id"],
        "league_id": score_data["league_id"],
        "match_type": score_data["match_type"]
    }

    player2_data = {
        "email": score_data["player2_email"],
        "designation": 1,
        "match_id": score_data["match_id"],
        "winner_id": score_data["winner_id"],
        "loser_id": score_data["loser_id"],
        "league_id": score_data["league_id"],
        "match_type": score_data["match_type"]
    }

    player3_data = {
        "email": score_data["player3_email"],
        "designation": 2,
        "match_id": score_data["match_id"],
        "winner_id": score_data["winner_id"],
        "loser_id": score_data["loser_id"],
        "league_id": score_data["league_id"],
        "match_type": score_data["match_type"]
    }

    player4_data = {
        "email": score_data["player4_email"],
        "designation": 2,
        "match_id": score_data["match_id"],
        "winner_id": score_data["winner_id"],
        "loser_id": score_data["loser_id"],
        "league_id": score_data["league_id"],
        "match_type": score_data["match_type"]
    }

    b64_encoded_p1 = encode_b64(player1_data)
    b64_encoded_p2 = encode_b64(player2_data)
    b64_encoded_p3 = encode_b64(player3_data)
    b64_encoded_p4 = encode_b64(player4_data)
    player1_email = score_data['player1_email']
    player2_email = score_data['player2_email']
    player3_email = score_data['player3_email']
    player4_email = score_data['player4_email']
    p1_url = f'https://r0s4c1vc8j.execute-api.us-west-2.amazonaws.com/Prod?payload={b64_encoded_p1}'
    p2_url = f'https://r0s4c1vc8j.execute-api.us-west-2.amazonaws.com/Prod?payload={b64_encoded_p2}'
    p3_url = f'https://r0s4c1vc8j.execute-api.us-west-2.amazonaws.com/Prod?payload={b64_encoded_p3}'
    p4_url = f'https://r0s4c1vc8j.execute-api.us-west-2.amazonaws.com/Prod?payload={b64_encoded_p4}'

    return {
        "score_data": score_data,
        "recipients": [
            {"url": p1_url, "recipient_email": player1_email},
            {"url": p2_url, "recipient_email": player2_email},
            {"url": p3_url, "recipient_email": player3_email},
            {"url": p4_url, "recipient_email": player4_email}
        ]
    }

def send_confirm_email_singles(score_data):
    player1_data = {
        "email": score_data["player1_email"],
        "designation": 1,
        "match_id": score_data["match_id"],
        "winner_id": score_data["winner_id"],
        "loser_id": score_data["loser_id"],
        "league_id": score_data["league_id"],
        "match_type": score_data["match_type"]
    }

    player2_data = {
        "email": score_data["player2_email"],
        "designation": 2,
        "match_id": score_data["match_id"],
        "winner_id": score_data["winner_id"],
        "loser_id": score_data["loser_id"],
        "league_id": score_data["league_id"],
        "match_type": score_data["match_type"]
    }

    b64_encoded_p1 = encode_b64(player1_data)
    b64_encoded_p2 = encode_b64(player2_data)
    player1_email = score_data['player1_email']
    player2_email = score_data['player2_email']
    p1_url = f'https://r0s4c1vc8j.execute-api.us-west-2.amazonaws.com/Prod?payload={b64_encoded_p1}'
    p2_url = f'https://r0s4c1vc8j.execute-api.us-west-2.amazonaws.com/Prod?payload={b64_encoded_p2}'

    return {
        "score_data": score_data,
        "recipients": [
            {"url": p1_url, "recipient_email": player1_email},
            {"url": p2_url, "recipient_email": player2_email}
        ]
    }

def lambda_handler(event, context):
    db_host = os.environ['DB_HOST']
    db_user = os.environ['DB_USER']
    db_password = os.environ['DB_PASSWORD']
    db_name = os.environ['DB_NAME']
    business_name = event["body"]["Business_name"]

    # # Match confirmation data
    match_type = event["body"]["Match_data"]["Match_type"]
    match_id = event["body"]["Match_data"]["match_id"]
    league_id = event["body"]["Match_data"]["league_id"]
    league_name = event["body"]["Match_data"]["league_name"]
    
    if match_type == "singles":
        player1_id = event["body"]["Match_data"]["player1_id"]
        player2_id = event["body"]["Match_data"]["player2_id"]
        winner_id = event["body"]["Match_data"]["winner_id"]
        loser_id = event["body"]["Match_data"]["loser_id"]
        set1_p1 = event["body"]["Match_data"]["set1_p1"]
        set1_p2 = event["body"]["Match_data"]["set1_p2"]
        set2_p1 = event["body"]["Match_data"]["set2_p1"]
        set2_p2 = event["body"]["Match_data"]["set2_p2"]
        set3_p1 = event["body"]["Match_data"]["set3_p1"]
        set3_p2 = event["body"]["Match_data"]["set3_p2"]
        
    elif match_type == "doubles":
        team1_id = event["body"]["Match_data"]["team1_id"]
        team2_id = event["body"]["Match_data"]["team2_id"]
        winner_id = event["body"]["Match_data"]["winner_team_id"]
        loser_id = event["body"]["Match_data"]["loser_team_id"]
        set1_t1 = event["body"]["Match_data"]["set1_t1"]
        set1_t2 = event["body"]["Match_data"]["set1_t2"]
        set2_t1 = event["body"]["Match_data"]["set2_t1"]
        set2_t2 = event["body"]["Match_data"]["set2_t2"]
        set3_t1 = event["body"]["Match_data"]["set3_t1"]
        set3_t2 = event["body"]["Match_data"]["set3_t2"]
    
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
                # Singles match
                player1_query = f'select email, first_name from player where player_id = %s;'
                player2_query = f'select email, first_name from player where player_id = %s;'
                winner_query = f'select first_name from player where player_id = %s;'
                cursor.execute(player1_query, (player1_id))
                player1_resp = cursor.fetchall()
                cursor.execute(player2_query, (player2_id))
                player2_resp = cursor.fetchall()
                cursor.execute(winner_query, (winner_id))
                winner_resp = cursor.fetchall()

                score_data = {
                "match_type": match_type,
                "player1_email": player1_resp[0]['email'],
                "player2_email": player2_resp[0]['email'],
                "player1_name": player1_resp[0]['first_name'],
                "player2_name": player2_resp[0]['first_name'],
                "winner_name": winner_resp[0]['first_name'],
                "winner_id": winner_id,
                "loser_id": loser_id,
                "match_id": match_id,
                "league_id": league_id,
                "league_name": league_name,
                "set1_p1": set1_p1, 
                "set1_p2": set1_p2, 
                "set2_p1": set2_p1, 
                "set2_p2": set2_p2,
                "set3_p1": set3_p1,
                "set3_p2": set3_p2,
                "business_name": business_name
                }
                
                # For each player, call send_confirm_score
                email_payload = send_confirm_email_singles(score_data)

            elif match_type == "doubles":
                # Doubles match
                team1_query = f''' select p1.email as "p1_email", p1.first_name as "p1_first_name", p2.email "p2_email", p2.first_name as "p2_first_name" 
                                    from player p1, player p2, doubles_team t 
                                    where team_id = %s
                                    and t.player1_id = p1.player_id
                                    and t.player2_id = p2.player_id;
                '''
                team2_query = f''' select p1.email as "p1_email", p1.first_name as "p1_first_name", p2.email "p2_email", p2.first_name as "p2_first_name" 
                                    from player p1, player p2, doubles_team t 
                                    where team_id = %s
                                    and t.player1_id = p1.player_id
                                    and t.player2_id = p2.player_id;
                '''
                winner_query = f''' select p1.first_name as "p1_first_name", p2.first_name as "p2_first_name" 
                                    from player p1, player p2, doubles_team t 
                                    where team_id = %s
                                    and t.player1_id = p1.player_id
                                    and t.player2_id = p2.player_id;
                '''
                cursor.execute(team1_query, (team1_id))
                team1_resp = cursor.fetchall()
                cursor.execute(team2_query, (team2_id))
                team2_resp = cursor.fetchall()
                cursor.execute(winner_query, (winner_id))
                winner_resp = cursor.fetchall()

                score_data = {
                "match_type": match_type,
                "player1_email": team1_resp[0]['p1_email'],
                "player2_email": team1_resp[0]['p2_email'],
                "player3_email": team2_resp[0]['p1_email'],
                "player4_email": team2_resp[0]['p2_email'],
                "player1_name": team1_resp[0]['p1_first_name'],
                "player2_name": team1_resp[0]['p2_first_name'],
                "player3_name": team2_resp[0]['p1_first_name'],
                "player4_name": team2_resp[0]['p2_first_name'],
                "p1_winner_name": winner_resp[0]['p1_first_name'],
                "p2_winner_name": winner_resp[0]['p2_first_name'],
                "winner_id": winner_id,
                "loser_id": loser_id,
                "match_id": match_id,
                "league_id": league_id,
                "league_name": league_name,
                "set1_t1": set1_t1, 
                "set1_t2": set1_t2, 
                "set2_t1": set2_t1, 
                "set2_t2": set2_t2,
                "set3_t1": set3_t1,
                "set3_t2": set3_t2,
                "business_name": business_name
                }

                # For each player, call send_confirm_score
                email_payload = send_confirm_email_doubles(score_data)

            else:
                raise Exception("Unknown match type")

    except Exception as e:
        print('Error adding score into MySQL:', e)
        raise e

    finally:
        connection.close()        

    return email_payload

