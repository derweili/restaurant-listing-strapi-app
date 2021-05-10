'use strict';

const fetch = require('cross-fetch');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
	async getCoordinatesByAddress( address ) {
		strapi.log.debug("getCoordinatesByAddress", address);
		const geocoding_url = `https://nominatim.openstreetmap.org/search.php?q=${ encodeURIComponent( address ) }&polygon_geojson=1&format=jsonv2`;
		strapi.log.debug("geocoding_url", geocoding_url);
		
		const responseJson = await fetch( geocoding_url );
		
		if (responseJson.status >= 400) {
			strapi.log.error("Bad response from server");
			return;
		}

		const locations = await responseJson.json();
		
		if( locations.length && locations.length > 0 ) {

			const lat = locations[0].lat;
			const lon = locations[0].lon;

			strapi.log.debug(lat)
			strapi.log.debug(lon)

			const coordinates = {
				lat: parseFloat( lat ),
				lon: parseFloat( lon )
			}

			return coordinates;
			
		}
	},

	/**
	 * 
	 * @param {object} coordinates | coordinates object from getCoordinatesByAddress
	 * @param {number} radius | Radius im km
	 * @returns 
	 */
	async getRestaurantsByLocation( coordinates, radius = 10 ) {
		strapi.log.debug("getRestaurantsByLocation", radius);
		const X1 = + coordinates.lat - radius,
      Y1 = + coordinates.lon - radius,
      X2 = + coordinates.lat + radius,
      Y2 = + coordinates.lon + radius;

		const distanceInKmSql = `( 6371 * acos( cos( radians(${+coordinates.lat}) ) 
			* cos( radians( restaurants.latitude ) ) 
			* cos( radians( restaurants.longitude ) - radians(${+coordinates.lon}) ) 
			+ sin( radians(${+coordinates.lat}) ) 
			* sin( radians( restaurants.latitude ) ) ) ) AS distance 
			`;

		const knex = strapi.connections.default;
		const result = await knex('restaurants')
			.whereBetween('latitude', [X1, X2])
			.whereBetween('longitude', [Y1, Y2])
			.column(['*', knex.raw(distanceInKmSql)])
			.having('distance', '<', radius);


		const restaurants = await Promise.all(result.map(async (r) => {
			const restaurantData =  await strapi.query('restaurant').findOne({ id: r.id });

			return {
				...restaurantData,
				distance: r.distance
			}
		}));

		return restaurants;
	}
};
