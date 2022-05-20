const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql');
const app = express();
const alert = require('alert'); 
const bcrypt = require('bcryptjs');
var jsforce = require('jsforce');
app.use(express.urlencoded({ extended: true }));
const cookieParser = require("cookie-parser");
const session = require('express-session');
var db = new jsforce.Connection();
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
db.login('syedsuhail926.ss@cunning-hawk-bhslhk.com', 'suhail.S123','G2X1LZUqCMY53sLQ5IMvoFybA', function(err, res) {
  if (err) { return console.error(err); }
});
db.login('syedsuhail926.ss@cunning-hawk-bhslhk.com','suhail.S123'+'G2X1LZUqCMY53sLQ5IMvoFybA', (err, userInfo)=>{
  if(err){
      console.error(err)
  }else{
      console.log("User Id:"+ userInfo.id)
      console.log("Org Id:"+ userInfo.organizationId)
  }
})
exports.register = (req, res) => {
  console.log(req.body);
  
  console.log(req.session.name);
  const {name, email, password, passwordConfirm} = req.body;
  
  db.query('SELECT fullname__c FROM usernode__c where fullname__c Like \'%' + email + '%\' ', async (error, results) => {
    if(error) {
      console.log(error);
    }

    if(results.length > 0) {
      return res.render('register', {
        message: 'That email is already taken'
      });
    }else if(password !== passwordConfirm){
      return res.render('register', {
        message: 'Password do not match'
      });
    }
    let hashedPassword = await bcrypt.hash(password, 8);
    console.log(hashedPassword);
    db.sobject("usernode__c").create({Name: name, fullname__c: email, password__c: hashedPassword}, (error, results) => {
      if(error) {
        console.log(error);
      }else{
        console.log(results);
        res.redirect('/login')
      }
    });
  });
};
exports.login = async (req, res) => {
    try {
    const {email, password} = req.body;
    if(!email || !password) {
      return res.status(400).render('login', {
        message: 'Please provide an email and password'
      });
    }
    db.query('SELECT fullname__c,Name,password__c,Id FROM usernode__c where fullname__c Like \'%' + email + '%\' ', async (error, results) => {
      if(!results || !(await bcrypt.compare(password, results.records[0]['password__c']))){
        res.status(401).render('login', {
          message: 'Email or Password is incorrect'
        });
      }else{
        const id = results.records[0].Id;
        req.session.Id =results.records[0].Id;
        req.session.Namef =results.records[0].Name;
        req.session.name =results.records[0].fullname__c;
        req.session.pass =results.records[0].password__c;
        res.status(200).redirect('/');
        
    console.log(req.session.name);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
exports.view = async (req, res) => {
return res.render('view', {
    message: req.session.name
  });
};
exports.addtocart = async(req,res) => {

  console.log('new');
    const {cartvalue} = req.body;
    if(req.session.Id == null)
    {
      res.redirect('/login');
    }
    else{
    db.query('SELECT Name,Id,image__c,price__c FROM nodejs__c where Name Like \'%' + cartvalue + '%\' ',function(err,rows)     {
        if(err) {
            req.flash('error', err);
            console.log("sry"); 
            req.flash('error', err);
            res.render('/');

        } else {
            db.sobject("juicecart__c").create({ Name : req.session.Id, juicename__c:rows.records[0]['Name'],price__c:rows.records[0]['price__c'],image__c:rows.records[0]['image__c'],usernode__c:req.session.Id}, function(err, ret) {
                if(err) {
                    req.flash('error', err);
                    console.log("sry"); 
                }
                  else{
                        res.redirect('/');
                    }
            });
        }
      
    }
   )}}
exports.removetocart = async(req,res) => {
  const {removecart} = req.body;
  db.sobject("juicecart__c").destroy(removecart, function(err, ret) {
    if (err || !ret.success) { return console.error(err, ret); }
    console.log('Deleted Successfully : ' + ret.id);
     res.redirect('/cartpage');
  });
  };