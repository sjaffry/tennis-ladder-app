import json
import boto3
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
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

def send_email (business_name, organizer_email, organizer_name, organizer_message, opponent_email, match_date, league_name):
    subject = f'New match request! {league_name}'
    body_html = f'''<html>
            <body>
            <b>{organizer_name.title()}</b> would like to play on {match_date}.
            <p>
            <b>{organizer_name.title()}'s message</b>: {organizer_message}
            </p>
            <p>Reply to this email to confirm this match.<p>
            </body>
        </html>'''

    body_text = f'''
                {organizer_name.title()} would like to play on {match_date}.
                {organizer_name.title()}'s message: {organizer_message}
                Reply to this email to confirm this match.
                '''

    cc_emails = [organizer_email]

    try:
        # Send the email
        print('sending email to:' + opponent_email)
        message = Mail(
            from_email=f'robot-{business_name}@onreaction.com',
            to_emails=opponent_email,
            subject=subject,
            html_content=body_html)

        if cc_emails:
            for cc_email in cc_emails:
                message.add_cc(cc_email)
                
        message.reply_to = organizer_email

        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)

    except Exception as e:
        # Handle exceptions
        print(f"Error sending email: {str(e)}")
        raise(e)

    # Return success response
    return 'Email sent successfully to opponent!'

def lambda_handler(event, context):
    organizer_email = event["queryStringParameters"]['player_email']
    organizer_name = event["queryStringParameters"]['player_name']
    opponent_email = event["queryStringParameters"]['opponent_email']
    match_date = event["queryStringParameters"]['match_date']
    league_name = event["queryStringParameters"]['league_name']
    organizer_message = event["queryStringParameters"]['organizer_message']
    token = event['headers']['Authorization']
    decoded = decode_jwt(token)
    # We only ever expect the user to be in one group only - business rule
    business_name = decoded['cognito:groups'][0]

    resp = send_email(business_name, organizer_email, organizer_name, organizer_message, opponent_email, match_date, league_name)

    result = {
        "Business_name": business_name,
        "email_result": resp
    }

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
    },    
        'body': json.dumps(result)
    } 