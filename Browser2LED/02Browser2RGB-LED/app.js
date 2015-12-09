var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");

// include external data, eg. css, images (public folder)
app.use(express.static(__dirname + '/public'));

// By typing localhost:3000 the browser will load index.html
app.get('/', function (req, res) {
    res.redirect('/html/index.html'); // alternative: res.sendfile('./public/html/index.html');
});

app.get('/serial', function (req, res) {
    res.redirect('/html/serialport.html');
});

app.get('/t', function (req, res) {
    res.redirect('/html/touch2.html');
});

// Communication with Arduino via Serial Communication
var serialPort = require("serialport");
var SerialPort = serialPort.SerialPort;
var serialPortList = [];
var serialport;

// Read settings from Json
var saved_tcpPort;
var saved_serialPort;
var jsonData;
fs.readFile('./public/json/settings.json', function (err, data) {
    if (err) {
        console.log("Could not read from settings.json");
    }
    jsonData = JSON.parse(data);
    saved_tcpPort = jsonData.tcpPort;
    saved_serialPort = jsonData.serialPort;
    console.log('saved_serialPort: ' + saved_serialPort);

    // Put the application on port 3000
    http.listen(saved_tcpPort, function () {
        console.log('listening on port ' + saved_tcpPort);
    });


    // list all available serial ports
    serialPort.list(function (err, ports) {
        ports.forEach(function (port) {
            serialPortList.push(port.comName);
        });


        //check if the pre-saved port is connected
        for (var i = 0; i < serialPortList.length; i++) {
            //console.log('serialPortList[i]: ' + serialPortList[i]);
            if (serialPortList[i] == saved_serialPort) {
                serialport = setupSerialPort(saved_serialPort);
                serialport.open(function (error) {
                    if (!error) {
                        console.log('Serial connection open on port ' + saved_serialPort);
                        console.log('Now open browser on http://localhost:' + saved_tcpPort);
                    }
                    else if (error) {
                        console.log('Could not connect to ' + saved_serialPort);
                    }
                });
                break;
            }
        }

        if (serialPortList[i] != saved_serialPort) {
            console.log('Could not connect to ' + saved_serialPort);
            console.log('Obviously you connect for the first time. Open browser on ' +
                        'http://localhost:' + saved_tcpPort + '/serial to choose the serial port');
        }
    });
});



var currentColor = "000000";

io.on('connection', function (socket) {

    // @todo: why does server break after tablet connected?

    // Serial Port Settings
    socket.emit("serialport", serialPortList);
    socket.on('serialport', function (sPort) {
        serialport = setupSerialPort(sPort);

        serialport.open(function (error) {
            if (!error) {
                console.log('Serial connection open on port ' + sPort);
                console.log('Now open browser on http://localhost:' + saved_tcpPort);
                socket.emit("sPortConnected", true);
            }
            else if (error) {
                console.log('Could not connect to ' + sPort);
                socket.emit("sPortConnected", false);
            }
        });

        // save serial port in json
        jsonData.serialPort=sPort;
        fs.writeFile('./public/json/settings.json', JSON.stringify(jsonData), function (err) {
            if (err) console.log("Could not update serial port in settings.json");
            if (!err) console.log("Successfully updated serial port "+sPort+" in settings.json");
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

    // Test
    socket.on("test", function (data) {
        console.log(data);
    })
});

function setupSerialPort(sPort) {
    var serialport = new SerialPort(sPort,
        {
            baudrate: 9600,
            parser: serialPort.parsers.readline("\n"),
            dataBits: 8,
            parity: 'none',
            stopbits: 1,
            flowControl: false
        });
    return serialport;
}