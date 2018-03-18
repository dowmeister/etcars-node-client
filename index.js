const net = require('net');
const EventEmitter = require('events');

class ETCarsConnection extends EventEmitter {
    constructor(clientSocket) {

        super();
        
        this.startChecker();
    }

    startChecker() {
        console.log('starting checker timer');
        this.checker = setInterval(this.connect, 1000, this);
    }

    connect(instance) {
        console.log('trying to connect');
        try {
            instance.etcarsSocket = net.createConnection(30001, 'localhost', function () {
                instance.receiveConnect();
            });

            instance.etcarsSocket.on('disconnect', () => { instance.receiveError() });
            instance.etcarsSocket.on('error', (e) => { instance.receiveError(e) });
            instance.etcarsSocket.on('data', (msg) => { instance.receiveData(msg) });
        } catch (err) {
            console.log(err);
        }
    }

    receiveConnect() {
        console.log('connected');
        clearInterval(this.checker);
        this.emit('connect', {
            error: false,
            socketConnected: true,
            errorMessage: ''
        });
    }

    receiveError(e) {
        console.log('socket disconnected');
        this.emit('error', {
            error: true,
            socketConnected: false,
            errorMessage: 'ETCars is not running '
        });
    }

    receiveData(data) {
        console.log('---------------- DATA REC ----------------')
        var str = data.toString();
        var begin = str.indexOf('{');
        var toParse = str.substr(begin, str.length - 1);

        try {
            var json = JSON.parse(toParse);
            this.emit('data', json);
        } catch (err) {
            console.log('JSON is not parsable');
        }
    }
}

module.exports = ETCarsConnection;