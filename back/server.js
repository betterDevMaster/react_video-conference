require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const easyrtc = require('open-easyrtc');
const fs = require('fs');
const Handlebars = require('handlebars');
const io = require('socket.io');
const RTCMultiConnectionServer = require('rtcmulticonnection-server');

const app = express()
const emailController = require('./email/email.controller')
const { PORT, CLIENT_ORIGIN, DB_URL } = require('./config')

var webServer = null;
// Only allow requests from our client
const corsOpts = {
  origin: '*',
  methods: [
    'GET',
    'POST',
  ],
  allowedHeaders: [
    'Content-Type',
  ],
};
// NODE_TLS_REJECT_UNAUTHORIZED='0'

app.use(cors(corsOpts));
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
// app.use(cors())

var debugMode = false;
// Set up routes for static resources
app.use('/', express.static(__dirname + '/public'));
app.use('/room', express.static(__dirname + '/public'));
app.use('/login', express.static(__dirname + '/public'));
app.use('/conference', express.static(__dirname + '/public'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/static', express.static(__dirname + '/public/static'));
app.use('/static/css', express.static(__dirname + '/public/static/css'));
app.use('/static/js', express.static(__dirname + '/public/static/js'));
app.use('/static/media', express.static(__dirname + '/public/static/media'));
// Allow the app to accept JSON on req.body
app.use(express.json())

// This is the endpoint that is hit from the onSubmit handler in Landing.js
// The callback is shelled off to a controller file to keep this file light.
app.post('/email', emailController.collectEmail)

// Catch all to handle all other requests that come into the app.
app.use('*', (req, res) => {
  res.status(404).json({ msg: 'Not Found' })
})

// Connecting the database and then starting the app.
// mongoose.connect(DB_URL, {
// 	// useUnifiedTopology: true,
// 	useCreateIndex: true,
// 	useNewUrlParser: true,
// 	useFindAndModify: false
// });

// mongoose.connect(DB_URL).then(() => {
// console.log("Connected to Database");
// }).catch((err) => {
//     console.log("Not Connected to Database ERROR! ", err);
// });
// The most likely reason connecting the database would error out is because
// Mongo has not been started in a separate terminal.

// By default the listening server port is 8080 unless set by nconf or Heroku

var serverPort = 3111; // testing for the localhost
// var serverPort = 3000;  // for the product port

webServer = require('http').createServer(app).listen(serverPort);
console.log("Http server is running on Port: " + serverPort)

var socketServer = io.listen(webServer, { 'log level': 0 });

// Set up easyrtc specific options
easyrtc.setOption('demosEnable', false);

// Use appIceServers from settings.json if provided. The format should be the same
// as that used by easyrtc (http://easyrtc.com/docs/guides/easyrtc_server_configuration.php)
easyrtc.setOption('appIceServers', [
    {
        url: 'stun:stun.l.google.com:19302'
    },
    {
        url: 'stun:stun.sipgate.net'
    },
    {
        url: 'stun:217.10.68.152'
    },
    {
        url: 'stun:stun.sipgate.net:10000'
    },
    {
        url: 'stun:217.10.68.152:10000'
    }
]);
easyrtc.listen(app, socketServer);

var peerPositions = []
var peerStreams = []

const calcualteMyPosition = (peerId, width, height, socketId)=>{
  if(peerPositions.length === 0){
    const retPos = {x:width/2, y:height/2, peerId, socketId}
    peerPositions.push(retPos);
    return retPos;
  }
  const center = {x:0, y:0};

  center.x = peerPositions[peerPositions.length-1].x
  center.y = peerPositions[peerPositions.length-1].y

  const ang = Math.random() * 2 * Math.PI
  var posX = Math.floor(center.x + Math.cos(ang)* 100)
  var posY = Math.floor(center.y + Math.sin(ang)* 100)

  if (posX >= width - 100)
    posX = width - 100
  else if (posX <= 100)
    posX = 100
  if (posY >= height - 100)
    posY = height - 100
  else if (posY <= 100)
    posY = 100

  const retPos = {
                  x: posX,
                  y: posY,
                  peerId,
                  socketId
                }
  peerPositions.push(retPos)

  // console.log('position: before: ', peerPositions, peerPositions.length, peerPositions[peerPositions.length-1], '-------------------')

  peerPositions = peerPositions.filter((c, index) => {
    return peerPositions.indexOf(c) === index;
  });
  
  return retPos;
}

easyrtc.events.on("easyrtcMsg", function(connectionObj, message, callback, next) {
  switch(message.msgType){
    case 'get_my_position':
      const pos = calcualteMyPosition(message.msgData.clientId, message.msgData.sWidth, message.msgData.sHeight, connectionObj.socket.id);
      callback({msgType:'set_your_position', msgData: pos})
      return true;
    case 'get_peer_position':
      peerPositions.forEach(pos=>{
        if(pos.peerId === message.msgData){
          callback({msgType:'set_peer_position', msgData: pos})
        }
      })
      peerPositions = peerPositions.filter((c, peerId) => {
        return peerPositions.indexOf(c) === peerId;
      });
      return true;
    case 'set_peer_position':
      peerPositions.forEach(pos=>{

        if(pos.peerId === message.msgData.id){
          pos.x = message.msgData.position.x;
          pos.y = message.msgData.position.y;
        }
      })
      peerPositions = peerPositions.filter((c, peerId) => {
        return peerPositions.indexOf(c) === peerId;
      });
      return true;
    case 'set_peer_stream':
      console.log('set_peer_stream : ', message.msgData)
      peerStreams.push(message.msgData)
      return true
  }

  connectionObj.events.emitDefault("easyrtcMsg", connectionObj, message, callback, next);
});
easyrtc.events.on("roomLeave", function(connectionObj, roomName, callback){
  peerPositions = peerPositions.filter((peer)=>peer.socketId !== connectionObj.socket.id)
  connectionObj.events.emitDefault("roomLeave", connectionObj, roomName, callback);
});


// var RTC_PORT = 3222
// var httpApp;

// httpApp = require('http').createServer(app).listen(process.env.PORT || RTC_PORT, process.env.IP || "0.0.0.0");
// console.log("Http server is running on Port: " + RTC_PORT)

// io(httpApp).on('connection', function(socket) {
//   RTCMultiConnectionServer.addSocket(socket);

//   // ----------------------
//   // below code is optional

//   const params = socket.handshake.query;
//   console.log('-----------------socket server : ', params)

//   if (!params.socketCustomEvent) {
//       params.socketCustomEvent = 'custom-message';
//   }

//   socket.on(params.socketCustomEvent, function(message) {
//       socket.broadcast.emit(params.socketCustomEvent, message);
//   });
// });