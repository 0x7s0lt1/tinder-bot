"use strict";

const chalk = require("chalk");

async function swipeAllRight(API_TOKEN){

    console.log(chalk.bgBlack(new Date().toLocaleString()),chalk.bgBlue('START SCHEDULE LIKEING'));

    try{

        let res = await fetch(process.env.TINDER_HOST + "/user/recs",{
            method: "GET",
            headers:{
                'Content-Type': 'application/json',
                "Accept": "application/json",
                'User-agent' : 'Tinder/7.5.3 (iPhone; iOS 10.3.2; Scale/2.00)',
                'platform': 'web',
                'app_version': '6.9.4',
                'X-Auth-Token': API_TOKEN
            }
        })
    
        let recommendations = await res.json();

        try{

            recommendations.results.forEach( async (r) => {
               try{

                let _res = await fetch(process.env.TINDER_HOST + "/like/"+r.user._id,{
                    method: "GET",
                    headers:{
                        'Content-Type': 'application/json',
                        "Accept": "application/json",
                        'User-agent' : 'Tinder/7.5.3 (iPhone; iOS 10.3.2; Scale/2.00)',
                        'platform': 'web',
                        'app_version': '6.9.4',
                        'X-Auth-Token': API_TOKEN
                    }
                })

                let _json = await _res.json();
                if(_json.status === 200)  console.log(chalk.bgBlack(new Date().toLocaleString()),chalk.bgGreen('Successfully Like on id:',r.user._id));
            
               }catch(er) {
                console.error(chalk.bgBlack(new Date().toLocaleString()),chalk.bgRed('Error in Swiping right id:',r.user._id,"Error Message:",er));
                return false;
               }
                
            });

        }catch(err){
            console.error(chalk.bgBlack(new Date().toLocaleString()),chalk.bgRed('Error in Loopint through recommendations',err));
        }

    }catch(e) {
        console.error(chalk.bgBlack(new Date().toLocaleString()),chalk.bgRed('Error in getting recommendations:',e));

    }
   
}

module.exports = { swipeAllRight }