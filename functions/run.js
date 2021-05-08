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
    return execSync(`curl --output project.tar.gz --location --remote-header-name --remote-name https://github.com/dillonkearns/elm-rss/tarball/master && tar xvzf project.tar.gz && tar xvzf project.tar.gz -C project --strip-components=1 && cd project && npx elm make --docs docs.json`)
}
