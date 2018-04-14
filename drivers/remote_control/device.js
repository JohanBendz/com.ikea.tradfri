
const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class RemoteControl extends ZigBeeDevice {

    onMeshInit() {
        
        	// enable debugging
        	// this.enableDebug();

          // print the node's info to the console
          // this.printNode();   
    }
}

module.exports = RemoteControl;
