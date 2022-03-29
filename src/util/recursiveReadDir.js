const { readdirSync, lstatSync, existsSync } = require("fs");
const { setFfmpegPath, read: ffmetaRead } = require("ffmetadata");
const pathToFfmpeg = require("ffmpeg-static");
const { join } = require("path");

setFfmpegPath(pathToFfmpeg);

module.exports = (start, extension) => {
  //Playlist array
  const pls = [];
  //Search funciontion
  function search(start, extension) {
    if (!existsSync(start)) {
      console.log(`No dir: ${start}`);
      return;
    }

    //readdirSync returns an array of files in the directory
    const files = readdirSync(start);
    //for each file in the directory
    for (var i = 0; i < files.length; i++) {
      //get the file path
      var filename = join(start, files[i]);
      //get the file stat
      var stat = lstatSync(filename);
      //if the file is a directory, search it
      if (stat.isDirectory()) {
        search(filename, extension); //recursion
        //if the file is an mp3 file, add it to the playlist
      } else if (filename.indexOf(extension) >= 0) {
        //read the metadata
        ffmetaRead(filename, { encoding: "utf8" }, (err, metadata) => {
          if (err) {
            //Logs if has error
            console.log(err);
          }
          if (metadata.title) {
            const remove = filename.split("\\").pop();
            //Creates objects
            const sgPath = filename.replace(`\\${remove}`, "").split("\\");
            sgPath.push(metadata.title);
            const sgObj = {
              title: metadata.title,
              artist: metadata.artist || "Unknown",
              album: metadata.album || "Unknown",
              number: metadata.track ? Number(metadata.track) : 0,
              path: `${sgPath.join("\\")}.${extension}`,
            };
            const plObj = {
              title: metadata.album || "Unknown",
              tracks: [],
            };
            if (!pls.find((pl) => pl.title === plObj.title)) {
              return pls.push(plObj);
            } else {
              return pls[
                pls.findIndex((pl) => pl.title === plObj.title)
              ].tracks.push(sgObj);
            }
          }
        });
      }
    }
  }

  search(start, extension);
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(pls);
    }, 1000);
  });
};
