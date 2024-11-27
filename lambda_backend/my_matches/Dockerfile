# Dockerfile
FROM public.ecr.aws/lambda/python:3.11

RUN pip install --upgrade pip

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY myMatches.py ./

CMD ["myMatches.lambda_handler"]
