drop database if exists projectx
create database projectx;
use projectx;

create table users(
    username varchar(255) not null primary key,
    password varchar(255) not null
);
insert into users values("123", "1234");

create table tokens(
    username varchar(255) not null primary key,
    token varchar(255) not null,
    date datetime default curdate()
);

create table points(
    username varchar(255) not null primary key,
    points integer not null
);

create table players(
    username varchar(255) not null primary key,
    hp integer not null
    x integer not null,
    y integer not null,
    w integer not null,
    h integer not null
);

create user if not exists "pxadmin"@"localhost" identified by "1234";
grant all privileges on projectx to "pxadmin"@"localhost";