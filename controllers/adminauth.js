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
db.login('syedsuhail926.ss@cunning-hawk-bhslhk.com', 'suhail.S123','RM0pfNkTL1bTDiwEDT6yCxjso', function(err, res) {
  if (err) { return console.error(err); }
});
db.login('syedsuhail926.ss@cunning-hawk-bhslhk.com','suhail.S123'+'RM0pfNkTL1bTDiwEDT6yCxjso', (err, userInfo)=>{
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
    
    db.query('SELECT fullname__c FROM usersnode__c where fullname__c Like \'%' + email + '%\' ', async (error, results) => {
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
      db.sobject("usersnode__c").create({Name: name, fullname__c: email, password__c: hashedPassword}, (error, results) => {
        if(error) {
          console.log(error);
        }else{
          console.log(results);
          res.redirect('/dashboard')
        }
      });
    });
  };
  exports.login = async (req, res) => {
      try {
      const {adminemail, adminpassword} = req.body;
      if(!adminemail || !adminpassword) {
        return res.status(400).render('admin/login', {
          message: 'Please provide an email and password'
        });
      }
      db.query('SELECT fullname__c,Name,password__c,Id FROM usersnode__c where fullname__c Like \'%' + adminemail + '%\' ', async (error, results) => {
        if(!results || !(await bcrypt.compare(adminpassword, results.records[0]['password__c']))){
          res.render('admin/login', {
            message: 'Email or Password is incorrect'
          });
        }else{
          const id = results.records[0].Id;
          req.session.adminId =results.records[0].Id;
          req.session.adminNamef =results.records[0].Name;
          req.session.adminname =results.records[0].fullname__c;
          req.session.adminpass =results.records[0].password__c;
          res.status(200).redirect('/dashboard');
          
      console.log(req.session.name);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  exports.dashboard = async (req, res) => {
    res.render('admin/dashboard')
  }
  exports.addproducts = async (req, res) => {
    try {
      const {name, price,img} = req.body;
      if(!price || !name || !img) {
        return res.status(400).render('admin/addproducts', {
          message: 'Please provide an All details'
        });
      }
      else{
        db.sobject("nodejs__c").create({Name: name, price__c: price, image__c: img}, (error, results) => {
          if(error) {
            console.log(error);
          }else{
            console.log(results);
            res.redirect('/addproduct')
          }
        });}
    }
    catch (error) {
      console.log(error);
    }
   
  }
  
  exports.editproducts = async (req, res) => {
    try {
      const {name, price,img,Id} = req.body;
       
      if(!Id || !price || !name || !img) {
        var records =
          {
            attributes: [Object],
            Id : Id,
            price__c : price,
            Name : name,
            image__c : img
          };
        return res.status(400).render('admin/editproduct', {
         message: 'Please provide an All Details',row:records
        });
      }
      else{
        db.sobject("nodejs__c").update({Id:Id, Name: name, price__c: price, image__c: img}, function(error, results) {
          if(error) {
            console.log(error);
          }else{
            console.log(results);
            res.redirect('/product')
          }
        });}
    }
    catch (error) {
      console.log(error);
    }
  }