CREATE TABLE IF NOT EXISTS USERS (ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT NOT NULL, EMAIL TEXT NOT NULL UNIQUE, LOGIN TEXT NOT NULL UNIQUE, PASSWORD TEXT NOT NULL, TIME TEXT NOT NULL );
CREATE TABLE IF NOT EXISTS USERS_SESSION (ID TEXT NOT NULL UNIQUE, USER_ID TEXT NOT NULL, USER_NAME TEXT NOT NULL, USER_EMAIL TEXT NOT NULL UNIQUE, USER_LOGIN TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS USERS_CITIES (USER_ID TEXT NOT NULL, CITIES TEXT NOT NULL, FORECAST TEXT NOT NULL );
CREATE TABLE IF NOT EXISTS USER_SOURCES (USER_ID TEXT NOT NULL, SOURCE_ID TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS SOURCES (ID TEXT NOT NULL, NAME TEXT NOT NULL UNIQUE);
DELETE FROM SOURCES;
INSERT INTO SOURCES (ID,NAME) VALUES ("1","yandex");
INSERT INTO SOURCES (ID,NAME) VALUES ("2","gismeteo");
INSERT INTO SOURCES (ID,NAME) VALUES ("3","weatherCom");