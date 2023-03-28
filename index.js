// var http = require("http")
var axios = require('axios');
// http.createServer(function (request, response) {
//    // Send the HTTP header 
//    // HTTP Status: 200 : OK
//    // Content Type: text/plain
//    response.writeHead(200, {'Content-Type': 'text/plain'});
   
var config = {
  method: 'get',
maxBodyLength: Infinity,
  url: 'https://dev131365.service-now.com/api/now/table/incident?sysparm_fields=number%2Cstate%2Cshort_description%2Ccategory%2Csys_created_by&sysparm_limit=100',
  headers: {
    'Authorization': 'Basic YWRtaW46QmdmUUt1dTUkViUy',
    'Cookie': 'BIGipServerpool_dev131365=2844241674.64064.0000; JSESSIONID=D8E1385E5CE073F35519084E0888CAFE; glide_session_store=B54D9D04476121105ECC9DB6926D4358; glide_user_route=glide.be5997550394e44e56bec65b6fcc3ec5'
  }
};



//    // Send the response body as "Hello World"
//    response.end('Hello World\n');
// }).listen(8080);

// // Console will print the message
// console.log('Server running at http://127.0.0.1:8080/');

const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')

app.use(cors())
app.get('/', (req, res) => {
    axios(config)
.then(function (response) {
  res.send(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});

})

app.listen(port,
  console.log(`Example app listening on port ${port}`));