SELECT properties.id, title, cost_per_night, AVG(rating) as average_rating
FROM properties
JOIN property_reviews ON property_reviews.property_id = properties.id
GROUP BY properties.id
HAVING AVG(rating) >= 4 AND city LIKE '%ancouv%'
ORDER BY cost_per_night
LIMIT(10);