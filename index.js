'use strict';

require('dotenv').config();
const cron = require("node-cron");
const chalk =  require('chalk'); // chalk@4.1.2 
const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');
const use = require('@tensorflow-models/universal-sentence-encoder');

// variables
const UPDATE_INTERVAL = "* */1 * * *";
const LIKEING_INTERVAL = "* */12 * * *";
const NUM_SAMPLES = 200;
let TINDER_API,MATCHES;

//cron modules
const { swipeAllRight } = require('./cron/swipeAllRight');
const { getMatches } = require('./cron/getMatches');

//auth modules
const { getFacebookToken } = require('./src/auth/getFacebookToken');
const { getTinderToken } = require('./src/auth/getTinderToken');

//functions 
const { sendMessage } = require('./src/functions/sendMessage');

//data
const first_questions  = require('./src/json/first_questions.json');
const movie_lines = fs.readFileSync('./src/datasets/movie_lines.txt', 'utf8');
const movie_conversations = fs.readFileSync('./src/datasets/movie_conversations.txt', 'utf8');



// tensorflow object
let TF = {
    encoder: null,
    model : null,
    data : {
        lines : {},
        questions : [],
        responses : [],
    }
}
  
//cleaning data 
movie_lines.split( "\n" ).forEach( l => {
    let parts = l.split( " +++$+++ " );
    TF.data.lines[ parts[ 0 ] ] = parts[ 4 ];
});

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

    try{
        console.log(chalk.bgBlack(new Date().toLocaleString()),chalk.bgGreen('Tinder-Bot starts!' ));

        // load tf model and encoder
        
        TF.encoder = await use.load(),
        TF.model = await use.loadQnA()
        
    
        console.log(chalk.bgBlack(new Date().toLocaleString()),chalk.bgGreen('Tinder-Bot model loaded!'));
        
    
        // getting authentications
        let fb_access_token = await getFacebookToken();
        TINDER_API = await getTinderToken(fb_access_token);
        let update  = await getMatches(TINDER_API);
        MATCHES = update.matches;

        await processChanges(TINDER_API,MATCHES);
       
        //init crons
        let LIKE_TASK = cron.schedule(LIKEING_INTERVAL,async ()=>{ await swipeAllRight(TINDER_API)});
    
        let PROCESS_TASK = cron.schedule(UPDATE_INTERVAL,async ()=>{ 
            let update  = await getMatches(TINDER_API);
            MATCHES = update.matches;
            await processChanges(TINDER_API,MATCHES);
         });

    }catch(err){
        console.error(chalk.bgRed('Error in INIT ',err));
        return false;
    }
    
    
     
}

async function processChanges(API_TOKEN,MATCHES){
 
    console.log(chalk.bgBlack(new Date().toLocaleString()),chalk.bgBlue('START PROCESSING MATCHES'));

    MATCHES.forEach( async ( match ) => {

        let MESSAGE = {
            id : match._id,
            action : null,
            content : null
        };
  
        // if new match
         if(match.messages.length === 0){
            
  
            try{
  
              let fsq = first_questions[Math.floor(Math.random() * first_questions.length )];
  
              MESSAGE.action = 'FIRST_MESSAGE';
              MESSAGE.content =`Hello ${match.person.name}!😊 ${fsq}`;
  
              await sendMessage(API_TOKEN,MESSAGE);
              
            }catch(err){
              console.error(chalk.bgBlack(new Date().toLocaleString()),chalk.bgRed('Error in Process-First-Message:',err));
              return false;
            }
  
            return;
  
         }
         // if last message not from the Bot
         if(match.messages[match.messages.length - 1].from !== process.env.TINDER_UID){
  
          try{
            //find last messages and concat them
            let msg_array = [];
            // revers messages..so it starts wit the latest message
            match.messages = match.messages.reverse();
            for( let i = 0; i < match.messages.length; i++ ){
              // if we find the first message from the bot break from loop
              if(match.messages[i].from === process.env.TINDER_UID){
                break;
              }
              //esle collect message 
              msg_array.push(match.messages[i].message);
            }
  
            // reverse back and concat the messages into single string
            let text = msg_array.reverse().join(' ');
  
            let randomOffset = Math.floor( Math.random() * TF.data.questions.length );
            const input = {
              queries: [ text ],
              responses: TF.data.questions.slice( randomOffset, NUM_SAMPLES )
            };
            let embeddings = await TF.model.embed( input );
  
            TF.tf.tidy( async () => {
  
              const embed_query = embeddings[ "queryEmbedding" ].arraySync();
              const embed_responses = embeddings[ "responseEmbedding" ].arraySync();
              let scores = [];
              embed_responses.forEach( response => {
                  scores.push( dotProduct( embed_query[ 0 ], response ) );
              });
  
              let id = scores.indexOf( Math.max( ...scores ) );
              MESSAGE.action = "AI-Response";
              MESSAGE.content = responses[ randomOffset + id ];
  
              await sendMessage(API_TOKEN,MESSAGE);
  
            });
  
            embeddings.queryEmbedding.dispose();
            embeddings.responseEmbedding.dispose();
  
           
            
          }catch(err){
            console.error(chalk.bgBlack(new Date().toLocaleString()),chalk.bgRed('Error in Process-AI-Response:',err));
            return false;
          }
  
            return;
  
         }
  
         console.log(chalk.bgBlack(new Date().toLocaleString()),chalk.bgGray(' NO Change in match:' + MESSAGE.id ));
  

      });
   
}

init();

