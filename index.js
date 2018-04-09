const net = require('net');
const EventEmitter = require('events');
/**
 * 
 * 
 * @class ETCarsClient
 * @extends {EventEmitter}
 */
class ETCarsClient extends EventEmitter {
    /**
     * Creates an instance of ETCarsClient.
     * @memberof ETCarsClient
     */
    constructor() {

        super();

        this.buffer = '';
        this.packetCount = 0;
    }

    /**
     * 
     * Denotes if internal socket is in state CONNECTED
     * @readonly
     * @memberof ETCarsClient
     */
    get isConnected() {

    }

    /**
     * 
     * Denotes if internal socket is in state CONNECTING
     * @readonly
     * @memberof ETCarsClient
     */
    get isConnecting() {
        return (this.etcarsSocket ? etcarsSocket.connecting : false);
    }

    /**
     * 
     * Connect or try to connect to ETCars. If not running, poll until ETCars socket will be opened.
     * @memberof ETCarsClient
     */
    connect() {
        console.log('trying to connect');

        var instance = this;

        try {
            this.etcarsSocket = net.createConnection(30001, 'localhost', function () {});

            this.etcarsSocket.on('connect', () => {
                instance.receiveConnect()
            });
            this.etcarsSocket.on('disconnect', () => {
                instance.receiveDisconnect()
            });
            this.etcarsSocket.on('close', () => {
                instance.receiveClose()
            });
            this.etcarsSocket.on('error', (e) => {
                instance.receiveError(e.code)
            });
            this.etcarsSocket.on('data', (msg) => {
                instance.receiveData(msg)
            });
        } catch (err) {
            console.log(err);
        }
    }


    /**
     * 
     * @private
     * @memberof ETCarsClient
     */
    receiveClose() {
        console.log('socket closed');

        setTimeout(() => this.connect(), 1000);
    }

    /**
     * 
     * @private
     * @memberof ETCarsClient
     */
    receiveDisconnect() {
        console.log('socket disconnected');
        this.startChecker();
        this.receiveError('DISCONNECTED');
    }

    /**
     * 
     * @private
     * @memberof ETCarsClient
     */
    receiveConnect() {

        console.log('connected');
        clearInterval(this.checker);

        this.emit('connect', {
            error: false,
            socketConnected: true,
            errorMessage: ''
        });
    }

    /**
     * 
     * @private
     * @param {any} errorCode 
     * @memberof ETCarsClient
     */
    receiveError(errorCode) {

        var instance = this;
        var socketErrorCode = '';
        var tryReconnect = false;

        if (errorCode && typeof (errorCode) != 'undefined' && errorCode != null) {
            if (errorCode == 'ECONNREFUSED')
                console.log('etcars not installed or game not running');
            else if (errorCode == 'ECONNRESET')
                console.log('etcars closed connection or game closed');
            else
                console.error(errorCode);
        }

        this.etcarsSocket.destroy();

        this.emit('error', {
            error: true,
            socketConnected: false,
            errorMessage: 'ETCars is not running',
            socketError: errorCode
        });
    }

    /**
     * 
     * @private
     * @param {any} data 
     * @memberof ETCarsClient
     */
    receiveData(data) {
        var dataRaw = data.toString();
        try {
            var jsonRaw = dataRaw.substring(dataRaw.indexOf("{"),dataRaw.lastIndexOf("\r"));
            var json = JSON.parse(jsonRaw);
            this.emit('data', json.data);
        } catch (error) {
            console.log(error.message);
        }
    }
}

module.exports = ETCarsClient;
