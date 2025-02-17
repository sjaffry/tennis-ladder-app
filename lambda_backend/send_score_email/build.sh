docker buildx build --platform linux/amd64 -t tennis-ladder .
docker tag tennis-ladder:latest 303830944942.dkr.ecr.us-west-2.amazonaws.com/tennis-ladder:sce
docker push 303830944942.dkr.ecr.us-west-2.amazonaws.com/tennis-ladder:sce
