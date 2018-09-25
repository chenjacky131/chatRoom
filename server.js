require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const auth = require('./src/app/auth.js');
const routes = require('./src/app/routes.js');
const mongo = require('mongodb').MongoClient;
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http').createServer(app);
const sessionStore = new session.MemoryStore();
const io = require('socket.io')(http);
const passport = require('passport');
const passportSocketIo = require('passport.socketio');
const cors = require('cors');
app.use(cors());
app.use('/static',express.static(process.cwd()+'/src/public'));
app.set('view engine','pug');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret:'session_secret',
    resave:true,
    saveUninitialized:true,
    store: sessionStore,
    key:'my.sid'//default:connect.sid
}));
app.use(passport.initialize());
app.use(passport.session());
io.use(passportSocketIo.authorize({
    cookieParser:cookieParser, 
    key:'my.sid',
    secret:'session_secret',
    store:sessionStore,
    success:function(data,accept){
        accept(null,true);
    },
    fail:function(data,message,error,accept){
        if(error){
            accept(new Error(message));
        }
        accept(null,false);
    }
}));
let currentUsers = 0;

mongo.connect(process.env.DATABASE,{useNewUrlParser:true},(err,client)=>{
    // console.log('Databse connect success');
    if(err){console.log('Database error:'+err)}
    auth(app,client.db('mymlab'));
    routes(app,client.db('mymlab'));
    io.on('connection',clientSocket=>{
        // console.log('user '+clientSocket.request.user.username +' connected');
        ++currentUsers;
        clientSocket.emit('user count',currentUsers);
        clientSocket.emit('user',{name:clientSocket.request.user.username,currentUsers,connected:true});
        clientSocket.on('disconnect',()=>{
            --currentUsers;
            io.emit('user count',currentUsers);
            io.emit('user',{name:clientSocket.request.user.username,currentUsers,connected:false});
            console.log('user '+clientSocket.request.user.username+' has disconnected');
        });
        clientSocket.on('chat message',(msg)=>{
            io.emit('chat message',{name:clientSocket.request.user.username,message:msg});
        });
        clientSocket.on('userInOut',(msg)=>{
            io.emit('userInout',msg);
        });
    });
    http.listen(3000, () => {
        console.log("Listening on port " + 3000);
    });
});
