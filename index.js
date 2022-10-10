'use strict';

require('dotenv').config();
const cron = require("node-cron");
const chalk =  require('chalk'); // chalk@4.1.2 
const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');
const use = require('@tensorflow-models/universal-sentence-encoder');

// variables
const UPDATE_INTERVAL = "*/5 * * * *";
const LIKEING_INTERVAL = "* */4 * * *";
let TINDER_API,MATCHES,U_MATCHES;

//cron modules
const { swipeAllRight } = require('./cron/swipeAllRight');
const { getMatches } = require('./cron/getMatches');
const { processChanges } = require('./src/processChanges');

//auth modules
const { getFacebookToken } = require('./src/auth/getFacebookToken');
const { getTinderToken } = require('./src/auth/getTinderToken');


// tensoreflow object that can travel between the modules
let TF = {
    tf : tf,
    encoder: null,
    model : null,
    data : {
        lines : {},
        questions : [],
        responses : [],
    }
}
  
//cleaning data 
const movie_lines = fs.readFileSync('./src/datasets/movie_lines.txt', 'utf8');
movie_lines.split( "\n" ).forEach( l => {
    let parts = l.split( " +++$+++ " );
    TF.data.lines[ parts[ 0 ] ] = parts[ 4 ];
});

const movie_conversations = fs.readFileSync('./src/datasets/movie_conversations.txt', 'utf8');
movie_conversations.split( "\n" ).forEach( c => {
    let parts = c.split( " +++$+++ " );
    if( parts[ 3 ] ) {
        let phrases = parts[ 3 ].replace(/[^L0-9 ]/gi, "").split( " " ).filter( x => !!x );
        for( let i = 0; i < phrases.length - 1; i++ ) {
            TF.data.questions.push( TF.data.lines[ phrases[ i ] ] );
            TF.data.responses.push( TF.data.lines[ phrases[ i + 1 ] ] );
        }
    }
});

// Initialize 
async function init(){

    console.log(chalk.bgGreen(new Date().toLocaleString(),'Tinder-Bot running!' ));

    // load tf model and encoder
    let TF = {
        encoder: await use.load(),
        model : await use.loadQnA()
    };
    

    // getting authentications
    let fb_access_token = await getFacebookToken();
    TINDER_API = await getTinderToken(fb_access_token);
    let update  = await getMatches(TINDER_API);
    MATCHES = update.matches;
   
    //init crons
    cron.schedule(LIKEING_INTERVAL,async ()=>{ await swipeAllRight(TINDER_API)});
    cron.schedule(UPDATE_INTERVAL,async ()=>{ 
        U_MATCHES = await getMatches(TINDER_API);
        if(MATCHES != U_MATCHES){
            await processChanges(TINDER_API,U_MATCHES,TF);
            MATCHES = U_MATCHES;
        }else{
            console.log(chalk.bgGray( new Date().toLocaleString() + 'UPDATE-NO-CHANGES'));
        }
     });
    
     
}

init();

