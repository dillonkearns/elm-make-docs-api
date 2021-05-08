const {  execSync } = require("child_process");
const fs = require('fs')


exports.handler = async function(request) {
    const output = generateDocs()
    console.log(output.toString());
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: fs.readFileSync('project/docs.json').toString()
    }
    
}

function generateDocs() {
    return execSync("rm -rf project && git clone https://github.com/dillonkearns/elm-rss.git --branch master --single-branch project && cd project && elm make --docs docs.json")
}
