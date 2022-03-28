const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

ipcRenderer.on("folder", (event, playlists) => {
  let curTrack = 0;
  const audio = document.querySelector("#audio");
  audio.src = playlists[1].tracks[curTrack].path;
  audio.play();
  document.querySelector("#trackPos").innerHTML = Math.floor(audio.currentTime);
  audio.onended = () => {
    audio.currentTime = 0;
    curTrack += 1;
    audio.src = playlists[1].tracks[curTrack].path;
    audio.play();
  };

  setInterval(() => {
    document.querySelector("#trackPos").innerHTML = Math.floor(audio.currentTime);
  }, 1000);

  document.documentElement.addEventListener("click", (event) => {
    if (event.target.id === "skip") {
      audio.pause();
      audio.currentTime = 0;
      curTrack += 1;
      audio.src = playlists[1].tracks[curTrack].path;
      audio.play();
    }
  });
});
