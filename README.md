# LUMiNA Reborn
## Project for "Lucca National Museums"

Setup and run:

```sh
cd api
npm i
npm run start:build && docker-compose up -d --build
```

Run
```sh
docker-compose up  -d
```
Restart
```sh
docker-compose down && npm run start:build && docker-compose up -d --build
 
 ```

Delete all and recreate
```sh
# Elimino tutto i container e immagini
docker stop $(docker ps -aq) && docker rm $(docker ps -aq) && docker rmi -f $(docker images -aq) --force &&  docker network prune --force
npm run start:build  && docker-compose up -d --build
```

Issues:
```sh
# Recreate extern network
docker network create extern
```

Altro:
```sh
docker ps -aq && docker images
docker-compose up -d --build
docker ps 
docker container attach nodeappcontainer
docker exec -it mysqlcontainer bash
mysql -u root -p
letmein
USE luminadb;
set global max_connections = 9999999;
cd api && sudo rm -r data && docker-compose down && npm run start:build && docker-compose up -d --build
#Restart docker service       
sudo systemctl restart docker.socket docker.service
show variables like "max_connections";

```
Compile and start nodeapp
```sh
npm run start:build
npm run start:dev
```

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
