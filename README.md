# Lumina Reborn
## Project for "Lucca National Museums"

Made with:

- Mysql
- NodeJs
- Docker
- Bootstrap
## Installation

Setup and run:

```sh
sudo systemctl stop mysql.service 
cd api
npm i
npm run start:build
docker-compose up -d --build
./QUERY.sh
```

Run

```sh
docker-compose up  -d
```

Delete all and recreate

```sh
docker stop $(docker ps -aq) && docker rm $(docker ps -aq) && docker rmi $(docker images -q) --force
sudo rm -rf data
npm run start:build
docker-compose up -d --build

./QUERY.sh
```

NPM

```sh
npm run start:build
npm run start:dev
```

MYSQL

```sh
sudo systemctl start mysql.service 
sudo systemctl stop mysql.service 
mysql -u root -p
```

DOCKER

```sh

# List all containers (only IDs)
docker ps -aq && docker images

# Stop all running containers and Remove all containers and Remove all images
docker stop $(docker ps -aq) && docker rm $(docker ps -aq) && docker rmi $(docker images -q) --force

# List all containers (only IDs)
docker ps -aq && docker images

docker-compose up -d --build

docker ps 
docker container attach nodeappcontainer

docker exec -it mysqlcontainer bash
mysql -u root -p
USE luminadb;
#Restart docker service
sudo systemctl restart docker.socket docker.service
show variables like "max_connections";
set global max_connections = 9999999;



```

Other

```sh
https://www.youtube.com/watch?v=aUMGAFE5pPM
https://github.com/getarrays/tsnodemysqlapi
```


## License

MIT

**Free Software, Hell Yeah!**

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [dill]: <https://github.com/joemccann/dillinger>
   [git-repo-url]: <https://github.com/joemccann/dillinger.git>
   [john gruber]: <http://daringfireball.net>
   [df1]: <http://daringfireball.net/projects/markdown/>
   [markdown-it]: <https://github.com/markdown-it/markdown-it>
   [Ace Editor]: <http://ace.ajax.org>
   [node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
   [express]: <http://expressjs.com>
   [AngularJS]: <http://angularjs.org>
   [Gulp]: <http://gulpjs.com>

   [PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
   [PlGh]: <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
   [PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
   [PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>
   [PlMe]: <https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md>
   [PlGa]: <https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md>
