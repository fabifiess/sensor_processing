var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// include external data, eg. css, images (public folder)
app.use(express.static(__dirname + '/public'));

// By typing localhost:3000 the browser will load index.html
app.get('/', function (req, res) {
    res.redirect('/html/index.html'); // alternative: res.sendfile('./public/html/index.html');
});

app.get('/serial', function (req, res) {
    res.redirect('/html/serialport.html'); // alternative: res.sendfile('./public/html/index.html');
});


// Put the application on port 3000
var port = 3000;
http.listen(port, function () {
    console.log('listening on port ' + port);
    console.log('Open browser on http://localhost:' + port + '/serial to choose the serial port');
});

// Receive Data from Browser via Socket.io and send it to Arduino via Serial Communication
var serialPort = require("serialport");
var SerialPort = serialPort.SerialPort;
var serialPortList = [];
var serialport;

// list all available serial ports
serialPort.list(function (err, ports) {
    ports.forEach(function (port) {
        serialPortList.push(port.comName);
    });
});

function connectToSerialPort(sPort) {


}

var currentColor = "000000";

io.on('connection', function (socket) {

    // Serial Port Settings
    socket.emit("serialport", serialPortList);
    socket.on('serialport', function (sPort) {
        serialport = new SerialPort(sPort,
            {
                baudrate: 9600,
                parser: serialPort.parsers.readline("\n"),
                dataBits: 8,
                parity: 'none',
                stopbits: 1,
                flowControl: false
            });
        serialport.open(function (error) {
            if (!error) {
                console.log('Serial connection open on port ' + sPort);
                console.log('Now open browser on http://localhost:' + port);
                socket.emit("sPortConnected", true);
            }
            else if (error) {
                console.log('Could not connect to ' + sPort);
                socket.emit("sPortConnected", false);
            }
        });
    });

    // Light Control
    socket.emit('updateCurrentColor', currentColor);
    socket.on('farbe_ClientToServer', function (data) {
        currentColor = data;
        //console.log('Color: ' + currentColor);
        serialport.write(currentColor); //send to Arduino
        io.emit('updateCurrentColor', currentColor);
    });
});