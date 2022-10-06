async function getMatches(TINDER,MATCH_LIST){
  try{

    let res = await fetch(process.env.TINDER_HOST + '/v2/matches',{
        method:'GET',
        headers:{
            'Content-Type': 'application/json',
            "Accept": "application/json",
            'User-agent' : 'Tinder/7.5.3 (iPhone; iOS 10.3.2; Scale/2.00)',
            'platform': 'ios',
            'app_version': '6.9.4',
            'X-Auth-Token': TINDER.api_token
        }});

        MATCH_LIST = res.text();

}catch(err) {
    console.error('Error in Get-Tinder-Matches:',err);
    return false;
}
}

module.exports = { getMatches }