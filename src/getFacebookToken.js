"use strict";

require('dotenv').config();
const puppeteer = require('puppeteer');
const url = "https://www.facebook.com/dialog/oauth?client_id=464891386855067&redirect_uri=https://www.facebook.com/connect/login_success.html&scope=basic_info,email,public_profile,user_about_me,user_activities,user_birthday,user_education_history,user_friends,user_interests,user_likes,user_location,user_photos,user_relationship_details&response_type=token";

async function getFacebookToken(){

    const cookies = JSON.parse(process.env.FACEBOOK_COOKIES);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

   
    await page.setCookie(...cookies);
    await page.goto(url);

    let auth_url = await page.url();
    console.log(auth_url);

    await page.screenshot({path: 'example.png'});
  
    await browser.close();
}

module.exports = { getFacebookToken }