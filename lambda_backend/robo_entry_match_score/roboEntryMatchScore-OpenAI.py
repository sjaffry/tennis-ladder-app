import json
from openai import OpenAI
import os
import pymysql
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

def lambda_handler(event, context):
    db_host = os.environ['DB_HOST']
    db_user = os.environ['DB_USER']
    db_password = os.environ['DB_PASSWORD']
    db_name = os.environ['DB_NAME']
    openai_api_key = os.environ['OPENAI_API_KEY']

    # Remove any single quotes around the Message field
    sns_message = event['Records'][0]['Sns']['Message']
    if sns_message.startswith("'") and sns_message.endswith("'"):
        sns_message = sns_message[1:-1]  # Strip single quotes
    parsed_message = json.loads(sns_message)

    email_content = parsed_message['content']
    email_headers = parsed_message['mail']['headers']
    business_name = next((header['value'] for header in email_headers if header['name'] == 'business-name'), None)

    output_json = '''
            {
                "league_name": ,
                "match_type": ,
                "players": {
                    "winner_player1_firstName": ,
                    "winner_player1_lastName": ,
                    "winner_player2_firstName": ,
                    "winner_player2_lastName": ,
                    "loser_player1_firstName": ,
                    "loser_player1_lastName": ,
                    "loser_player2_firstName": ,
                    "loser_player2_lastName":
                },
                "score": {
                    "set_1": {
                        "winner_score": ,
                        "loser_score": 
                    },
                    "set_2": {
                        "winner_score": ,
                        "loser_score": 
                    },
                    "set_3": {
                        "winner_score": ,
                        "loser_score": 
                    }
                }
            }
'''

    prompt = f'''Your task is to take the email provided representing the outcome of a tennis match and convert it into a well-organized table format using JSON. The email is addressed to the coach, who is not a player in the match so do not identify them as a player. Here's the email content: 
            <email>
            {email_content}
            </email>
            To execute this task, ignore all email metadata information. Read the email text after the words 'Content-Type: text/plain; charset="UTF-8"' and then identify the players, identify the league name, identify if it's a singles or a doubles match and determine the score per set and who the winner of the match was in the text and use them as keys in the JSON object. Then, extract the relevant information from the text and populate the corresponding values in the JSON object. 
            Ensure that the data is accurately represented and properly formatted within the JSON structure. Respond only with the json data. Do not include any text before or after the json.
            If a value for a particular key is missing then return an empty string in it's place.
            Use the following JSON format to produce the json output. If it's a singles match then do not include the keys and values for player2:
            <JSON>
            {output_json}
            </JSON>
            '''

    client = OpenAI(
        api_key=openai_api_key
    )

    try:
        completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="gpt-4o-mini",
        )

        llmresult = completion.choices[0].message.content
        cleanResult = llmresult.replace('json','')
        cleanResult = cleanResult.replace('`','')
        jsonresult = json.loads(cleanResult)


        match_type = jsonresult['match_type']
        league_name = jsonresult['league_name']
        winner_player1_fname = jsonresult['players']['winner_player1_firstName']
        winner_player1_lname = jsonresult['players']['winner_player1_lastName']
        winner_player2_fname = jsonresult['players']['winner_player2_firstName']
        winner_player2_lname = jsonresult['players']['winner_player2_lastName']
        loser_player1_fname = jsonresult['players']['loser_player1_firstName']
        loser_player1_lname = jsonresult['players']['loser_player1_lastName']
        loser_player2_fname = jsonresult['players']['loser_player2_firstName']
        loser_player2_lname = jsonresult['players']['loser_player2_lastName']
        set1_w = jsonresult['score']['set_1']['winner_score']
        set1_l = jsonresult['score']['set_1']['loser_score']
        set2_w = jsonresult['score']['set_2']['winner_score']
        set2_l = jsonresult['score']['set_2']['loser_score']
        set3_w = jsonresult['score']['set_3']['winner_score']
        set3_l = jsonresult['score']['set_3']['loser_score']

        # Let's make sure all mandatory data is in the Json
        if match_type == '':
            raise Exception('League name cannot be null') 
        if league_name == '':
            raise Exception('League name cannot be null')        
        if winner_player1_fname == '':
            raise Exception('Winner firstname cannot be null')
        if winner_player1_lname == '':
            raise Exception('Winner lastname cannot be null')
        if loser_player1_fname == '':
            raise Exception('Loser firstname cannot be null')
        if loser_player1_lname == '':
            raise Exception('Loser lastname cannot be null')
        if set1_w == '':
            raise Exception('1st set loser score cannot be null')
        if set1_l == '':
            raise Exception('1st set winner score cannot be null')
        if set2_w == '':
            raise Exception('1st set loser score cannot be null')
        if set2_l == '':
            raise Exception('2nd set winner score cannot be null')

    except Exception as e:
        print("Error during OpenAI API call:", e)
        raise e

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
            if match_type == 'singles':
                sql_query = "CALL `tennis_ladder`.`UpdateMatchScoreAndLadderRobot`('2024-01-01',%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);"
                # Execute the query
                cursor.execute(sql_query, (business_name, league_name, winner_player1_fname, winner_player1_lname, loser_player1_fname, loser_player1_lname, set1_w, set1_l, set2_w, set2_l, set3_w, set3_l))
            elif match_type == 'doubles':
                sql_query = "CALL `tennis_ladder`.`UpdateDoublesMatchScoreAndLadderRobot`('2024-01-01',%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);"
                # Execute the query
                cursor.execute(sql_query, (business_name, league_name, winner_player1_fname, winner_player1_lname, winner_player2_fname, winner_player2_lname, loser_player1_fname, loser_player1_lname, loser_player2_fname, loser_player2_lname, set1_w, set1_l, set2_w, set2_l, set3_w, set3_l))
            else:
                raise Exception('Unkonwn match type: ' + match_type)        
            
            # Fetch all the rows that match the condition
            resp = cursor.fetchall()

        result = {
            "Business_name": business_name,
            "Match_data": resp[0] if resp else "No match found! Did you enter the details correct?"
        }

    except Exception as e:
        print('Error querying MySQL:', e)
        raise e
    finally:
        connection.close()

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
        },
        'body': result
    }
