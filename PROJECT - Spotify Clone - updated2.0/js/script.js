console.log("js running...");
let currentSong = new Audio();
let songs;
let currFolder;
const volumeRange = document.querySelector('.range');

const songAttributions = {
    "Maestro Chives, Egzod, Neoni - Royalty [NCS Release].mp3": {
        title: "Egzod, Maestro Chives, Neoni - Royalty",
        attribution: [
            "Song: Egzod, Maestro Chives, Neoni - Royalty [NCS Release]",
            "Music provided by NoCopyrightSounds",
            "Free Download/Stream: http://ncs.io/Royalty",
            "Watch: http://ncs.lnk.to/RoyaltyAT/youtube"
        ]
    },
    "ROY KNOX - Your Poison [NCS Release].mp3": {
        title: "ROY KNOX - Your Poison",
        attribution: [
            "Song: ROY KNOX - Your Poison",
            "Music provided by NoCopyrightSounds",
            "Free Download/Stream: http://ncs.io/YourPoison",
            "Watch: http://ncs.lnk.to/YourPoisonAT/youtube"
        ]
    },
    "THIRST - AIWA [NCS Release].mp3": {
        title: "THIRST - AIWA",
        attribution: [
            "Song: THIRST - AIWA",
            "Music provided by NoCopyrightSounds",
            "Free Download/Stream: http://ncs.io/AIWA",
            "Watch: http://ncs.lnk.to/AIWAAT/youtube"
        ]
    },
    "Warriyo, Laura Brehm - Mortals (feat. Laura Brehm) [NCS Release].mp3": {
        title: "Warriyo - Mortals (feat. Laura Brehm)",
        attribution: [
            "Song: Warriyo - Mortals (feat. Laura Brehm) [NCS Release]",
            "Music provided by NoCopyrightSounds",
            "Free Download/Stream: http://ncs.io/mortals",
            "Watch: http://youtu.be/yJg-Y5byMMw"
        ]
    },
    "TOKYO MACHINE, NEFFEX - Desperate [NCS Release].mp3": {
        title: "NEFFEX & TOKYO MACHINE - Desperate",
        attribution: [
            "Song: NEFFEX & TOKYO MACHINE - Desperate [NCS Release]",
            "Music provided by NoCopyrightSounds",
            "Free Download/Stream: http://ncs.io/TM_Desperate",
            "Watch: http://ncs.lnk.to/TM_DesperateAT/youtube"
        ]
    }   
};

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}/`)
    let response = await a.text()
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.querySelectorAll("li a");

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // show all the songs in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""; // Clear the list
    for (const song of songs) {
        // Decode the song name to remove URL-encoded characters
        let decodedSong = decodeURIComponent(song);
        songUL.innerHTML += `
            <li>
                <i class="ri-music-2-fill svg"></i>
                <div class="info">
                    <div>${decodedSong.replaceAll("%20", " ")}</div>
                    <div>Artist</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <i class="ri-play-large-fill"></i>
                </div>
            </li>`;
    }
    

    // Attach an event listener to play each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(element => {
        element.addEventListener("click", () => {
            let value = element.querySelector(".info").firstElementChild.innerHTML.trim();
            value = decodeURIComponent(value); // Decode URL-encoded characters
            console.log(value);
            playMusic(value);
        });
    });

    return songs;

}



function updateTicker(track) {
    // Decode the track name and trim whitespace
    const songName = decodeURIComponent(track).trim();

    // Log the song name being searched
    console.log('Searching for attribution for:', songName);

    // Find the exact matching song in songAttributions
    const attribution = songAttributions[songName];

    // Log the available keys in songAttributions for debugging
    console.log('Available song keys:', Object.keys(songAttributions));

    if (attribution) {
        // Construct the ticker content
        const tickerContent = attribution.attribution.join(' | ');

        const tickerWrapper = document.querySelector("#ticker-wrapper");
        tickerWrapper.innerHTML = `<div class="ticker-text" id="ticker-text">${tickerContent}</div>`;
    } else {
        console.log('No attribution found for:', songName);
        const tickerWrapper = document.querySelector("#ticker-wrapper");
        tickerWrapper.innerHTML = `<div class="ticker-text" id="ticker-text">Song: ${songName} | Music provided by NoCopyrightSounds</div>`;
    }

    console.log('Current track:', track);
    console.log('Song name for attribution:', songName);
}

function playMusic(track, pause = false) {
    const playbutton = document.querySelector("#play");
    const pausebutton = document.querySelector("#pause");

    currentSong.src = `${currFolder}/${track}`;
    updateTicker(track);  // Update ticker with current song's attribution

    if (!pause) {
        currentSong.play();
        pausebutton.style.display = "block";
        playbutton.style.display = "none";
    } else {
        playbutton.style.display = "block";
        pausebutton.style.display = "none";
    }

    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch('songs/')
    let response = await a.text()
    let cardcontainer = document.querySelector(".cardcontainer");
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);
    
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element.href.includes("/songs/")) {
            let folder = element.href.split("/").slice(-1)[0];
            try {
                let a = await fetch(`songs/${folder}/info.json`);
                if (!a.ok) throw new Error("Failed to load metadata.");
                let response = await a.json();
                // Append to card container
                cardcontainer.innerHTML += `  
                    <div data-folder="songs/${folder}" class="card">
                        <div class="play">
                            <div><i class="ri-play-large-fill"></i></div>
                        </div>
                        <img  style=" height: 249px; width: 218px; object-fit: cover; object-position: center;" src="songs/${folder}/cover.jpeg" alt="cover img">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
            } catch (error) {
                console.error("Error fetching metadata:", error);
            }
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs");
            document.querySelector(".left").style.left = "0%";
            songs = await getSongs(`${item.currentTarget.dataset.folder}`);
    
            // Decode all songs in the array
            songs = songs.map(song => decodeURIComponent(song));
    
            if (songs.length > 0) {
                console.log(songs); // For debugging
                playMusic(songs[0]); // Play the first song
            }
        });
    });
    
}

async function main() {
    // Get the list of all the songs
    await getSongs("songs/cs");

    // By default play the first song
    // playMusic(songs[0], true);

    displayAlbums();

    // Desplay all the albums on the page

    // Attach an event listener to play, next and pervious buttons
    play.addEventListener("click", () => {
        currentSong.play();
        play.style.display = "none";
        pause.style.display = "block";
    })

    pause.addEventListener("click", () => {
        currentSong.pause();
        play.style.display = "block";
        pause.style.display = "none";
    })

    // Listen an event fot time update
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        // Update progress bar
        let progressBar = document.querySelector(".circle")
        progressBar.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Attach an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // add an  event listener to hamburger menu
    document.querySelector(".hamburger").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = "0%";
    })
    // add an  event listener to closing menu
    document.querySelector(".close").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = "-120%";
    })

    // Previous button event listener
    previous.addEventListener("click", (e) => {
        console.log("Previous clicked");
        // Get the current song name by decoding the URL and getting just the filename
        let currentSongName = decodeURIComponent(currentSong.src.split('/').pop());
        
        // Find the index of the current song in the songs array
        let index = songs.findIndex(song => decodeURIComponent(song) === currentSongName);
        
        console.log("Current song name:", currentSongName);
        console.log("Current song index:", index);
        console.log("Songs array:", songs);

        if (index === -1) {
            console.error("Current song not found in songs array.");
            return;
        }

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        } else {
            alert("This is the first song");
        }
    });

    // Next button event listener
    next.addEventListener("click", (e) => {
        console.log("Next clicked");
        // Get the current song name by decoding the URL and getting just the filename
        let currentSongName = decodeURIComponent(currentSong.src.split('/').pop());
        
        // Find the index of the current song in the songs array
        let index = songs.findIndex(song => decodeURIComponent(song) === currentSongName);
        
        console.log("Current song name:", currentSongName);
        console.log("Current song index:", index);
        console.log("Songs array:", songs);

        if (index === -1) {
            console.error("Current song not found in songs array.");
            return;
        }

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            alert("This is the last song");
        }
    });

    // Add an event to volume control
    document.querySelector(".volumecont").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e, e.target, e.target.value);
        // console.log("Setting volume to: ", e.target.value, "/100");
        currentSong.volume = (e.target.value) / 100;

        if (e.target.value > 0) {
            mutebutton.style.display = "none";
            volumebutton.style.display = "block";
        } else {
            mutebutton.style.display = "block";
            volumebutton.style.display = "none";
        }
    })

    // addevent listener to mute the volume control
    document.querySelector(".volumecont").getElementsByTagName("i")[0].addEventListener("click", (e) => {
        console.log("Mute/Unmute clicked");

        const volumebutton = document.querySelector("#volumebtn");
        const mutebutton = document.querySelector("#mutebtn");
        if (currentSong.muted) {
            // Unmute the audio and toggle buttons
            currentSong.muted = false;
            volumebutton.style.display = "block";
            mutebutton.style.display = "none";
            volumeRange.value = currentSong.volume * 100;
            // console.log("Audio unmuted");
        } else {
            // Mute the audio and toggle buttons
            volumeRange.value = 0
            currentSong.muted = true;
            volumebutton.style.display = "none";
            mutebutton.style.display = "block";
            // console.log("Audio muted");
        }
    });

    document.querySelector(".volumecont").getElementsByTagName("i")[1].addEventListener("click", (e) => {
        console.log("Mute/Unmute clicked");

        const volumebutton = document.querySelector("#volumebtn");
        const mutebutton = document.querySelector("#mutebtn");

        // Unmute the audio and toggle buttons
        currentSong.muted = false;
        volumebutton.style.display = "block";
        mutebutton.style.display = "none";
        volumeRange.value = currentSong.volume * 50;
        // console.log("Audio unmuted");
    });
}



main()
