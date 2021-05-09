'use strict';

const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {

	/**
   * Find Random Restaurant
   *
   * @return {Object}
   */
	findRandom : async ctx => {

		const entries = await strapi.services.restaurant.find();

		const randomEntry = entries[Math.floor(Math.random() * entries.length)];

		return sanitizeEntity(randomEntry, { model: strapi.models.restaurant })
	},

	/**
   * Find Random Restaurant
   *
   * @return {Object}
   */
	 findNearby : async ctx => {

		const coordinates = await strapi.services.restaurant.getCoordinatesByAddress( ctx.params.address );

		const radius = ctx.params.radius ? parseInt( ctx.params.radius ) : 20;

		strapi.log.debug("findNearby", ctx.params.radius);

		const restaurants = await strapi.services.restaurant.getRestaurantsByLocation( coordinates, radius );

		const sanitizedRestaurants = restaurants.map(restaurantEntry => sanitizeEntity(restaurantEntry, { model: strapi.models.restaurant }))

		return {
			info: 'Restaurants by location',
			yourLocation: coordinates,
			sanitizedRestaurants
		};
	}
};
