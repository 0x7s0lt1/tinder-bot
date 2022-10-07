"use strict";

require('dotenv').config();
const chalk = require('chalk');
const fetch = require('node-fetch');

async function getMatches(API_TOKEN){
  try{

    let res = await fetch(process.env.TINDER_HOST + '/updates',{
        method:'POST',
        headers:{
            'Content-Type': 'application/json',
            "Accept": "application/json",
            'User-agent' : 'Tinder/7.5.3 (iPhone; iOS 10.3.2; Scale/2.00)',
            'platform': 'web',
            'app_version': '6.9.4',
            'X-Auth-Token': API_TOKEN
        },
        body: JSON.stringify({"last_activity_date":""}),
    });

    return  await res.json().matches;
    

}catch(err) {
    console.error(chalk.bgRed(new Date().getTime() + 'Error in Get-Tinder-Matches:',err));
    return false;
}
}

module.exports = { getMatches }