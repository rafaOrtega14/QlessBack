const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const db = mongoose.connection;
const { getLocals, vote } = require('./controllers/locals.js');

const app = express();
app.use(bodyParser.json())
app.get('/:latitude/:longitude/:type', getLocals);
app.post('/', vote)

mongoose.connect('mongodb://localhost:27017/qless?readPreference=primary&ssl=false');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log("Connected qless database on port 27017");
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});