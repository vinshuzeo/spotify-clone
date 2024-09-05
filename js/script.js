console.log("Lets write Javascript");
let currentSong = new Audio();
let songs;
let currFolder;
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  let songUL = document.querySelector(".songList ul");
  console.log(songUL);
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `
           <li class="song-item"> 
              <img class="invert" src="img/music.svg" alt="">
              <div class="info">
                  <span class="song-title">${song.replaceAll("%20", " ")}</span>
                  <span class="song-artist">Harry</span> <!-- Updated artist name -->
              </div>
              <div class="playnow">
                  <span>Play now</span>
                  <img class="invert" src="img/play.svg" alt="">
              </div>
          </li>`;
  }
  // Attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}

const playMusic = (track, pause = false) => {
  const url = `http://127.0.0.1:3000/${currFolder}/${track}`;
  console.log("Playing:", url);

  let audio = new Audio(url);

  if (currentSong) {
    currentSong.src = url;
  } else {
    currentSong = audio;
  }

  // If pause is not requested, play the song
  if (!pause) {
    currentSong
      .play()
      .then(() => {
        console.log("Playback started successfully");
        play.src = "img/pause.svg";
        document.querySelector(".songinfo").innerHTML = track.replaceAll(
          "%20",
          " "
        );
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
      })
      .catch((error) => {
        console.error("Error during playback:", error);
      });
  }
};

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      // Get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div class="card">
            <div data-folder="${folder}" class="play">
              <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <!-- Outer green circle -->
                <circle cx="50" cy="50" r="35" stroke="green" stroke-width="0" fill="none" />
                
                <!-- Solid black play button, centered inside the circle -->
                <polygon points="40,30 40,70 70,50" fill="black" />
              </svg>              
            </div>
            <img src="/songs/${folder}/cover.jpg" alt=""
              style="cursor: pointer" />
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`;
    }
  }
  // Load  the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      const folder = item.currentTarget.querySelector(".play").dataset.folder;
      console.log(`Card clicked. Folder: ${folder}`);
      if (folder === 'HoneySinghSongs') {  // Adjust to match your folder structure
        const songs = await getSongs(`songs/${folder}`);  // Adjust folder path if needed
        playMusic(songs[0])
        console.log(`Songs loaded from Honey Singh: ${songs}`);
      } else {
        const songs = await getSongs(`songs/${folder}`);
        playMusic(songs[0])
        console.log(`Songs loaded: ${songs}`);
      }
    });
  });
}

async function main() {

  // Display all the albums on the page
  displayAlbums();
  // Get the list of all the songs
  songs = await getSongs("songs/ncs");
  playMusic(songs[0], true);
  console.log(songs);

  
  // Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for Time Update
  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
  // Add an event  listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });
  //Add an event listener for hamburger
  document.querySelector(".hamburgerCont").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  //Add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-125%";
  });
  //Add an event listener to previous
  previous.addEventListener("click", () => {
    console.log("Previous clicked");
    console.log(currentSong);
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  //Add an event listener to next
  next.addEventListener("click", () => {
    console.log("Next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log(e, e.target, e.target.value);
      currentSong.volume = parseInt(e.target.value) / 100;
    });
  const volumeControl = document.querySelector(".volume-control");

  const slider = document.querySelector(".volume-control");

  // Set initial value and gradient
  slider.value = 50;
  slider.style.background = `linear-gradient(to right, #000000 50%, #ffffff 50%)`;

  slider.addEventListener("input", function () {
    const value = this.value;
    // Update the background gradient dynamically with inverted colors
    this.style.background = `linear-gradient(to right, #000000 ${value}%, #ffffff ${value}%)`;
  });
   
  // Add event listener to mute the track  
  document.querySelector(".volume>img").addEventListener("click", e => {
    console.log(e.target);
    console.log("changing", e.target.src);
    
    const volumeSlider = document.querySelector(".range").getElementsByTagName("input")[0];
  
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      volumeSlider.value = 0;
      volumeSlider.style.background = "linear-gradient(to right, black 0%, black 0%, white 0%, white 100%)"; // Fully black since volume is 0
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.10;
      volumeSlider.value = 10;
      volumeSlider.style.background = "linear-gradient(to right, black 0%, black 10%, white 10%, white 100%)"; // Adjust based on volume level
    }
  });
  
  


}

main();
