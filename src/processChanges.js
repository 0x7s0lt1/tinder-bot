"use strict";

require('dotenv').config();
const chalk = require('chalk');


const NUM_SAMPLES = 200;

//functions 
const { sendMessage } = require('./functions/sendMessage');

//data
const  MSGSL  = require('./json/messages_list.json');


async function processChanges(API_TOKEN,MATCHES,TF){
 

    MATCHES.forEach( async ( match ) => {

      let MESSAGE = {
          id : match._id,
          action : null,
          content : null
      };

      // if new match
       if(match.messages.length === 0){
          let first_question = MSGSL.first_questions[Math.floor(Math.random() * MSGSL.first_questions.length )];

          MESSAGE.action = 'FIRST_MESSAGE';
          MESSAGE.content =`Hello ${match.person.name}!😊 ${first_question}`;

       };

       // if last message not from the Bot
       if(match.messages[match.messages.length - 1].from !== process.env.TINDER_UID){

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

          TF.tf.tidy( () => {

            const embed_query = embeddings[ "queryEmbedding" ].arraySync();
            const embed_responses = embeddings[ "responseEmbedding" ].arraySync();
            let scores = [];
            embed_responses.forEach( response => {
                scores.push( dotProduct( embed_query[ 0 ], response ) );
            });
            let id = scores.indexOf( Math.max( ...scores ) );
            MESSAGE.content = responses[ randomOffset + id ];
          });

          embeddings.queryEmbedding.dispose();
          embeddings.responseEmbedding.dispose();

       }

       try{
        await sendMessage(API_TOKEN,option);
      }catch(err){
        console.error(chalk.bgRed(new Date().toLocaleString() + 'Error in Process-Changes:',err));
        return false;
      }

    });

   
}
  

module.exports = { processChanges }