# LUMiNA Reborn
 Project for [Lucca Musei Nazionali](http://www.luccamuseinazionali.it/)

## Requirements:

[Node version v21.6.2](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04)

```sh
# Install Node version v21.6.2 (via nvm in this guide)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc
nvm install 21.6.2
node -v
# This should display: v21.6.2

# Install all node modules
npm i
```

## Start
```sh
npm run start:build && docker compose up -d --build

# Restart
docker compose down && npm run start:build &&  docker compose up -d --build

# Delete all and recreate
docker stop $( docker ps -aq) && docker rm $(docker ps -aq) && docker rmi -f $(docker images -aq) --force && docker network prune --force && npm run start:build  && docker compose up -d --build

# Delete all:
docker system prune
docker system prune --all --volumes
```

## Other
```sh
# List container and images
docker ps -aq && docker images
docker ps 
# Attach to a specific container
docker container attach nodeappcontainer
# Access to database of the museum
docker exec -it mysqlcontainer bash
mysql -u root -p
letmein
USE luminadb;
# Change db max simultaneous connections
set global max_connections = 9999999;
#Restart docker service       
sudo systemctl restart docker.socket docker.service
show variables like "max_connections";
# Recreate extern network
docker network create extern
#Remove all the db data:
sudo rm -r database-data
sudo rm -r user-data
# Compile and start nodeapp:
npm run start:build
npm run start:dev

```
