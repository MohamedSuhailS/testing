const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql');
const app = express();
var flash = require('express-flash');
var bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const session = require('express-session');
var jsforce = require('jsforce');
app.set('view engine', 'hbs');
var path = require('path');
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());
dotenv.config({path: './.env'});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var db = new jsforce.Connection();
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static((__dirname + 'public/css')));
app.use('/image', express.static((__dirname + 'public/image')));
db.login('syedsuhail926.ss@cunning-hawk-bhslhk.com', 'suhail.S123','G2X1LZUqCMY53sLQ5IMvoFybA', function(err, res) {
  if (err) { return console.error(err); }
});
app.use(cookieParser());
app.use(session({ 
    secret: '123456cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000000 }
}))
app.use('/', require('./routes/page'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/adminauth'));
app.use('/admin/admin', require('./routes/adminauth'));
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});