"use strict";

require('dotenv').config();
const chalk = require('chalk');

async function getTinderToken(access_token) {

    try{

        let res = await fetch(process.env.TINDER_HOST + '/v2/auth/login/facebook',{
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'User-agent' : 'Tinder/7.5.3 (iPhone; iOS 10.3.2; Scale/2.00)',
                'platform': 'ios',
                'app_version': '6.9.4',
            },
            body: JSON.stringify({
                token : access_token,
                facebook_id : process.env.FACEBOOK_UID
                })
            });
 
            let json = await res.json();
            
            return json.data.api_token;

    }catch(err) {
        console.error(chalk.bgBlack(new Date().toLocaleString()),chalk.bgRed('Error in Get-Tinder-Token:',err));
        return false;
    }
    
}
module.exports = { getTinderToken }