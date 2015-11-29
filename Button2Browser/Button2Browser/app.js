//klapppt
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// include external data, eg. css, images (public folder)
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.redirect('/html/index.html'); // alternative: res.sendfile('./public/html/index.html');
});

http.listen(3000, function () {
    console.log("Listening on port 3000");
});

// Receive Data from Arduino via Serial Port
// and send it to Client via Socket.io

var serialportpackage = require("serialport");
var SerialPort = serialportpackage.SerialPort;
var portname = "/dev/tty.usbmodemfa141";
var sp = new SerialPort(portname, {
    baudrate: 9600,
    parser: serialportpackage.parsers.readline("\n")
});

sp.open(function () {
    sp.on('data', function (arduinoData) {
        io.emit('booleanState', arduinoData);
    });
});