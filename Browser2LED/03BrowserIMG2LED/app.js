// 06: Browser --> Arduino: Control RGB LED via Web

// Benötigte Module laden
var express = require('express');
var app = express();
var http = require('http').Server(app);

// externe Dateien einbinden, zB css, Bilder (im public folder)
app.use(express.static(__dirname + '/public'));

// bei localhost:3000 erscheint index.html
app.get('/', function(req, res){
  res.sendfile('./public/html/xycolor.html');
});
http.listen(3000, function(){
  console.log('listening on Port 3000');
});

// Receive Data from Browser via Socket.io and send it to Arduino via Serial Communication
var socketio = require('socket.io')(http);
var serialportpackage = require("serialport");
var SerialPort = serialportpackage.SerialPort;
var portname = "/dev/tty.usbmodemfa141";
var serialport = new SerialPort(portname,
{ baudrate: 9600, parser: serialportpackage.parsers.readline("\n"), dataBits: 8, parity: 'none', stopbits: 1, flowControl: false });
serialport.open(function(){
	console.log('Serial Port open on port ' + portname);
});

socketio.on('connection', function(socket)
{
  socket.on('farbe_ClientToServer', function(data_Browser2Arduino)
  {
    console.log('message: ' + data_Browser2Arduino);
	//send to Arduino
	serialport.write(data_Browser2Arduino);
  });
});

