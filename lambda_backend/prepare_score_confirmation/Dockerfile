# Dockerfile
FROM public.ecr.aws/lambda/python:3.12

RUN pip install --upgrade pip

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY prepareScoreConfirmation.py ./

CMD ["prepareScoreConfirmation.lambda_handler"]
