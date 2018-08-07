// import lib
const rp       = require('request-promise'),
      cheerio  = require('cheerio'),
      cliTable = require('cli-table');
    

// define table object param and width      
let table      = new cliTable({
        head: ['username', 'LIKES', 'post-count'],
        colWidths: [20, 10, 20]
    });

// setup req url and json
const options = {
    url: `https://forum.freecodecamp.org/directory_items?period=weekly&order=likes_received&_=1533651569838`,
    json: true
}


// setup promise to loop over each user on forum page 
rp(options)
    .then((data) => {
        let userData = [];
        for(let user of data.directory_items) {
            userData.push({name: user.user.username, likes_received: user.likes_received, post_count: user.post_count});
        }
        process.stdout.write('loading'); // only for printing purpose
        getAndStoreChallengeData(userData);
    })
    .catch((err) => {
        console.log(err);
    });


// function to loop over each user's data like username, likes and completed challenges
function getAndStoreChallengeData(userData) {
    var i = 0;
    function next() {
        if(i < userData.length) {
            var options = {
                url: `https://www.freecodecamp.org/` + userData[i].name,
                transform: body =>  cheerio.load(body)
            }
            rp(options)
                .then(function ($){
                    process.stdout.write(`*`);
                    table.push([ userData[i].name, userData[i].likes_received, userData[i].post_count ]);
                    ++i;
                    return next();
                });
        } else {
            printData();
        }
    }
    return next();
}


function printData() {
    console.log("loading done");
    console.log(table.toString());
}