'use strict';

const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class ControlOutlet extends ZigBeeDevice {
	onMeshInit() {

		// Register onoff capability
		this.registerCapability('onoff', 'genOnOff');
	}
}

module.exports = ControlOutlet;
