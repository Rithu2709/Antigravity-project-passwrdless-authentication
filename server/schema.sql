-- Database Schema for ReactorAuth

CREATE DATABASE IF NOT EXISTS reactor_auth;
USE reactor_auth;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    reactor_angles TEXT NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
