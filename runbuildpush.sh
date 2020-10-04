folder=tickets
cd /Users/partha/Documents/projects/microservices/$folder
docker build -t ushpar71/$folder .
docker push ushpar71/$folder

folder=orders
cd /Users/partha/Documents/projects/microservices/$folder
docker build -t ushpar71/$folder .
docker push ushpar71/$folder


folder=auth
cd /Users/partha/Documents/projects/microservices/$folder
docker build -t ushpar71/$folder .
docker push ushpar71/$folder


folder=expiration
cd /Users/partha/Documents/projects/microservices/$folder
docker build -t ushpar71/$folder .
docker push ushpar71/$folder


folder=payments
cd /Users/partha/Documents/projects/microservices/$folder
docker build -t ushpar71/$folder .
docker push ushpar71/$folder


folder=ticketingclient
cd /Users/partha/Documents/projects/microservices/$folder
docker build -t ushpar71/$folder .
docker push ushpar71/$folder


cd /Users/partha/Documents/projects/microservices

