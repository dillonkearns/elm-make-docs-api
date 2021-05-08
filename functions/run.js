const { execSync } = require("child_process");
const fs = require("fs");
// const os = require('os');
const path = require("path");
const https = require("https");
const url = require("url");

exports.handler = async function (request) {
  // const output = generateDocs()
  // console.log(output.toString());

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: await generateDocs(),
    // body: fs.readFileSync('project/docs.json').toString()
  };
};

function generateDocs() {
  // return execSync(`curl --output project.tar.gz --location --remote-header-name --remote-name https://github.com/dillonkearns/elm-rss/tarball/master && tar xvzf project.tar.gz && tar xvzf project.tar.gz -C project --strip-components=1 && cd project && npx elm make --docs docs.json`)
  return new Promise((resolve, reject) => {
    // var tmpdir = os.tmpdir();
    const tmpdir = "/tmp";

    // if(!fs.existsSync(tmpdir)) {
    //     fs.mkdirSync(tmpdir);
    // }

    // // if the tmpdir still doesn't exist, lets try it locally
    // if(!fs.existsSync(tmpdir)) {
    //     tmpdir = './';
    // }

    var filename = `project.tar.gz`;
    var gitURL = `https://github.com/dillonkearns/elm-rss/tarball/master`;

    var download = path.join(tmpdir, filename);

    console.log("Downloading...\t", gitURL);

    var file = fs.createWriteStream(download);
    https
      .get(gitURL, (response) => {
        if (
          response.statusCode > 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          if (url.parse(response.headers.location).hostname) {
            https.get(response.headers.location, (data) => {
              data.pipe(file);
            });
          } else {
            https.get(
              url.resolve(url.parse(url).hostname, response.headers.location),
              (data) => {
                data.pipe(file);
              }
            );
          }
        } else {
          response.pipe(file);
        }
      })
      .on("error", (error) => {
        console.error(error);
      });

    file.on("finish", () => {
      console.log("Unzipping...\t", download);

      const tar = require("tar");
      // const unzip = require('zlib').createUnzip();

      // switch to reading from writing to the downloaded file
      const comp = fs.createReadStream(download);

      const outDir = path.join(tmpdir, "elm-make-docs-api-download");
      fs.mkdirSync(outDir);

      tar.extract({
        cwd: outDir,
        file: comp.path,
        sync: true,
        stripComponents: 1,
      });
      console.log("Success!", { tmpdir });

      console.log(
        execSync(`cd ${outDir} && npx elm make --docs docs.json`).toString()
      );
      resolve(fs.readFileSync(path.join(outDir, "docs.json")).toString());

      // let uncomp = path.join(tmpdir, base);
      // var dist = path.join(tmpdir, 'openrpg');
    });
  });
}
