import json
import boto3
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import *
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

def send_email (business_name, organizer_email, organizer_first_name, organizer_last_name, organizer_message, opponent_email, match_date, match_type, league_name):
    subject = f'New match request from {organizer_first_name.title()} ({match_type} )'
    body_html = f'''<html>
            <body>
            <b>{organizer_first_name.title()} {organizer_last_name.title()}</b> would like to play on {match_date}.
            <p>
            <b>{organizer_first_name.title()}'s message</b>: {organizer_message}
            </p>
            <p>Reply to this email to confirm this match.<p>
            </body>
        </html>'''

    body_text = f'''
                {organizer_first_name.title()} {organizer_last_name.title()} would like to play on {match_date}.
                {organizer_first_name.title()}'s message: {organizer_message}
                Reply to this email to confirm this match.
                '''

    cc_emails = [organizer_email]

    try:        
        # Send the email
        print('sending email to:')
        print(opponent_email)

        to_emails_list = [To(email) for email in opponent_email]
        
        message = Mail(
            from_email=f'robot-{business_name}@onreaction.com',
            to_emails=to_emails_list,
            subject=subject,
            plain_text_content=body_text,
            html_content=body_html,
        )

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
    organizer_email = event.get("queryStringParameters", {}).get('player_email', None)
    organizer_first_name = event.get("queryStringParameters", {}).get('player_first_name', None)
    organizer_last_name = event.get("queryStringParameters", {}).get('player_last_name', None)
    opponent_email = event.get("multiValueQueryStringParameters", {}).get('opponent_email[]', None)
    match_date = event.get("queryStringParameters", {}).get('match_date', None)
    match_type = event.get("queryStringParameters", {}).get('match_type', None)
    league_name = event.get("queryStringParameters", {}).get('league_name', None)
    organizer_message = event.get("queryStringParameters", {}).get('organizer_message', None)
    token = event['headers']['Authorization']
    decoded = decode_jwt(token)

    # Since a user could also be in a tennis-admin group, we want to filter that out
    filtered_values = [value for value in decoded['cognito:groups'] if value != 'tennis-admin']

    # Assign the first remaining value to a variable (if there's at least one remaining value)
    # We only ever expect one business name association to a user's profile
    business_name = filtered_values[0] if filtered_values else None

    resp = send_email(business_name, organizer_email, organizer_first_name, organizer_last_name, organizer_message, opponent_email, match_date, match_type, league_name)

    result = {
        "Business_name": business_name,
        "email_result": resp
    }

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "https://sports-ladder.onreaction.com",
            "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET"
    },    
        'body': json.dumps(result)
    } 