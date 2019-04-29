var express = require('express');
var bp = require('body-parser');
var urlencodedParser = bp.urlencoded({extended: false});
const request = require('request');

var fs = require("fs");

var app = express();
app.use(express.static(__dirname));


app.get('/', (req, res) => {
    res.sendFile(__dirname + "/main.html");
});

app.post('/getreq', urlencodedParser, (req, res) => {
    console.log(`${req.body.day} ${req.body.month} ${req.body.year}`);
    let filename = req.body.day + '_' + req.body.month + '_' + req.body.year + '.json';
    try{
        request.get("clouder.mywebcommunity.org/traveldata/" + filename, (err, response, body) => {
            if (err)
                throw err;
            console.log(body);
            res.send(body);
        });
    }catch(err){
        res.send(JSON.stringify({number: 0, reqs: []}));
    }
});

app.post('/postreq', urlencodedParser, (req, res) => {
    let filename = "traveldata/" + req.body.day + '.json';
    try{
        request.get("clouder.mywebcommunity.org/traveldata/" + filename, (err, res, body) => {
            if (err)
                throw err;
            let datobj = JSON.parse(body);
            datobj.number++;
            datobj.reqs.push({name: req.body.name, time: req.body.time, desc: req.body.desc});
            let options = {
                url: "clouder.mywebcommunity.org/sharetravel.php",
                form: {
                    file: filename, 
                    content: JSON.stringify(datobj)
                }
            };

            request.post(options, (err, response, body) => {res.send("OK");});
        });
    }catch(err){
        let options = {
            url: "clouder.mywebcommunity.org/sharetravel.php",
            form: {
                file: filename, 
                content: JSON.stringify({number: 1, reqs:[{name: req.body.name, time: req.body.time, desc: req.body.desc}]})
            }
        };
        request.post(options, (err, response, body) => {res.send("OK");});
    } 
});
        


var server = app.listen(8080, () => {
    console.log("Server Running!");
});

