'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const chalk =  require('chalk'); // chalk@4.1.2 

//cron
const update = require('./cron/update');

//modules 

const { getFacebookToken } = require('./src/getFacebookToken');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let PORT = process.env.PORT || 4444;
app.listen(PORT,()=>{console.log(chalk.bgWhite('listening on port: '+PORT));});


getFacebookToken();

async function init(){
    update.initScheduledJobs();
}


