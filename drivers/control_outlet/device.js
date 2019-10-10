'use strict';

const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

/**
 * TODO: what happens if the device gets switched externally, does it send a report to Homey?
 */
class ControlOutlet extends ZigBeeDevice {
	onMeshInit() {

		// Register onoff capability
		this.registerCapability('onoff', 'genOnOff');
	}
}

module.exports = ControlOutlet;
