-- SQL clause to create the database
CREATE DATABASE lightbnb;

-- PSQL code to connect to the database just created
\c lightbnb;

-- SQL clauses to delete all the tables if they already exist.
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS property_reviews CASCADE;

-- The following clauses create all the tables.

-- SQL clause to create the 'users' table that contains the details of the users of the app. This table has no foreign keys.
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255)
);

-- SQL clause to create the properties table, with the listed columns. This table has one foreign key that connects it to the users database.
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  thumbnail_photo_url VARCHAR(255),
  cover_photo_url VARCHAR(255),
  cost_per_night INTEGER,
  parking_spaces INTEGER,
  number_of_bathrooms INTEGER,
  number_of_bedrooms INTEGER,
  country VARCHAR(255),
  street VARCHAR(255),
  city VARCHAR(255),
  province VARCHAR(255),
  post_code VARCHAR(255),
  active BOOLEAN
);

-- SQL clause to create the 'reservations' table. This table has two foreign keys: (1) for connecting to the properties table (2) for connecting to the users table (id's of the guests) creating the reservation.
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  start_date DATE,
  end_date DATE,
  property_id INTEGER NOT NULL REFERENCES properties(id),
  guest_id INTEGER NOT NULL REFERENCES users(id)
);

-- SQL clause to create the 'property_reviews' table. This table has three foreign keys: (1) For connecting it to the users table (for the user who is posting the review (2) For connecting it to the properties table (for property that is being reviewed (3) For connecting it to the reservations table (for the reservation that the guest was at the property for).
CREATE TABLE property_reviews (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER NOT NULL REFERENCES users(id),
  property_id INTEGER NOT NULL REFERENCES properties(id),
  reservation_id INTEGER NOT NULL REFERENCES reservations(id),
  rating SMALLINT,
  message TEXT
);