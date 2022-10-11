"use strict";

require('dotenv').config();
const chalk = require('chalk');
const puppeteer = require('puppeteer');
const url = "https://www.facebook.com/dialog/oauth?client_id=464891386855067&redirect_uri=https://www.facebook.com/connect/login_success.html&scope=basic_info,email,public_profile,user_about_me,user_activities,user_birthday,user_education_history,user_friends,user_interests,user_likes,user_location,user_photos,user_relationship_details&response_type=token";

async function getFacebookToken(){

    try{
        const cookies = JSON.parse(process.env.FACEBOOK_COOKIES);
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

    
        await page.setCookie(...cookies);
        await page.goto(url);

        let auth_url = await page.url();
        
        //await page.screenshot({path: 'check-fb-token.png'});

        ///Selectors if
        // aria-label="Az összes cookie engedélyezése"
        // aria-label="Folytatás mint Tinder-Bot"
    
        await browser.close();

        return auth_url.split('=')[1].split('&')[0];

    }catch(err){
        console.error(chalk.bgBlack(new Date().toLocaleString()),chalk.bgRed('Error in Get-Facebook-Token',err));
        return false;
    }
}


module.exports = { getFacebookToken }