import json
import boto3
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_email (score_data, url, recipient_email):

    if score_data['match_type'] == "singles":
        set1_1 = score_data["set1_p1"]
        set1_2 = score_data["set1_p2"]
        set2_1 = score_data["set2_p1"]
        set2_2 = score_data["set2_p2"]
        set3_1 = score_data["set3_p1"]
        set3_2 = score_data["set3_p2"]
        winner_name_1 = score_data["winner_name"]
    elif score_data['match_type'] == "doubles":
        set1_1 = score_data["set1_t1"]
        set1_2 = score_data["set1_t2"]
        set2_1 = score_data["set2_t1"]
        set2_2 = score_data["set2_t2"]
        set3_1 = score_data["set3_t1"]
        set3_2 = score_data["set3_t2"]
        winner_name_1 = score_data["p1_winner_name"]
        winner_name_2 = score_data["p2_winner_name"]
    else:
        raise Exception('Invalid match type')

    subject = 'Confirm new match score!'
    business_name = score_data["business_name"].lower()
    league_name = score_data["league_name"]
    body_html = f'''<html>
            <body>
            <h2>Robot has auto entered the scores</h2>
            <h3>
            {set1_1}-{set1_2}
            {set2_1}-{set2_2}
            {set3_1}-{set3_2}
            (Winner: {winner_name_1} {winner_name_2})
            </h3>
            <h3>{league_name}</h3>
            <a href="{url}" target="_blank" style="text-decoration: none;">
                <button style="background-color: #2586f5; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Click to verify</button>
            </a>
            </body>
        </html>'''

    body_text = f'''Robot has auto entered the scores.
                        {set1_1}-{set1_2}
                        {set2_1}-{set2_2}
                        {set3_1}-{set3_2}
                        (Winner: {winner_name_1} {winner_name_2})
                        Verify score here: {url}
                '''

    try:
        # Send the email
        print('sending email to:' + recipient_email)
        message = Mail(
            from_email=f'robot-{business_name}@onreaction.com',
            to_emails=recipient_email,
            subject=subject,
            html_content=body_html)
        try:
            sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
            response = sg.send(message)
            print(response.status_code)
            print(response.body)
            print(response.headers)
        except Exception as e:
            print(e.message)

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