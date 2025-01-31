console.log("js running...");
let currentSong = new Audio();
let songs;
let currFolder;
const volumeRange = document.querySelector('.range');

const baseURL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? ""  // Local development
    : "/your-repo-name"; // Replace with your GitHub repository name

const songAttributions = {
    // ... (keep existing attributions)
    
    "NEFFEX - Desperate [NCS Release].mp3": {
        title: "NEFFEX - Desperate",
        attribution: [
            "Song: NEFFEX - Desperate [NCS Release]",
            "Music provided by NoCopyrightSounds",
            "Free Download/Stream: http://ncs.io/Desperate",
            "Watch: http://ncs.lnk.to/DesperateAT/youtube"
        ]
    },

    "Drama B, SKAN - Muscle Up (feat. Drama B & Ryo) [NCS Release].mp3": {
        title: "Skan - Muscle Up (feat. Drama B & Ryo)",
        attribution: [
            "Song: Skan - Muscle Up (feat. Drama B & Ryo)",
            "Music provided by NoCopyrightSounds",
            "Free Download/Stream: http://ncs.io/MuscleUp",
            "Watch: http://ncs.lnk.to/MuscleUpAT/youtube"
        ]
    }
    // ... (keep other attributions)
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
    try {
        const response = await fetch(`${baseURL}/${folder}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        const div = document.createElement('div');
        div.innerHTML = text;
        
        const links = Array.from(div.getElementsByTagName('a'));
        const mp3Files = links
            .filter(link => link.href.endsWith('.mp3'))
            .map(link => decodeURIComponent(link.href.split('/').pop()));

        const songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";

        for (const song of mp3Files) {
            songUL.innerHTML += `
                <li>
                    <i class="ri-music-2-fill svg"></i>
                    <div class="info">
                        <div>${decodeURIComponent(song.replace('.mp3', ''))}</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <i class="ri-play-large-fill"></i>
                    </div>
                </li>`;
        }

        Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((li, index) => {
            li.addEventListener("click", () => {
                playMusic(mp3Files[index]);
            });
        });

        return mp3Files;
    } catch (error) {
        console.error("Error in getSongs:", error);
        return [];
    }
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
        triggerHapticFeedback();
    } else {
        playbutton.style.display = "block";
        pausebutton.style.display = "none";
    }

    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track).replace('.mp3', '');
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    try {
        // For GitHub Pages and local development
        const folders = ['EDM Hits', 'Another Songs', 'Another Songs - copy']; // Add all your folder names here
        let cardcontainer = document.querySelector(".cardcontainer");
        cardcontainer.innerHTML = '';
        
        for (const folder of folders) {
            try {
                // First check if info.json exists
                let title = folder;
                let description = "Music Album";
                
                try {
                    const infoResponse = await fetch(`${baseURL}/songs/${folder}/info.json`);
                    if (infoResponse.ok) {
                        const infoData = await infoResponse.json();
                        title = infoData.title;
                        description = infoData.description;
                    }
                } catch (e) {
                    console.log("Using default title and description for folder:", folder);
                }
                
                cardcontainer.innerHTML += `  
                    <div data-folder="songs/${folder}" class="card">
                        <div class="play">
                            <div><i class="ri-play-large-fill"></i></div>
                        </div>
                        <img style="height: 249px; width: 218px; object-fit: cover; object-position: center;" 
                             src="${baseURL}/songs/${folder}/cover.jpeg" alt="cover img">
                        <h2>${title}</h2>
                        <p>${description}</p>
                    </div>`;
            } catch (error) {
                console.error("Error processing folder:", folder, error);
            }
        }

        // Add click events to cards
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                const folderPath = item.currentTarget.dataset.folder;
                songs = await getSongs(folderPath);
                if (songs.length > 0) {
                    playMusic(songs[0]);
                }
            });
        });
    } catch (error) {
        console.error("Error in displayAlbums:", error);
    }
}

async function main() {
    // Remove the initial getSongs call since we don't have a "cs" folder anymore
    displayAlbums();

    // Desplay all the albums on the page

    // Attach an event listener to play, next and pervious buttons
    play.addEventListener("click", () => {
        currentSong.play();
        play.style.display = "none";
        pause.style.display = "block";
        triggerHapticFeedback();
    })

    pause.addEventListener("click", () => {
        currentSong.pause();
        play.style.display = "block";
        pause.style.display = "none";
        triggerHapticFeedback();
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

    // Hamburger menu click handler
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").classList.add("active");
    });

    // Close button click handler
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").classList.remove("active");
    });

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
        triggerHapticFeedback();
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
        triggerHapticFeedback();
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

    // Initialize 3D scroll effect
    init3DScroll();
    
    // Re-initialize on window resize
    window.addEventListener('resize', init3DScroll);
}

function triggerHapticFeedback() {
    if (navigator.vibrate) {
        navigator.vibrate(50); // Vibrate for 50 milliseconds
    }
}

main()
