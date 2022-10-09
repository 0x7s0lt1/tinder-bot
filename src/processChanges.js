"use strict";

require('dotenv').config();
const chalk = require('chalk');

//functions 
 const { sendMessage } = require('./functions/sendMessage');

 //data
const  MSGSL  = require('./json/messages_list.json');

async function processChanges(API_TOKEN,MATCHES){
 

    MATCHES.forEach( async ( match ) => {

      let MESSAGE = {
          id : match._id,
          action : null,
          content : null
      }

      // if new match
       if(match.messages.length === 0){
          let first_question = MSGSL.first_questions[Math.floor(Math.random() * (MSGSL.first_questions.length - 1))];

          MESSAGE.action = 'FIRST_MESSAGE';
          MESSAGE.content =`Hello ${match.person.name}!😊 ${first_question}`;
       };

       // if last message not from the Bot
       if(match.messages[match.messages.length - 1].from !== process.env.TINDER_UID){

          let new_msg_string = "";
          match.messages = match.messages.reverse();
          for(let i = 0;i < match.messages.length;i++){
            if(match.messages[i].from === process.env.TINDER_UID){
              break;
            }

            new_msg_string += match.messages[i].message + " ";
          }

          //TODO: analyze messages and create reply 

       }

       try{
        await sendMessage(API_TOKEN,option);
      }catch(err){
        console.error(chalk.bgRed(new Date().toLocaleString() + 'Error in Process-Changes:',err));
        return false;
      }

    });

   
}

function normalize(value, min, max) {
    if (min === undefined || max === undefined) {
      return value;
    }
    return (value - min) / (max - min);
  }
  

module.exports = { processChanges }