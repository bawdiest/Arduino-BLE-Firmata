/**
 * Copyright 2013,2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
	"use strict";
	//var BLE = require('noble');

	// The Board Definition - this opens (and closes) the connection
	function ArduinoNode(n) {
		RED.nodes.createNode(this,n);
		var BleUart = require('./ble-uart.js');

		var node = this;

		// use a predefined UART service (nordic, redbear, laird, bluegiga)
		// var bleSerial = new BleUart('nordic');

		// optionally define a custom service
		var uart = {
			serviceUUID : '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
			txUUID : '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
			rxUUID : '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
		}
		node.board = new BleUart('UART', uart);

		// this function gets called when the program
		// establishes a connection with the remote BLE radio:

		// thus function gets called if the radio successfully starts scanning:
		//bleSerial.on('scanning', function(status){
		//  console.log("radio status: " + status);
		//})		
		node.board.on('connected', function(data) {
			console.log("connected");
		});
		
		node.board.on('disconnected', function(data) {
			node.board.connect();
			});

		node.on('close', function(done) {
			node.board.disconnect();
		});

	};

	RED.nodes.registerType("arduino-board", ArduinoNode);

	// The Input Node
	function DuinoNodeIn(n) {
		RED.nodes.createNode(this, n);
		this.buttonState = -1;
		this.pin = n.pin;
		this.state = n.state;
		this.arduino = n.arduino;
		this.serverConfig = RED.nodes.getNode(this.arduino);

		if ( typeof this.serverConfig === "object") {
			this.board = this.serverConfig.board;
			var node = this;

			node.status({
				fill : "red",
				shape : "ring",
				text : "node-red:common.status.connecting"
			});
			node.board.on('connected', function(data) {
				node.status({
					fill : "green",
					shape : "dot",
					text : "node-red:common.status.connected"
				});
			});
			node.board.on('disconnected', function(data) {
				node.status({
					fill : "red",
					shape : "ring",
					text : "node-red:common.status.connecting"
				});
			});

			// this function gets called when new data is received from
			// the Bluetooth LE serial service:
			node.board.on('data', function(data) {
				var msg = {payload:data.toString()};
				node.send(msg);
			});

		}
	}


	RED.nodes.registerType("arduino in", DuinoNodeIn);

	// The Output Node
	function DuinoNodeOut(n) {
		RED.nodes.createNode(this, n);
		this.buttonState = -1;
		this.pin = n.pin;
		this.state = n.state;
		this.arduino = n.arduino;
		this.serverConfig = RED.nodes.getNode(this.arduino);

		if ( typeof this.serverConfig === "object") {
			this.board = this.serverConfig.board;
			var node = this;

			node.status({
				fill : "red",
				shape : "ring",
				text : "node-red:common.status.connecting"
			});
			node.board.on('connected', function(data) {
				node.status({
					fill : "green",
					shape : "dot",
					text : "node-red:common.status.connected"
				});
			});

			node.on("input", function(msg) {

				node.board.write(msg.payload);

			})
		}
	}


	RED.nodes.registerType("arduino out", DuinoNodeOut);

}
