import json
import boto3
import base64
import os
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
    html = "<table border='1'>\n"
    for text in text_list:
        html += f"  <tr><td>{text}</td></tr>\n"
    html += "</table>"
    return html

def generate_content (league_name, matchups, business_name):

    body_html = f'''<html>
            <body>
            <h3>Below are the match-ups for {league_name}</h3>
            <p>
            Please update your availability and schedule your matches via the ladder app.
            </p>
            <p>
            https://sports-ladder.onreaction.com/
            </p>
            {generate_html_table(matchups)}
            </body>
        </html>'''

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

    try:
        for matchup in payload['matches']:
            # Check for required field (email)
            if not matchup.get('player1_email'):
                print(f"Skipping match due to missing email field: {match}")
                continue
            if not matchup.get('player2_email'):
                print(f"Skipping match record due to missing email fieldd: {match}")
                continue
            matchups.append(matchup["player1_name"]+" vs "+matchup["player2_name"])
            recipient_email.append(matchup["player1_email"])
            recipient_email.append(matchup["player2_email"])
        
        email_content = generate_content(league_name, matchups, business_name);

        # Send the email
        print('sending email to all players')
        message = Mail(
            from_email=f'robot-{business_name}@onreaction.com',
            to_emails=recipient_email,
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
