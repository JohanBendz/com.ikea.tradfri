'use strict';

const Homey = require('homey');
const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

const maxValue = 255;

class RemoteRotatingDimmer extends ZigBeeDevice {

	onMeshInit() {
		this.moving = false;
		this.movingSince = null;
		this.moveDirection = null;
		this.rate = null;
		this.value = 255;

		// Register report listeners
		this.registerReportListener('genLevelCtrl', 'move', this.moveCommandParser.bind(this));
		this.registerReportListener('genLevelCtrl', 'moveWithOnOff', this.moveCommandParser.bind(this));
		this.registerReportListener('genLevelCtrl', 'stop', this.stopCommandParser.bind(this));
		this.registerReportListener('genLevelCtrl', 'stopWithOnOff', this.stopCommandParser.bind(this));
		this.registerReportListener('genLevelCtrl', 'moveToLevelWithOnOff', payload => {
			this.value = payload.level;
		});

		// Register dimmer_rotated Flow Card Device Trigger
		this.dimmerRotatedTriggerDevice = new Homey.FlowCardTriggerDevice('dimmer_rotated');
		this.dimmerRotatedTriggerDevice.register();

		// Create throttled function for trigger Flow
		this.triggerDimmerRotatedFlow = this.throttle(() => {
			const parsedValue = Math.round(this.value / maxValue * 100) / 100;
			return this.dimmerRotatedTriggerDevice.trigger(this, { value: parsedValue }, null)
				.then(() => {
					this.log(`trigger value ${parsedValue}`);
				})
				.catch(err => this.error('Error triggering dimmer_rotated', err));
		}, 100);

		// Register dimmer_rotate_stopped Flow Card Device Trigger
		this.dimmerRotateStoppedTriggerDevice = new Homey.FlowCardTriggerDevice('dimmer_rotate_stopped');
		this.dimmerRotateStoppedTriggerDevice.register();

		// Create debounced function for trigger Flow
		this.triggerDimmerRotateStoppedFlow = this.debounce(() => {
			const parsedValue = Math.round(this.value / maxValue * 100) / 100;
			return this.dimmerRotateStoppedTriggerDevice.trigger(this, { value: parsedValue }, null)
				.then(() => {
					this.log(`stopped trigger value ${parsedValue}`);
				})
				.catch(err => this.error('Error triggering dimmer_rotate_stopped', err));
		}, 1000);
	}

	/**
	 * Method that parsed an incoming move report
	 * @param payload
	 * @returns {*}
	 */
	moveCommandParser(payload) {
		this.moving = true;
		this.movingSince = Date.now();
		this.moveDirection = payload.movemode === 0 ? 1 : -1;
		this.rate = payload.rate;
		this.triggerDimmerRotatedFlow();
		this.triggerDimmerRotateStoppedFlow();
	}

	/**
	 * Method that parsed an incoming stop report
	 * @returns {*}
	 */
	stopCommandParser() {
		if (this.moving === true || Date.now() - this.movingSince < 3000) {
			const sensitivity = this.getSetting('sensitivity');

			let delta = 0;
			if (typeof sensitivity === 'number' && !isNaN(sensitivity) && sensitivity > 0.1) {
				delta = (Date.now() - this.movingSince) / 1000 * this.rate * sensitivity;
			} else {
				delta = (Date.now() - this.movingSince) / 1000 * this.rate;
			}

			this.value = this.value + delta * this.moveDirection;

			if (this.value > maxValue) this.value = maxValue;
			if (this.value < 0) this.value = 0;

			this.moving = false;
			this.movingSince = null;
		}
		this.triggerDimmerRotatedFlow();
		this.triggerDimmerRotateStoppedFlow();
	}

	/**
	 * Plain JS implementation of Underscore's _.debounce.
	 * @param func
	 * @param wait
	 * @param immediate
	 * @returns {Function}
	 */
	debounce(func, wait, immediate) {
		let timeout;
		return function () {
			const context = this;
			const args = arguments;
			const later = function () {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			const callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}

	/**
	 * Plain JS implementation of Underscore's _.throttle.
	 * @param func
	 * @param wait
	 * @returns {Function}
	 */
	throttle(fn, wait) {
		let time = Date.now();
		return function () {
			if ((time + wait - Date.now()) < 0) {
				fn();
				time = Date.now();
			}
		};
	}

}

module.exports = RemoteRotatingDimmer;
