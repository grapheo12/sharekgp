var express = require('express');
var bp = require('body-parser');
var urlencodedParser = bp.urlencoded({extended: false});
const request = require('request');
const headers = { 
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
    'Content-Type' : 'application/x-www-form-urlencoded' 
};
var fs = require("fs");

var app = express();
app.use(express.static(__dirname));


app.get('/', (req, res) => {
    res.sendFile(__dirname + "/main.html");
});

app.post('/getreq', urlencodedParser, (req, res) => {
    //console.log(`${req.body.day} ${req.body.month} ${req.body.year}`);
    let filename = req.body.day + '_' + req.body.month + '_' + req.body.year + '.json';
    try{
        request.get("http://clouder.mywebcommunity.org/traveldata/" + filename, (err, response, body) => {
            //console.log(body);
            if (err)
                throw(err);
            //console.log(body);
            res.send(body);
        });
    }catch(err){
        res.send(JSON.stringify({number: 0, reqs: []}));
    }
});

app.post('/postreq', urlencodedParser, (req, res) => {
    let filename = "traveldata/" + req.body.day + '.json';
    //console.log(req.body.day);
    try{
        request.get("http://clouder.mywebcommunity.org/" + filename, (err, response, body) => {
            console.log(body);
            if (err){
                throw(err);
            }else if (body.startsWith("<")){
                let options = {
                    url: "http://clouder.mywebcommunity.org/sharetravel.php",
                    form: {
                        file: filename, 
                        content: JSON.stringify({number: 1, reqs:[{name: req.body.name, time: req.body.time, desc: req.body.desc}]})
                    },
                    headers: headers,
                    method: 'POST'
                };
                request.post(options, (err, response, body) => {res.send("OK");});
            }else{

            let datobj = JSON.parse(body);
            datobj.number++;
            datobj.reqs.push({name: req.body.name, time: req.body.time, desc: req.body.desc});
            let options = {
                url: "http://clouder.mywebcommunity.org/sharetravel.php",
                form: {
                    file: filename, 
                    content: JSON.stringify(datobj)
                },
                headers: headers,
                method: 'POST'
            };

            request.post(options, (err, response, body) => {res.send("OK");});
        }
    });
    }catch(err){
        let options = {
            url: "http://clouder.mywebcommunity.org/sharetravel.php",
            form: {
                file: filename, 
                content: JSON.stringify({number: 1, reqs:[{name: req.body.name, time: req.body.time, desc: req.body.desc}]})
            },
            headers: headers,
            method: 'POST'
        };
        request.post(options, (err, response, body) => {res.send("OK");});
    } 
});
        


var server = app.listen(process.env.PORT || 8080, () => {
    console.log("Server Running!");
});

