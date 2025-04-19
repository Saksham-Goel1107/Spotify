let currentSong = new Audio();
let isFirstPlay = true;
let songIndex = 0;
let songs = [];
let currFolder;

const folderSongs = {
  "first": [
    "a-long-way.mp3",
    "amalgam.mp3",
    "coverless-book.mp3",
    "lost-in-dreams.mp3",
    "no-place-to-go.mp3",
    "perfect-beauty.mp3",
    "soulsweeper.mp3"
  ],
  "second": [
    "flow.mp3",
    "for-her-chill.mp3",
    "groovy-ambient.mp3",
    "spinning-head.mp3",
    "tell-me-the-truth.mp3"
  ],
  "third": [
    "kaise-bhula-dun.mp3",
    "kids-song.mp3",
    "lofi-song-nature.mp3",
    "lofi-song.mp3",
    "original-song.mp3",
    "romantic-song.mp3",
    "teri-ye-adaa.mp3"
  ],
  "fourth": [
    "alphabet-song.mp3",
    "bawa-dia.mp3",
    "climax-epic.mp3",
    "pesan-terakhir.mp3",
    "randomsong.mp3",
    "tak-dianggap.mp3"
  ]
};

async function getsongs(folder) {
  try {
    currFolder = folder;
    const folderName = folder.split('/').pop();
    
    if (folderSongs[folderName]) {
      songs = folderSongs[folderName].map(songName => ({
        name: songName,
        url: `/${folder}/${songName}`,
        displayName: songName,
        source: 'local'
      }));
    } else {
      console.error("No songs found for folder:", folderName);
      return [];
    }
    
    if (songs.length === 0) {
      console.error("No songs found in the folder.");
      return [];
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ol")[0];
    songUL.innerHTML = "";

    for (const song of songs) {
      songUL.innerHTML += `
        <div class="songInfo flex pointer">
          <img class="invert" src="music.svg" alt="music" />
          <div class="info">
            <div>${song.displayName}</div>
            <div>Saksham</div>
          </div>
          <div class="playNow flex justify-center item-center">
            <span>Play Now</span>
            <img class="invert" src="playbtn.svg" alt="">
          </div>
        </div>`;
    }

    Array.from(document.querySelector(".songList").querySelectorAll(".songInfo")).forEach((e, i) => {
      e.addEventListener("click", () => {
        songIndex = i;
        playMusic(songs[songIndex]);
        resetLoopIcon();
      });
    });
    
    return songs;
  } catch (error) {
    console.error("Error in getsongs:", error);
    return [];
  }
}


document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

const playMusic = (song, pause = false) => {
  if (pause) {
    currentSong.pause();
    play.src = "playbtn.svg";
    return;
  }

  if (!song || !song.url) {
    console.error("Song data is invalid.");
    return;
  }

  currentSong.src = song.url;
  
  currentSong.play().catch(error => {
    console.error("Error playing song:", error);
  });
  
  currentSong.loop = false;
  play.src = "pause.svg";

  document.querySelector(".songName").innerHTML = song.displayName;
  document.querySelector(".songTime").innerHTML = "00:00/00:00";
};


function secondsToMinutes(seconds) {
  seconds = Math.floor(seconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

async function main() {
  await getsongs("songs/first");

  if (songs.length > 0) {
    currentSong.src = songs[0].url;
    document.querySelector(".songName").innerHTML = songs[0].displayName;
    document.querySelector(".songTime").innerHTML = "00:00/00:00";
    play.src = "playbtn.svg";
  } else {
    console.error("No songs available to play.");
    return;
  }

  play.addEventListener("click", () => {
    if (isFirstPlay) {
      if (songs.length > 0) {
        playMusic(songs[songIndex]);
        isFirstPlay = false;
      }
    } else {
      if (currentSong.paused) {
        currentSong.play().catch(error => {
          console.error("Error playing song:", error);
        });
        play.src = "pause.svg";
      } else {
        currentSong.pause();
        play.src = "playbtn.svg";
      }
    }
  });

  currentSong.addEventListener("ended", () => {
    if (currentSong.loop) {
      currentSong.currentTime = 0;
      currentSong.play().catch(error => {
        console.error("Error replaying song:", error);
      });
    } else {
      if (songs.length > 0) {
        songIndex++;
        if (songIndex >= songs.length) {
          songIndex = 0;
        }
        playMusic(songs[songIndex]);
        resetLoopIcon();
      }
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${secondsToMinutes(
      currentSong.currentTime
    )}/${secondsToMinutes(currentSong.duration || 0)}`;

    const progress = (currentSong.currentTime / currentSong.duration) * 100;
    document.querySelector(".circle").style.left = `${progress}%`;
  });

  document.querySelector(".seekBar").addEventListener("click", (e) => {
    const seekBar = e.target.getBoundingClientRect();
    const clickPosition = (e.offsetX / seekBar.width) * currentSong.duration;
    currentSong.currentTime = clickPosition;
  });
}

document.querySelector(".previousbtn").addEventListener("click", () => {
  if (songs.length > 0) {
    songIndex--;
    if (songIndex < 0) {
      songIndex = songs.length - 1;
    }
    playMusic(songs[songIndex]);
    resetLoopIcon();
  }
});

document.querySelector(".nextbtn").addEventListener("click", () => {
  if (songs.length > 0) {
    songIndex++;
    if (songIndex >= songs.length) {
      songIndex = 0;
    }
    playMusic(songs[songIndex]);
    resetLoopIcon();
  }
});

document.querySelector(".loop").addEventListener("click", (e) => {
  currentSong.loop = !currentSong.loop;

  if (currentSong.loop) {
    e.target.classList.add("active");
  } else {
    e.target.classList.remove("active");
  }
});

let previousVolume = 1;

document.querySelector(".volumeimg").addEventListener("click", (e) => {
  const volumeRange = document.querySelector(".volumerange");

  if (currentSong.volume > 0) {
    previousVolume = currentSong.volume;
    currentSong.volume = 0;
    e.target.src = "mute.svg";
    volumeRange.value = 0;
  } else {
    currentSong.volume = previousVolume;
    e.target.src = "volume.svg";
    volumeRange.value = previousVolume * 100;
  }
});

document.querySelector(".volumerange").addEventListener("input", (e) => {
  currentSong.volume = parseInt(e.target.value) / 100;
  if (currentSong.volume === 0) {
    document.querySelector(".volumeimg").src = "mute.svg";
  } else {
    document.querySelector(".volumeimg").src = "volume.svg";
  }
});

Array.from(document.getElementsByClassName("card")).forEach(e => {
  e.addEventListener("click", async items => {
    const folder = items.currentTarget.dataset.folder;
    if (folder) {
      if (currentSong) {
        currentSong.pause();
        play.src = "playbtn.svg";
      }
      
      
      await getsongs(`songs/${folder}`);
      if (songs.length > 0) {
        songIndex = 0; 
        document.querySelector(".songName").innerHTML = songs[0].displayName;
        document.querySelector(".songTime").innerHTML = "00:00/00:00";
        play.src = "playbtn.svg"; 
        isFirstPlay = true; 
        currentSong.loop = false;
        resetLoopIcon();
      }
    }
  });
});

function resetLoopIcon() {
  const loopButton = document.querySelector(".loop");
  loopButton.classList.remove("active");
}

function left() {
  document.querySelector(".left").style.left = 0+"%";
}

function goleft() {
  document.querySelector(".left").style.left = -100 + "%";
}

main();
