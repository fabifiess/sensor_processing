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

// Put the application on port 3000
var port = 3000;
http.listen(port, function () {
    console.log('listening on port ' + port);
});

// Receive Data from Browser via Socket.io and send it to Arduino via Serial Communication
var serialportpackage = require("serialport");
var SerialPort = serialportpackage.SerialPort;
var portname = "/dev/tty.usbmodemfa141";
var serialport = new SerialPort(portname,
    {
        baudrate: 9600,
        parser: serialportpackage.parsers.readline("\n"),
        dataBits: 8,
        parity: 'none',
        stopbits: 1,
        flowControl: false
    });
serialport.open(function () {
    console.log('Serial Port open on port ' + portname);
});

io.on('connection', function (socket) {
    socket.on('farbe_ClientToServer', function (data_Browser2Arduino) {
        console.log('Color: ' + data_Browser2Arduino);
        //send to Arduino
        serialport.write(data_Browser2Arduino);
    });
});

