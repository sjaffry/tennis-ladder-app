import json
import boto3
import base64
import os
import re
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

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

def generate_html_table(text_list):
    html = """
    <table border='1' style='border-collapse: collapse;'>
        <style>
            td { padding: 10px; }
        </style>
    """
    for text in text_list:
        match = re.match(r"(Match \d+): (.+)", text)  # Extract match number and players
        if match:
            match_number, players = match.groups()
            html += f" <tr><td>{match_number}</td><td style='padding-left: 20px;'>{players}</td></tr>\n"
        else:
            html += f"  <tr><td colspan='2'>{text}</td></tr>\n"  # Fallback in case format is unexpected
    html += "</table>"
    return html

def generate_content (league_name, matchups, business_name):

    body_html_part_1 = '''
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sports Ladder Login</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    margin: 50px;
                }
                h1 {
                    color: #333;
                }
                h2 {
                    color: #555;
                }
                a.login-button,
                a.login-button:link,
                a.login-button:visited,
                a.login-button:hover,
                a.login-button:active {
                    display: inline-block;
                    padding: 12px 24px;
                    font-size: 18px;
                    color: white; /* <== THIS will now stick */
                    background-color: #43c2f0;
                    border: none;
                    border-radius: 8px;
                    text-decoration: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                a.login-button:hover, a.login-button:focus {
                    background-color: #1fa8db;
                    box-shadow: 0 6px 12px rgba(31, 168, 219, 0.6);
                    transform: translateY(-2px);
                }

                a.login-button:active {
                    background-color: #178bb8;
                    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
                    transform: translateY(0);
                }
            </style>
        </head>
        <body>
            <h2>Below are the match-ups</h2>
            <p>Please add your availability and setup matches using the Sports Ladder app.</p>
            <p><a href="https://sports-ladder.onreaction.com/" class="login-button">Login to Sports Ladder</a></p>
            <p>
            '''
    body_html_part_2 = f'''
            {generate_html_table(matchups)}
            </p>
            </body>
        </html>'''

    body_html = body_html_part_1 + body_html_part_2

    body_text = f'''Below are the match ups for {league_name}.
                {matchups}
                '''

    return {
        "body_html": body_html,
        "body_text": body_text
    }

def lambda_handler(event, context):
    token = event['headers']['Authorization']
    decoded = decode_jwt(token)
    # We only ever expect the user to be in one group only - business rule
    business_name = decoded['cognito:groups'][0]
    payload = json.loads(event["body"])
    league_name = payload['league_name']
    league_admin_email = payload['league_admin_email']
    matchups = []
    recipient_email = []
    subject = f'Match Draw! {league_name}'
    match_number = 1  # Initialize match counter

    try:
        for matchup in payload['matches']:
            # Check for required field (email)
            if not matchup.get('player1_email'):
                print(f"Skipping match due to missing email field: {match}")
                continue
            if not matchup.get('player2_email'):
                print(f"Skipping match record due to missing email fieldd: {match}")
                continue
            matchups.append(f"Match {match_number}: {matchup['player1_name']} vs {matchup['player2_name']}")
            # Append recipient emails
            recipient_email.append(matchup["player1_email"])
            recipient_email.append(matchup["player2_email"])
            match_number += 1  # Increment match counter
        
        email_content = generate_content(league_name, matchups, business_name)
        dedpued_recipient_emails = list(set(recipient_email))

        # Send the email
        print('sending email to all players')
        print(dedpued_recipient_emails)
        message = Mail(
            from_email=f'robot-{business_name}@onreaction.com',
            to_emails=dedpued_recipient_emails,
            subject=subject,
            html_content=email_content["body_html"])

        message.reply_to = league_admin_email

        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)

    except Exception as e:
        raise e

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://sports-ladder.onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
        }, 
        'body': json.dumps("result")
    }
