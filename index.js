'use strict';

require('dotenv').config();
const app = require('express')();
const cron = require("node-cron");
const cors = require('cors');
const bodyParser = require('body-parser');
const chalk =  require('chalk'); // chalk@4.1.2 

const GET_MATCHES_INTERVAL = "*/5 * * * *";
var TINDER_AUTH = null;
var MATCHES = null;

//crons
const { getMatches } = require('./cron/getMaches');

//modules 
const { getFacebookToken } = require('./src/auth/getFacebookToken');
const { getTinderToken } = require('./src/auth/getTinderToken');

app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 6969;
app.listen(PORT,()=>{console.log(chalk.bgWhite('listening on port: '+PORT));});

var tinder_auth = null;

async function init(){

    let access_token = await getFacebookToken();
    TINDER_AUTH = await getTinderToken(access_token);
    await getMatches(TINDER_AUTH,MATCHES);
    console.log("Matches:",MATCHES);
    cron.schedule(GET_MATCHES_INTERVAL,()=>{ getMatches(TINDER_AUTH,MATCHES) });
}

init();

