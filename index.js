'use strict';

require('dotenv').config();
const cron = require("node-cron");
const chalk =  require('chalk'); // chalk@4.1.2 

const UPDATE_INTERVAL = "*/5 * * * *";
const LIKEING_INTERVAL = "* */4 * * *";
let TINDER_API,MATCHES,U_MATCHES;

//crons
const { swipeAllRight } = require('./cron/swipeAllRight');
const { getMatches } = require('./cron/getMaches');
const { processChanges } = require('./src/processChanges');


//auth modules
const { getFacebookToken } = require('./src/auth/getFacebookToken');
const { getTinderToken } = require('./src/auth/getTinderToken');


async function init(){

    console.log(chalk.bgGreen(new Date().toLocaleString(),'Tinder-Bot running on port: ' + PORT ));

    let fb_access_token = await getFacebookToken();
    TINDER_API = await getTinderToken(fb_access_token);
    let update  = await getMatches(TINDER_API);
    MATCHES = update.matches;
   
    cron.schedule(LIKEING_INTERVAL,async ()=>{ await swipeAllRight(TINDER_API)});
    cron.schedule(UPDATE_INTERVAL,async ()=>{ 
        U_MATCHES = await getMatches(TINDER_API);
        if(MATCHES != U_MATCHES){
            await processChanges(TINDER_API,U_MATCHES);
            MATCHES = U_MATCHES;
        }else{
            console.log(chalk.bgGray( new Date().toLocaleString() + 'UPDATE-NO-CHANGES'));
        }
     });
    
     
}

init();

