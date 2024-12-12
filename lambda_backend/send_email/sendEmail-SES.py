import json
import boto3
import os

def send_email (score_data, url, recipient_email):

    subject = 'Confirm new match score!'
    body_html = f'''<html>
            <body>
            <h2>Robot has auto entered the scores</h2>
            <h2>
            {score_data["set1_p1"]}-{score_data["set1_p2"]}
            {score_data["set2_p1"]}-{score_data["set2_p2"]}
            {score_data["set3_p1"]}-{score_data["set3_p2"]}
            (Winner: {score_data["winner_name"]})
            </h2>
            <a href="{url}" target="_blank" style="text-decoration: none;">
                <button style="background-color: #2586f5; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Click to verify</button>
            </a>
            </body>
        </html>'''

    body_text = f'''Robot has auto entered the scores.
                        {score_data["set1_p1"]} - {score_data["set1_p2"]}
                        {score_data["set2_p1"]} - {score_data["set2_p2"]}
                        {score_data["set3_p1"]} - {score_data["set3_p2"]}
                        Winner: {score_data["winner_name"]}
                        Verify score here: {url}
                '''

    # Initialize the SES client
    ses_client = boto3.client('ses', region_name='us-west-2')
    sender_email = "robot-ftsc@onreaction.com"

    try:
        # Send the email
        print('sending email to:' + recipient_email)
        response = ses_client.send_email(
            Source=sender_email,
            Destination={
                'ToAddresses': [recipient_email],
            },
            Message={
                'Subject': {
                    'Data': subject,
                    'Charset': 'UTF-8'
                },
                'Body': {
                    'Text': {
                        'Data': body_text,
                        'Charset': 'UTF-8'
                    },
                    'Html': {
                        'Data': body_html,
                        'Charset': 'UTF-8'
                    }
                }
            }
        )

        # Return success response
        return {
            'statusCode': 200,
            'body': {
                'message': 'Email sent successfully!',
                'response': "response"
            }
        }

    except Exception as e:
        # Handle exceptions
        print(f"Error sending email: {str(e)}")
        return {
            'statusCode': 500,
            'body': {
                'message': 'Failed to send email',
                'error': str(e)
            }
        }

def lambda_handler(event, context):

    score_data = event["score_data"]

    for i in event["recipients"]:
        url = i["url"]
        recipient_email = i["recipient_email"]
        send_email(score_data, url, recipient_email)

    return {
        'statusCode': 200,
        'body': {
            'message': 'Email sent successfully!',
            'response': "response"
        }
    }