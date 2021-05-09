'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
	lifecycles: {
    async beforeUpdate(params, data) {

			// data.Address = 'Blablabla'
			// strapi.log.debug('before Update');
			data.latitude = 7.234234;
			
			const fullAddress = `${data.Address ? data.Address : ''} ${data.ZIP ? data.ZIP : ''} ${data.City ? data.City : ''}`;

			const coordinates = await strapi.services.restaurant.getCoordinatesByAddress( fullAddress );

			strapi.log.debug('coordinates', coordinates);

			if( coordinates ) {
				data.latitude = coordinates.lat;
				data.longitude = coordinates.lon;
			}
    },
  },
};
