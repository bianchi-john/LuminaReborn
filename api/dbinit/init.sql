CREATE DATABASE IF NOT EXISTS luminadb;

USE luminadb;

DROP TABLE IF EXISTS users;

CREATE TABLE `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_role` int,
  `email` varchar(255),
  `first_name` varchar(255),
  `last_name` varchar(255),
  `password` varchar(255)
);

DROP TABLE IF EXISTS schede;

CREATE TABLE `schede` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `autore` varchar(255),
  `titolo` varchar(255),
  `cronologia_ambito` int,
  `oggetto` varchar(255),
  `iscrizioni` varchar(255),
  `corpo_scheda` varchar(255),
  `storia_espositiva` varchar(255)
);

DROP TABLE IF EXISTS tds_users_schede;


CREATE TABLE `tds_users_schede` (
  `id_user` int,
  `id_scheda` int,
  `data_modifica` timestamp
);

DROP TABLE IF EXISTS materiali;


CREATE TABLE `materiali` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `nome_materiale` varchar(255),
  `descrizione` varchar(255)
);

DROP TABLE IF EXISTS tds_schede_materiali;


CREATE TABLE `tds_schede_materiali` (
  `id_scheda` int,
  `id_materiale` int
);

DROP TABLE IF EXISTS tecniche;


CREATE TABLE `tecniche` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `nome_tecnica` varchar(255),
  `descrizione` varchar(255)
);

DROP TABLE IF EXISTS tds_schede_tecniche;


CREATE TABLE `tds_schede_tecniche` (
  `id_scheda` int,
  `id_tecnica` int
);

DROP TABLE IF EXISTS misure;


CREATE TABLE `misure` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `misura` float,
  `unita_di_misura` varchar(255),
  `descrizione` varchar(255)
);

DROP TABLE IF EXISTS tds_schede_misure;


CREATE TABLE `tds_schede_misure` (
  `id_scheda` int,
  `id_misura` int
);

DROP TABLE IF EXISTS ubicazioni;


CREATE TABLE `ubicazioni` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `ubicazione` varchar(255),
  `descrizione` varchar(255)
);

DROP TABLE IF EXISTS tds_schede_ubicazioni;


CREATE TABLE `tds_schede_ubicazioni` (
  `id_scheda` int,
  `id_ubicazione` int
);

DROP TABLE IF EXISTS inventari;



CREATE TABLE `inventari` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `numero_inventario` varchar(255),
  `nome_inventario` varchar(255),
  `descrizione` varchar(255)
);


DROP TABLE IF EXISTS tds_schede_inventari;



CREATE TABLE `tds_schede_inventari` (
  `id_scheda` int,
  `id_inventario` int
);

DROP TABLE IF EXISTS provenienze;


CREATE TABLE `provenienze` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `provenienza` varchar(255),
  `descrizione` varchar(255)
);


DROP TABLE IF EXISTS tds_schede_provenienze;


CREATE TABLE `tds_schede_provenienze` (
  `id_scheda` int,
  `id_provenienza` int
);

DROP TABLE IF EXISTS mostre;


CREATE TABLE `mostre` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `titolo_mostra` varchar(255),
  `data_mostra` varchar(255),
  `descrizione` varchar(255)
);

DROP TABLE IF EXISTS tds_schede_mostre;


CREATE TABLE `tds_schede_mostre` (
  `id_scheda` int,
  `id_mostra` int
);

DROP TABLE IF EXISTS bibliografie;


CREATE TABLE `bibliografie` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `riferimento_bibliografico` varchar(255),
  `altro` varchar(255)
);


DROP TABLE IF EXISTS tds_schede_bibliografie;

CREATE TABLE `tds_schede_bibliografie` (
  `id_scheda` int,
  `id_riferimento` int
);

ALTER TABLE `tds_users_schede` ADD FOREIGN KEY (`id_scheda`) REFERENCES `schede` (`id`);

ALTER TABLE `tds_users_schede` ADD FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);

ALTER TABLE `tds_schede_materiali` ADD FOREIGN KEY (`id_scheda`) REFERENCES `schede` (`id`);

ALTER TABLE `tds_schede_materiali` ADD FOREIGN KEY (`id_materiale`) REFERENCES `materiali` (`id`);

ALTER TABLE `tds_schede_tecniche` ADD FOREIGN KEY (`id_scheda`) REFERENCES `schede` (`id`);

ALTER TABLE `tds_schede_tecniche` ADD FOREIGN KEY (`id_tecnica`) REFERENCES `tecniche` (`id`);

ALTER TABLE `tds_schede_misure` ADD FOREIGN KEY (`id_scheda`) REFERENCES `schede` (`id`);

ALTER TABLE `tds_schede_misure` ADD FOREIGN KEY (`id_misura`) REFERENCES `misure` (`id`);

ALTER TABLE `tds_schede_ubicazioni` ADD FOREIGN KEY (`id_scheda`) REFERENCES `schede` (`id`);

ALTER TABLE `tds_schede_ubicazioni` ADD FOREIGN KEY (`id_ubicazione`) REFERENCES `ubicazioni` (`id`);

ALTER TABLE `tds_schede_inventari` ADD FOREIGN KEY (`id_scheda`) REFERENCES `schede` (`id`);

ALTER TABLE `tds_schede_inventari` ADD FOREIGN KEY (`id_inventario`) REFERENCES `inventari` (`id`);

ALTER TABLE `tds_schede_provenienze` ADD FOREIGN KEY (`id_scheda`) REFERENCES `schede` (`id`);

ALTER TABLE `tds_schede_provenienze` ADD FOREIGN KEY (`id_provenienza`) REFERENCES `provenienze` (`id`);

ALTER TABLE `tds_schede_mostre` ADD FOREIGN KEY (`id_scheda`) REFERENCES `schede` (`id`);

ALTER TABLE `tds_schede_mostre` ADD FOREIGN KEY (`id_mostra`) REFERENCES `mostre` (`id`);

ALTER TABLE `tds_schede_bibliografie` ADD FOREIGN KEY (`id_scheda`) REFERENCES `schede` (`id`);

ALTER TABLE `tds_schede_bibliografie` ADD FOREIGN KEY (`id_riferimento`) REFERENCES `bibliografie` (`id`);