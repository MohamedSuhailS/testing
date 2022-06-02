const express = require('express');
const router = express.Router();
const app = express();
const bcrypt = require('bcryptjs');
var jsforce = require('jsforce');
app.use(express.urlencoded({ extended: true }));
const cookieParser = require("cookie-parser");
var db = new jsforce.Connection();
app.use(cookieParser());
var iiid =' ';
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
db.login('syedsuhail926.ss@cunning-hawk-bhslhk.com', 'hack12345','m5FekhzLDBPwbSvXTbG1Y8Hp', function(err, res) {
  if (err) { return console.error(err); }
});
db.login('syedsuhail926.ss@cunning-hawk-bhslhk.com','hack12345'+'fxs0nNnJ4U13I7Kmva2TbMhU', (err, userInfo)=>{
  if(err){
      console.error(err)
  }else{
      console.log("User Id:"+ userInfo.id)
      console.log("Org Id:"+ userInfo.organizationId)
  }
})
router.get('/logout', function(req, res, next) { 
req.session.destroy();
res.redirect('/');
});
router.get('/user', function(req, res, next) { 
  var nam =req.session.name;
  if(nam == null){
    res.render('user',{user:'Login First',status:false});
   }else{
res.render('user',{user:req.session.Namef,status:true});}
});
router.get('/invoiceorder',function(req,res,err)
{
  db.query('SELECT Id,Name,orderid__c,productname__c,totalprice__c,quantity__c,price__c FROM invoice__c ORDER BY orderid__c',function(err,rows)     {
    if(err) {
      console.log('error', err);}
    res.render('invoiceorder.ejs',{orders:rows});
    }); 
});
router.get('/', function(req, res, next) { 
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
router.get('/login', function(req, res, next) {  
  var nam =req.session.name;
  var pas = req.session.pass;
  if(nam == null){
    res.render('login');
   }
  else{
    db.query('SELECT fullname__c,Name,password__c,Id FROM usernode__c where fullname__c Like \'%' + nam + '%\' ', async (error, results) => {
      if(!results || !(await bcrypt.compare(pas, results.records[0]['password__c']))){
    res.render('producthome.ejs');
  }
  else
  {
    res.render('login');   
  }
})};
  });
router.get('/register', (req, res) => {
  res.render('register');
});
router.get('/cartpage', function(req, res, next) {  
  var nam =req.session.name;
  var pas = req.session.pass;
  if(nam == null){
    res.redirect('login');
   }   
   else{
  var totals = 0;
  db.sobject("juicecart__c")
    .find({  
      'usernode__c' : req.session.Id
    },
      'Id,Name,juicename__c,image__c,price__c'
    )
    .execute(function(err, records) {
      console.log("record length = " + records.length);
      console.log(records)
    if(err) {
          req.flash('error', err);
          res.render('cartpage.ejs',{data:''});   
      } else {
          var rod = records.length;
          for (var i=0; i < rod; i++) {
       totals = totals + records[i]['price__c'];
              console.log(totals);
           }
        res.render('cartpage.ejs',{record:records,total:totals,cusname:req.session.Namef,title:records.length});
      }
  });
}
});

router.get('/buys', function(req, res, next) { 
 db.sobject("juicecart__c")
        .find({  
          'usernode__c' : req.session.Id
        },
          'Id, Name,juicename__c,price__c'
        )
        .execute(function(err, records) {
          if(err) {
            req.flash('error', err);}
            else{
              db.sobject("orderids__c").create({usernode__c:req.session.Id}, function(err, recordss) {
                if (err || !recordss.success) { return console.error(err, recordss); }
                console.log("Created record id : " + recordss.id);
               var iid = recordss.id;
                console.log("Iid + " + iid)
       if(err) {
          req.flash('error', err);}
          else{
            db.sobject("orderids__c").retrieve(iid, function(err, account) {
              if (err) { return console.error(err); }
              console.log("Name : " + account.Name);
            var iiid = account.Name;
              var rod = records.length;
              for (var i=0; i < rod; i++) {
                var Id = records[i]['Id'];
                  db.sobject("drinkorder__c").create({Name : req.session.Namef, orderid__c:iiid,email__c:req.session.name,juicename__c:records[i]['juicename__c'],usernode__c:req.session.Id,price__c:records[i]['price__c']}, function(err, record) {
                      if (err || !record.success) { return console.error(err, record); }
                      console.log("Created record id : " + record.id);
                    });
                  }
                  for (var i=0; i < rod; i++) {
                    var Id = records[i]['Id'];
                    if(i!= rod-1){
                    db.sobject("juicecart__c").destroy(Id, function(err, ret) {
                    if (err || !ret.success) { return console.error(err, ret); }
                    console.log('Deleted Successfully : ' + ret.id);
                    });}
                    else
                    {
                      db.sobject("juicecart__c").destroy(Id, function(err, ret) {
                        if (err || !ret.success) { return console.error(err, ret); }
                        console.log('Deleted Successfully : ' + ret.id);
                        db.sobject("drinkorder__c")
                        .find({  
                          'orderid__c' : iiid
                        },
                          'Id, Name,juicename__c,price__c'
                        ).sort('juicename__c')
                        .execute(function(err, invoiceresult) {  if (err) { return console.error(err); }
                            var rods = invoiceresult.length;
                            console.log("console " + rods)
                            console.log(iiid);
                            var quantity = 0;
                            var price = 0;
                            var total = 0;
                            var juice =' ';
                            var singleprice =0; 
                            for (var i=0; i < rods; i++) {
                              if(juice != invoiceresult[i]['juicename__c']  ){
                                var juice = invoiceresult[i]['juicename__c'] 
                                singleprice=invoiceresult[i]['price__c'];
                                console.log("Juice Name:" + juice);
                               for (var j=0; j < rods; j++) {
                                if(juice==invoiceresult[j]['juicename__c']){
                                  quantity= quantity+1;
                                  
                                  price=price+invoiceresult[i]['price__c'];
                                  console.log("quantity" + quantity);
                                }
                              }
                              console.log(juice);
                              console.log(quantity);
                              console.log(singleprice);
                              console.log(price);
                              total=total+price;
                             db.sobject("invoice__c").create({Name :req.session.Namef,orderid__c:iiid,productname__c:juice,price__c:singleprice,quantity__c:quantity }, function(err, inrecord) {
                                console.log(inrecord)
                                });
                              price=0;
                              quantity=0;
                              
                            }
                              }
                              
                        res.redirect('/invoicedetails/'+iiid);
                            console.log("total amount" + total);
                        });
                      });
                    }
                }   
      });
      }          
        });
      }
  });
  });
  router.get('/admin', function(req, res, next) { 
    res.render('admin/login');
  });

  router.get('/dashboard', function(req, res, next) { 
    if(req.session.adminNamef != null){
    res.render('admin/dashboard',{profile:req.session.adminNamef});}
    else{
      res.render('admin/login');
    }
    });
    router.get('/product', function(req, res, next) { 
      if(req.session.adminNamef != null){
      db.query('SELECT Id,price__c,Name,image__c FROM nodejs__c',function(err,rows)     {
        console.log(rows);
      res.render('admin/products.ejs',{profile:req.session.adminNamef,product:rows});
      });  }
      else{
        res.render('admin/login');
      }
    });
    router.get('/customers', function(req, res, next) { 
      if(req.session.adminNamef != null){
      db.query('SELECT Id,Name,fullname__c,password__c,CreatedDate FROM usernode__c',function(err,rows)     {
      res.render('admin/customers.ejs',{profile:req.session.adminNamef,users:rows});
      });  }
      else{
        res.render('admin/login');
      }
    });
    router.get('/cusdetails/(:Id)', function(req, res, next) {
      let Id = req.params.Id;
      db.sobject("drinkorder__c")
      .find({  
        'usernode__c' : Id
      },
        'Id,Name,juicename__c,price__c,CreatedDate'
      )
      .execute(function(err, records) {
      res.render('admin/customerdetails.ejs',{profile:req.session.adminNamef,customerdetails:records});
      });
    });
    router.get('/invoicedetails/(:orderid)', function(req, res, next) {
      let Id = req.params.orderid;
     
      if(req.session.Namef != null){
      db.sobject("invoice__c")
      .find({  
        'orderid__c' : Id
      },
        'Id,Name,productname__c,totalprice__c,quantity__c,price__c'
      )
      .execute(function(err, records) {
        db.sobject("juicecart__c")
        .find({  
          'usernode__c' : req.session.Id
        },
          'Id, Name'
        )
        .execute(function(error, cart) {
          if (err) { return console.error(error); }
          console.log("record length = " + cart.length);
        if(records.length != 0){
      console.log(records);
      res.render('detailinvoice.ejs',{orders:records,orderid:Id,title:cart.length,cusname:req.session.Namef}) 
        }
        else{
          db.sobject("invoice__c")
          .find({  
            'orderid__c' : Id
          },
            'Id,Name,productname__c,totalprice__c,quantity__c,price__c'
          )
          .execute(function(err, recordss) {
            res.render('detailinvoice.ejs',{orders:recordss,orderid:Id,title:cart.length,cusname:req.session.Namef}) 
        });
      }
    });
  });
      }
      else{
        res.redirect('/login');
      }
    });
    router.get('/admininvoice/(:orderid)', function(req, res, next) {
          let Id = req.params.orderid;
          if(req.session.adminNamef != null){
       db.sobject("invoice__c")
          .find({  
            'orderid__c' : Id
          },
            'Id,Name,productname__c,totalprice__c,quantity__c,price__c'
          ).execute(function(err, records) { 
            for (var i=0; i < records.length; i++) {
              var cusnam = records[i]['Name'];
            }
      res.render('admin/invoicedetails.ejs',{orders:records,profile:req.session.adminNamef,orderid:Id,cusname:cusnam});
          });  
    }
else{
        res.render('admin/login');
      }
    });
    router.get('/orderlist',function(req,res,next){
      if(req.session.adminNamef != null){
          db.query('SELECT Id,Name,productname__c,CreatedDate,totalprice__c,orderid__c FROM invoice__c ORDER BY orderid__c',function(err,rows){
            if(rows.totalSize != 0){
        res.render('admin/orderlist.ejs',{profile:req.session.adminNamef,orders:rows});}
        else{
          res.render('admin/orderlist.ejs',{profile:req.session.adminNamef,orders:rows});}
        });  }
        else{
          res.render('admin/login');
        }
    });
    router.get('/yourorder',function(req,res,next){
      if(req.session.name != null){
        db.sobject("invoice__c")
        .find({  
          'Name' : req.session.Namef
        },
          'orderid__c,Id,Name,productname__c,totalprice__c,quantity__c,price__c,CreatedDate'
        ).sort('orderid__c')
        .execute(function(err, records) { 
         
          db.sobject("juicecart__c")
        .find({  
          'usernode__c' : req.session.Id
        },
          'Id, Name'
        )
        .execute(function(err, cart) {
          if (err) { return console.error(err); }
          console.log("record length = " + cart.length);
          res.render('yourorder.ejs',{orders:records,cusname:req.session.Namef,title:cart.length});
        });
        });
    }
        else{
          res.render('login');
        }
    });
    router.get('/delorderlist',function(req,res,next){  
      db.query('SELECT Id FROM invoice__c',function(err,rows)     {
        var rod = rows.totalSize;
        for (var i=0; i < rod; i++) {
          var Id = rows.records[i]['Id'];
     db.sobject("invoice__c").destroy(Id, function(err, ret) {
      if (err || !ret.success) { return console.error(err, ret); }
      console.log('Deleted Successfully : ' + ret.id);
     });
    }
    });
    res.redirect('/orderlist');
  });
  router.get('/createadmin',function(req,res,next){  
    res.render('admin/createadmin');
  });
  router.get('/adminusers', function(req, res, next) { 
    db.query('SELECT Id,Name,fullname__c,password__c,CreatedDate FROM usersnode__c',function(err,rows)     {
    res.render('admin/adminusers.ejs',{profile:req.session.adminNamef,users:rows});
    });  
  });
  router.get('/deleteadmin/(:Id)', function(req, res, next) {
    let Id = req.params.Id;
    db.sobject("usersnode__c").destroy(Id, function(err, ret) {
      if (err || !ret.success) { return console.error(err, ret); }
      console.log('Deleted Successfully : ' + ret.id);
     });
     res.redirect('/adminusers');
  });
  
  router.get('/deleteproduct/(:Id)', function(req, res, next) {
    let Id = req.params.Id;
    db.sobject("nodejs__c").destroy(Id, function(err, ret) {
      if (err || !ret.success) { return console.error(err, ret); }
      console.log('Deleted Successfully : ' + ret.id);
      res.redirect('/product'); 
    });
  });
  router.get('/adminlogout', function(req, res, next) { 
    req.session.destroy();
    res.redirect('/admin');
    });
    router.get('/addproduct', function(req, res, next) { 
      res.render('admin/addproducts',{profile:req.session.adminNamef});
      });
      router.get('/statics', function(req, res, next) { 
        var torder,tuser,tproduct;
        db.query('SELECT Id FROM drinkorder__c',function(err,order){
          var torder = order.totalSize; 
          console.log(torder)
          db.query('SELECT Id FROM usernode__c',function(err,user){
           var tuser = user.totalSize;
             console.log(tuser)
            db.query('SELECT Id FROM nodejs__c',function(err,product){
           var tproduct = product.totalSize;
             console.log(tproduct)
             res.render('admin/statics',{profile:req.session.adminNamef,orders:torder,users:tuser,products:tproduct});
            });
            });});
            });
            router.get('/editproduct/(:Id)',function(req,res,err){
              let Ids = req.params.Id;
              db.sobject("nodejs__c").retrieve(Ids, function(err, account) {
                res.render('admin/editproduct',{profile:req.session.adminNamef,row:account});
              });
            });
           
module.exports = router;