# LUMiNA Reborn
## Project for "Lucca National Museums"

Requirements:

   -Install node version v21.6.2 possibly via nvm. Here's a tutorial to follow:
   https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04


Setup and run:

```sh
cd api
npm i
npm run start:build && sudo docker compose up -d --build
```

Run
```sh
sudo docker compose up  -d
```
Restart
```sh
sudo docker compose down && npm run start:build && sudo docker compose up -d --build
 ```

Delete all and recreate
```sh
# Elimino tutto i container e immagini
sudo docker stop $(sudo docker ps -aq) && sudo docker rm $(sudo docker ps -aq) && sudo docker rmi -f $(sudo docker images -aq) --force &&  sudo docker network prune --force
npm run start:build  && sudo docker compose up -d --build
```

Delete all:
```sh
sudo docker system prune
sudo docker system prune --all --volumes
```

Issues:
```sh
# Recreate extern network
sudo docker network create extern
```

Altro:
```sh
sudo docker ps -aq && sudo docker images
sudo docker compose up -d --build
sudo docker ps 
sudo docker container attach nodeappcontainer
sudo docker exec -it mysqlcontainer bash
mysql -u root -p
letmein
USE luminadb;
set global max_connections = 9999999;
cd api && sudo rm -r data && sudo docker compose down && npm run start:build && sudo docker compose up -d --build
#Restart sudo docker service       
sudo systemctl restart sudo docker.socket sudo docker.service
show variables like "max_connections";

```
Compile and start nodeapp:
```sh
npm run start:build
npm run start:dev
```


Delete a scheda:
```sh
DELETE FROM tds_schede_altreBibliografie WHERE id_scheda = 5;
DELETE FROM tds_schede_autori WHERE id_scheda = 5;
DELETE FROM tds_schede_bibliografie WHERE id_scheda = 5;
DELETE FROM tds_schede_cronologie WHERE id_scheda = 5;
DELETE FROM tds_schede_documentazioniFotografiche WHERE id_scheda = 5;
DELETE FROM tds_schede_immagini WHERE id_scheda = 5;
DELETE FROM tds_schede_inventari WHERE id_scheda = 5;
DELETE FROM tds_schede_materiali WHERE id_scheda = 5;
DELETE FROM tds_schede_misure WHERE id_scheda = 5;
DELETE FROM tds_schede_mostre WHERE id_scheda = 5;
DELETE FROM tds_schede_provenienze WHERE id_scheda = 5;
DELETE FROM tds_schede_statoScheda WHERE id_scheda = 5;
DELETE FROM tds_schede_tecniche WHERE id_scheda = 5;
DELETE FROM tds_schede_ubicazioni WHERE id_scheda = 5;
DELETE FROM tds_users_schede WHERE id_scheda = 5;
DELETE FROM schede WHERE id = 5;
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
