var express = require('express');
var bp = require('body-parser');
var urlencodedParser = bp.urlencoded({extended: false});

var fs = require("fs");

var app = express();
app.use(express.static("public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/main.html");
});

app.post('/getreq', urlencodedParser, (req, res) => {
    console.log(`${req.body.day} ${req.body.month} ${req.body.year}`);
    let filename = req.body.day + '_' + req.body.month + '_' + req.body.year + '.json';
    fs.readFile(__dirname + '/traveldata/' + filename, (err, data) => {
        if (err)
            res.send(JSON.stringify({number: 0, reqs:[]}));
        else
            res.send(data);
    });
});

app.post('/postreq', urlencodedParser, (req, res) => {
    fs.readFile(__dirname + '/traveldata/' + req.body.day + '.json', (err, data) => {
        if (err){
            fs.writeFile(__dirname + '/traveldata/' + req.body.day + '.json', JSON.stringify({number: 1, reqs:[{name: req.body.name, time: req.body.time, desc: req.body.desc}]}), () => {});
        }else{
            let datobj = JSON.parse(data);
            datobj.number++;
            datobj.reqs.push({name: req.body.name, time: req.body.time, desc: req.body.desc});
            fs.writeFile(__dirname + '/traveldata/' + req.body.day + '.json', JSON.stringify(datobj), () => {});
        }

        res.send("OK");
    });
});
        


var server = app.listen(8080, () => {
    console.log("Server Running!");
});

