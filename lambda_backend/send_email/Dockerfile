# Dockerfile
FROM public.ecr.aws/lambda/python:3.11

RUN pip install --upgrade pip

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY sendEmail.py ./

CMD ["sendEmail.lambda_handler"]
