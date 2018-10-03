'use strict';

const ZigBeeLightDevice = require('homey-meshdriver').ZigBeeLightDevice;

class ControlOutlet extends ZigBeeDevice {
	onMeshInit() {

		// Register onoff capability
		this.registerCapability('onoff', 'genOnOff');
	}
}

module.exports = ControlOutlet;
