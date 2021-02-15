let player;
const playerWrap = document.querySelector(".player");
const playerStart = document.querySelectorAll(".player__start");
const playerVideoDuration = document.querySelector(".player__time-duration");
const playerVideoCurrent = document.querySelector(".player__time-current");
const playerPlayback = document.querySelector(".player__playback");
const playerMarker = document.querySelector(".player__marker");

const playerVolumeMarker = document.querySelector(".player__volumemarker");
const playerVolume = document.querySelector(".player__volume");

function eventsInit() {
  Array.from(playerStart).forEach((el) => {
    el.addEventListener("click", (ev) => {
      const currentState = player.getPlayerState();
      if (currentState == 1) {player.pauseVideo()};
      if (currentState == 2 || currentState == 0 || currentState == 5) {
        player.playVideo();}
    });
  });
  playerPlayback.addEventListener("click", (ev) => {
    const newProgress = (100 * ev.layerX) / playerPlayback.clientWidth;
    playerMarker.style.left = `${newProgress}%`;
    const newCurrentSec = Math.floor(
      (newProgress * player.getDuration()) / 100
    );
    player.seekTo(newCurrentSec);
  });

  playerVolume.addEventListener('click', (ev)=>{
    const newVolume = (100 * ev.layerX) / playerVolume.clientWidth;
    setPlayerVolume(newVolume);
  });
}

function converTime(sec) {
  // Converting sec to time format hh:mm:ss
  sec = Number.parseInt(sec);
  let hh = Math.trunc(sec / 3600);
  let mm = Math.trunc((sec - hh * 3600) / 60);
  let ss = Math.trunc(sec % 60);

  function _formatPeriod(t) {
    // Check
    return t < 10 ? `0${t}` : `${t}`;
  }
  let resultFormat = hh > 0 ? `${_formatPeriod(hh)}:${_formatPeriod(mm)}:${_formatPeriod(ss)}` : `${_formatPeriod(mm)}:${_formatPeriod(ss)}`
  return `${_formatPeriod(mm)}:${_formatPeriod(ss)}`;
}

function setPlayerVolume(vol){
  // vol: number
  player.setVolume(Math.floor(vol));
  playerVolumeMarker.style.left = `${vol}%`;
}

function onPlayerReady(ev) {
  let interval;
  const videoDurationSec = player.getDuration();
  playerVideoDuration.textContent = converTime(videoDurationSec);

  if (typeof interval !== undefined) {
    clearInterval(interval);
  }

  interval = setInterval(() => {
    // Setting current time
    const videoCurrentSec = player.getCurrentTime();
    playerVideoCurrent.textContent = converTime(videoCurrentSec);
    // Setting marker on progress bar
    const progress = (100 * videoCurrentSec) / videoDurationSec;
    playerMarker.style.left = `${progress}%`;
  }, 1000);
  // Volume
  setPlayerVolume(player.getVolume());
  
}

function onPlayerStateChange(ev) {
  /*
    -1 (unstarted)
    0 (ended)
    1 (playing)
    2 (paused)
    3 (buffering)
    5 (video cued).
  */
  switch (ev.data) {
    case 1:
      playerWrap.classList.remove("player--paused");
      break;
    case 2:
      playerWrap.classList.add("player--paused");
      break;
    case 0: // end
      playerWrap.classList.add("player--paused");
  }
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    width: "662",
    height: "392",
    videoId: "Og847HVwRSI",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
    playerVars: {
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      modestbranding: 1,
      rel: 0,
    },
  });
}

eventsInit();
