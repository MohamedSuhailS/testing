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

app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/adminauth'));
app.use('/admin/admin', require('./routes/adminauth'));

app.get('/', function(req, res, next) { 
  var cart = '0';
   db.query('SELECT Id,price__c,Name,image__c FROM nodejs__c',function(err,rows){
     if(err) {
         req.flash('error', err);
         res.render('producthome.ejs',{data:''});   
     } else {
       if(err) {
         req.flash('error', err);
         res.render('producthome.ejs',{data:''});   
     } else{
       var nam =req.session.name;
       var named = req.session.Namef;
       var pas = req.session.pass;
       if(nam == null){
         cart = '0';
         var named=' ';
         res.render('producthome.ejs',{data:rows,title:cart,user:named});
        }
        else{
         db.sobject("juicecart__c")
         .find({  
           'usernode__c' : req.session.Id
         },
           'Id, Name'
         )
         .execute(function(err, records) {
           if (err) { return console.error(err); }
           console.log("record length = " + records.length);
           for (var i=0; i<records.length; i++) {
             var record = records[i];
             console.log("Name: " + record.Name);
          cart = records;
         }
           res.render('producthome.ejs',{data:rows,title:records.length,user:named});
         });
       }
       }
     }
 });
 });
app.listen(3000, () => {
  console.log('Server has been started on 3000...');
});
