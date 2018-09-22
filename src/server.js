const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const auth = require('./app/auth.js');
const routes = require('./app/routes.js');
const mongo = require('mongodb').MongoClient;
const cookieParser = require('cookie-parser');
const app = express();
const http = require('http').Server(app);
const sessionStore = new session.MemoryStore();
const io = require('socket.io')(app);
const passportSocketIo = require('passport.socketio');
require('dotenv').config();

app.use('public',express.static(process.cwd()+'/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:true,
    saveUninitialized:true,
    key:'express.sid',
    store:sessionStore
}));
app.set('view engine','pug');
let currentUsers = 0;

