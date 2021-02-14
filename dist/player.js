let player;
const playerWrap = document.querySelector('.player');
const playerStart = document.querySelector('.player__start');
const playerVideoDuration = document.querySelector('.player__time-duration');
const playerVideoCurrent = document.querySelector('.player__time-current');

function eventsInit() {
  playerStart.addEventListener('click', ()=>{
    if (!playerWrap.classList.contains('player--paused')){
      player.pauseVideo();
      playerWrap.classList.add('player--paused')
    } else {
      player.playVideo();
      playerWrap.classList.remove('player--paused');

    }
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
    return t < 10 ? `0${t}` : `${t}`
  }

  return `${_formatPeriod(hh)}:${_formatPeriod(mm)}:${_formatPeriod(ss)}`
}

function onPlayerReady(){
  let interval;
  const videoDurationSec = player.getDuration();
  playerVideoDuration.textContent = converTime(videoDurationSec);

  if (typeof(interval) !== undefined){
    clearInterval(interval);
  }

  interval = setInterval(()=>{
    const videoCurrentSec = player.getCurrentTime();
    playerVideoCurrent.textContent = converTime(videoCurrentSec);
  }, 1000);

}

function onYouTubeIframeAPIReady(){
  player = new YT.Player('player',{
    width: "662",
    height: "392",
    videoId: "RBSGKlAvoiM",
    events: {
      onReady: onPlayerReady,
    },
    playerVars: {
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      modestbranding: 1,
      rel: 0
      
    }

  });
}


eventsInit();