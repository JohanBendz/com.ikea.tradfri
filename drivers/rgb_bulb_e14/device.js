'use strict';

const ZigBeeXYLightDevice = require('homey-meshdriver').ZigBeeXYLightDevice;

class RgbBulb extends ZigBeeXYLightDevice {
	get energyMap() {
		return {
			'TRADFRI bulb E14 CWS opal 600lm': {
				approximation: {
					usageOff: 0.5,
					usageOn: 8.6
				}
			}
		}
	}
}

module.exports = RgbBulb;
