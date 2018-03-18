# ETCars Node.js client

This simple package supply basic integration for a node.js application to connect and receive data from [ETCars](https://etcars.menzelstudios.com/) .

Implements EventEmitter.

No dependencies.

## Usage

```javascript
var ETCarsConnection = require('etcars-node-client');

var etcars = new ETCarsConnection();

etcars.on('data', function(data) {
    console.log('data received');
});

etcars.on('connect', function(data) {
    console.log('connected');
});

etcars.on('error', function(data) {
    console.log('etcars error');
});

```

## Events

You can subscribe this events wia `on` method:

* `connect` : fired when connected to ETCars socket
* `data` : fired when receive data from ETCars
* `error` : fired on error and on disconnection