const electron = require("electron");
const progressArea = document.querySelector(".progress-area"),
  progressBar = progressArea.querySelector(".progress-bar"),
  audio = new Audio(),
  musicCurrentTime = progressArea.querySelector(".current-time"),
  musicDuration = progressArea.querySelector(".max-duration"),
  controls = document.querySelector(".controls"),
  playBtn = controls.querySelector(".play"),
  nextBtn = controls.querySelector(".next"),
  prevBtn = controls.querySelector(".prev"),
  loopBtn = controls.querySelector(".loop"),
  volumeBtn = controls.querySelector(".volume"),
  volumeControl = document.querySelector(".volume-control"),
  volumeAmount = volumeControl.querySelector(".volume-amount"),
  volumeSlider = volumeControl.querySelector(".volume-slider"),
  windowControl = document.querySelector(".window-control"),
  trayBtn = windowControl.querySelector(".tray"),
  minimizeBtn = windowControl.querySelector(".minimize"),
  closeBtn = windowControl.querySelector(".close"),
  playingInfo = document.querySelector(".playing-info"),
  playingTitle = playingInfo.querySelector(".playing-title"),
  playingArtist = playingInfo.querySelector(".playing-artist"),
  playingArtWork = playingInfo.querySelector(".playing-artwork"),
  ipcRenderer = electron.ipcRenderer;

let curTrack = 0,
  playlists = [],
  loopMode = "none",
  hoveringVolumeBtn = false;

closeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  ipcRenderer.send("close-window");
});

minimizeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  ipcRenderer.send("minimize-window");
});

trayBtn.addEventListener("click", (e) => {
  e.preventDefault();
  ipcRenderer.send("tray-window");
});

ipcRenderer.on("tray-window-play/pause", playAudio);

ipcRenderer.on("folder", (event, rcvPlaylists) => {
  playlists = rcvPlaylists;
  audio.src = playlists[1].tracks[curTrack].path;
  audio.addEventListener("loadeddata", () => {
    setDurationInfo();
    setInfo();
  });
  playBtn.addEventListener("click", playAudio);
  audio.addEventListener("timeupdate", updateProgressBar);
  nextBtn.addEventListener("click", nextTrack);
  prevBtn.addEventListener("click", prevTrack);
  progressArea.addEventListener("click", setProgressBarPos);
  loopBtn.addEventListener("click", switchLoopMode);
  audio.addEventListener("ended", audioEnded);
  volumeBtn.addEventListener("mouseover", () => {
    hoveringVolumeBtn = true;
    volumeControl.className = "volume-control";
  });
  volumeControl.addEventListener("mouseover", () => {
    hoveringVolumeBtn = true;
    volumeControl.className = "volume-control";
  });
  volumeControl.addEventListener("mouseout", () => {
    hoveringVolumeBtn = false;
    setTimeout(() => {
      if (!hoveringVolumeBtn) {
        volumeControl.className = "volume-control invisible-volume-control";
      }
    }, 300);
  });
  volumeBtn.addEventListener("mouseout", () => {
    hoveringVolumeBtn = false;
    setTimeout(() => {
      if (!hoveringVolumeBtn) {
        volumeControl.className = "volume-control invisible-volume-control";
      }
    }, 300);
  });
  volumeSlider.addEventListener("input", (e) => {
    audio.volume = e.target.value / 100;
  });
  audio.addEventListener("volumechange", (e) => {
    volumeAmount.innerHTML = `${Math.round(audio.volume * 100)}`;
  });
});

//Declaring functions
function playAudio() {
  if (audio.paused) {
    audio.play();
    playBtn.innerHTML = '<i class="fa-solid fa-pause control-icon"></i>';
  } else {
    audio.pause();
    playBtn.innerHTML = '<i class="fa-solid fa-play control-icon"></i>';
  }
}

function switchLoopMode() {
  if (loopMode === "none") {
    loopBtn.innerHTML = '<i class="fa-solid fa-repeat control-icon"></i>';
    loopMode = "all";
  } else if (loopMode === "all") {
    loopBtn.innerHTML = '<i class="fa-solid fa-1 control-icon"></i>';
    loopMode = "one";
  } else if (loopMode === "one") {
    loopBtn.innerHTML = '<i class="fa-solid fa-stop control-icon"></i>';
    loopMode = "none";
  }
}

function audioEnded() {
  playBtn.innerHTML = '<i class="fa-solid fa-play control-icon"></i>';
  if (loopMode === "none") {
    return;
  } else if (loopMode === "all") {
    return nextTrack();
  } else if (loopMode === "one") {
    audio.currentTime = 0;
    return playAudio();
  }
}

function setProgressBarPos(e) {
  let progressWidth = progressArea.clientWidth;
  let clickedOffsetX = e.offsetX;
  let songDuration = audio.duration;

  audio.currentTime = (clickedOffsetX / progressWidth) * songDuration;
}

function updateProgressBar() {
  const currentTime = audio.currentTime;
  const duration = audio.duration;

  let progressWidth = (currentTime / duration) * 100;
  progressBar.style.width = `${progressWidth}%`;

  let currentMin = Math.floor(currentTime / 60);
  let currentSec = Math.floor(currentTime % 60);
  if (currentSec < 10) {
    currentSec = `0${currentSec}`;
  }
  musicCurrentTime.innerHTML = `${currentMin}:${currentSec}`;
}

function setDurationInfo() {
  const duration = audio.duration;
  let totalMin = Math.floor(duration / 60);
  let totalSec = Math.floor(duration % 60);
  if (totalSec < 10) {
    totalSec = `0${totalSec}`;
  }
  musicDuration.innerHTML = `${totalMin}:${totalSec}`;
}

function setInfo() {
  playingTitle.innerHTML = playlists[1].tracks[curTrack].title;
}

function prevTrack() {
  audio.pause();
  audio.currentTime = 0;
  if (curTrack - 1 < 0) {
    curTrack = playlists[1].tracks.length - 1;
  } else {
    curTrack -= 1;
  }
  audio.src = playlists[1].tracks[curTrack].path;
  audio.play();
}

function nextTrack() {
  audio.pause();
  audio.currentTime = 0;
  if (curTrack + 1 > playlists[1].tracks.length - 1) {
    curTrack = 0;
  } else {
    curTrack += 1;
  }
  audio.src = playlists[1].tracks[curTrack].path;
  audio.play();
}