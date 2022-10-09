"use strict";

require('dotenv').config();
const chalk = require('chalk');
const fetch = require('node-fetch');

async function sendMessage(API_TOKEN,MESSAGE){
  try{

    let res = await fetch(process.env.TINDER_HOST + '/user/matches/' + MESSAGE.id,{
        method:'POST',
        headers:{
            'Content-Type': 'application/json',
            "Accept": "application/json",
            'User-agent' : 'Tinder/7.5.3 (iPhone; iOS 10.3.2; Scale/2.00)',
            'platform': 'ios',
            'app_version': '6.9.4',
            'X-Auth-Token': API_TOKEN
        },
        body: JSON.stringify({"message": MESSAGE.message}),
    });

    let json = await res.json();

    if(json.status === 200) console.log(chalk.bgGreen(new Date().toLocaleString(),'Successfully send '+ MESSAGE.action +' message to:',MESSAGE.id));
    

}catch(err) {
    console.error(chalk.bgRed(new Date().toLocaleString() + ' Error in Send-Message:',err));
    return false;
}
}

module.exports = { sendMessage }