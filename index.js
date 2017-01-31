'use strict';

const WebSocketClient = require('websocket').client;
const HackTool = require('./hacktool');
var client = new WebSocketClient();

client.on('connectFailed', (error) => {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', (connection) => {
    console.log('Connected. Start hacking system!');

    new HackTool(connection);
});

client.connect('ws://nuclear.t.javascript.ninja');