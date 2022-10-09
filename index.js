'use strict';

require('dotenv').config();
const app = require('express')();
const cron = require("node-cron");
const chalk =  require('chalk'); // chalk@4.1.2 

const PORT = process.env.PORT || 6969;
const UPDATE_INTERVAL = "*/5 * * * *";
const LIKEING_INTERVAL = "* */4 * * *";
var TINDER_API,MATCHES,U_MATCHES;

//crons
const { getMatches } = require('./cron/getMaches');
const { swipeAllRight } = require('./cron/swipeAllRight');

//auth modules
const { getFacebookToken } = require('./src/auth/getFacebookToken');
const { getTinderToken } = require('./src/auth/getTinderToken');

//
const { processChanges } = require('./src/processChanges');



app.listen(PORT,()=>{console.log(chalk.bgGreen(new Date().toLocaleString(),'Tinder-Bot running on port: ' + PORT ));});


async function init(){

    let fb_access_token = await getFacebookToken();
    TINDER_API = await getTinderToken(fb_access_token);
    let update  = await getMatches(TINDER_API);
    MATCHES = update.matches;
    await processChanges(TINDER_API,MATCHES)
    cron.schedule(LIKEING_INTERVAL,async ()=>{ await swipeAllRight(TINDER_API)});
    /*
    cron.schedule(UPDATE_INTERVAL,async ()=>{ 
        U_MATCHES = await getMatches(TINDER_API);
        if(MATCHES != U_MATCHES){
            await processChanges(TINDER_API,U_MATCHES);
            MATCHES = U_MATCHES;
        }

        console.log(chalk.bgGray( new Date().getTime() + 'UPDATE-NO-CHANGES'));

     });
     */
     
}

init();

