const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});
//pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {console.log(response)})

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
  .query(`SELECT * FROM users WHERE email = $1`, [email])
  .then((result) => {
    console.log(result.rows);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
  // let user;
  // for (const userId in users) {
  //   user = users[userId];
  //   if (user.email.toLowerCase() === email.toLowerCase()) {
  //     break;
  //   } else {
  //     user = null;
  //   }
  // }
  // return Promise.resolve(user);
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool
  .query(`SELECT * FROM users WHERE id = $1`, [id])
  .then((result) => {
    console.log(result.rows);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
  //return Promise.resolve(users[id]);
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool
  .query(`INSERT INTO users (name, password, email) VALUES ($1, $2, $3) RETURNING *`, [user.name, user.password, user.email])
  .then((result) => {
    console.log(result.rows);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // return Promise.resolve(user);
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool
  .query(`SELECT reservations.*, properties.*, avg(rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2;`, [guest_id, limit])
  .then((result) => {
    console.log(result.rows);
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
  //return getAllProperties(null, 2);
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
   // 1
   const queryParams = [];
   // 2
   let queryString = `
   SELECT properties.*, avg(property_reviews.rating) as average_rating
   FROM properties
   JOIN property_reviews ON properties.id = property_id
   `;

   // 3
   if (options.city) {
     queryParams.push(`%${options.city}%`);
     queryString += `WHERE city LIKE $${queryParams.length} `;
   }

   if (options.minimum_price_per_night && options.maximum_price_per_night) {
     queryParams.push(options.minimum_price_per_night);
     queryParams.push(options.maximum_price_per_night);
     if (options.city) {
      queryString += `AND (cost_per_night BETWEEN $${queryParams.length - 1} AND $${queryParams.length})`;
     } else {
      queryString += `WHERE (cost_per_night BETWEEN $${queryParams.length - 1} AND $${queryParams.length})`;
     }
   } else if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night);
    if (options.city) {
      queryString += `AND (cost_per_night >= $${queryParams.length})`;
     } else {
      queryString += `WHERE (cost_per_night >= $${queryParams.length})`;
     }
   } else if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night);
    if (options.city) {
      queryString += `AND (cost_per_night <= $${queryParams.length})`;
     } else {
      queryString += `WHERE (cost_per_night <= $${queryParams.length})`;
     }
   }

   if (options.minimum_rating) {
     queryParams.push(options.minimum_rating);
     queryString += `GROUP BY properties.id HAVING avg(property_reviews.rating) >= $${queryParams.length}`
   } else {
     queryString += `GROUP BY properties.id`;
    }
 
   // 4
   queryParams.push(limit);
   queryString += `
   ORDER BY cost_per_night
   LIMIT $${queryParams.length};
   `;
 
   // 5
   console.log(options);
   console.log(queryString, queryParams);
 
   // 6
   return pool.query(queryString, queryParams)
    .then((res) => {
      return res.rows
    })
    .catch((err) => {
    console.log(err.message);
  });

  // const limitedProperties = {};
  // for (let i = 1; i <= limit; i++) {
  //   limitedProperties[i] = properties[i];
  // }
  // return Promise.resolve(limitedProperties);
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  console.log(property);
  return pool
  .query(`INSERT INTO properties (title, description, number_of_bedrooms, number_of_bathrooms, parking_spaces, cost_per_night, thumbnail_photo_url, cover_photo_url, street, country, city, province, post_code, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`, [property.title, property.description, property.number_of_bedrooms, property.number_of_bathrooms, property.parking_spaces, property.cost_per_night, property.thumbnail_photo_url, property.cover_photo_url, property.street, property.country, property.city, property.province, property.post_code, property.owner_id])
  .then((result) => {
    console.log(result.rows);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
  // const propertyId = Object.keys(properties).length + 1;
  // property.id = propertyId;
  // properties[propertyId] = property;
  // return Promise.resolve(property);
}
exports.addProperty = addProperty;
