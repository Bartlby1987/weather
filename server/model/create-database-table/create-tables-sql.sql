CREATE TABLE IF NOT EXISTS USERS (ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT NOT NULL, EMAIL TEXT NOT NULL UNIQUE, LOGIN TEXT NOT NULL UNIQUE, PASSWORD_HASH TEXT NOT NULL, SHOW_TIME TEXT NOT NULL );
CREATE TABLE IF NOT EXISTS USERS_SESSIONS (ID TEXT NOT NULL UNIQUE, USER_ID integer);
CREATE TABLE IF NOT EXISTS USERS_CITIES (USER_ID integer, CITY TEXT NOT NULL,  SHOW_FORECAST TEXT NOT NULL );
CREATE TABLE IF NOT EXISTS USER_SOURCES (USER_ID integer, SOURCE_ID INTEGER);
CREATE TABLE IF NOT EXISTS SOURCES (ID integer , NAME TEXT NOT NULL UNIQUE);
DELETE FROM SOURCES;
INSERT INTO SOURCES (ID,NAME) VALUES (1,"yandex");
INSERT INTO SOURCES (ID,NAME) VALUES (2,"gismeteo");
INSERT INTO SOURCES (ID,NAME) VALUES (3,"weatherCom");