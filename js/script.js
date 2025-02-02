console.log("js running...");
let currentSong = new Audio();
let songs;
let currFolder;
const volumeRange = document.querySelector('.range');

const baseURL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? ""
    : "/abc"; // Replace 'music-player' with your actual repository name

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
        // Clean up the folder path and ensure it starts with 'songs/'
        const folderPath = folder.startsWith('songs/') ? folder : `songs/${folder}`;
        
        // For GitHub Pages, always try to get songs.json first
        const songsJsonUrl = `${baseURL}/${folderPath}/songs.json`;
        const songsResponse = await fetch(songsJsonUrl);
        
        if (songsResponse.ok) {
            const data = await songsResponse.json();
            updateSongsList(data.songs);
            return data.songs;
        }

        // If songs.json fails, try direct folder access (for local development)
        const response = await fetch(`${baseURL}/${folderPath}`);
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

        updateSongsList(mp3Files);
        return mp3Files;
    } catch (error) {
        console.error("Error in getSongs:", error);
        return [];
    }
}

// Separate function to update the songs list UI
function updateSongsList(songs) {
    const songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

    songs.forEach(song => {
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
    });

    Array.from(songUL.getElementsByTagName("li")).forEach((li, index) => {
        li.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });
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
    currentSong.src = `${baseURL}/${currFolder}/${track}`;
    
    if (!pause) {
        currentSong.play();
        let playButton = document.getElementById("play");
        let pauseButton = document.getElementById("pause");
        playButton.style.display = "none";
        pauseButton.style.display = "block";
        triggerHapticFeedback();
    }

    // Update song info display
    let songName = decodeURIComponent(track.replace('.mp3', ''));
    document.querySelector(".songinfo").innerHTML = songName;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    
    // Add this line to update the ticker
    updateTicker(track);
}

async function getAlbumInfo(folder) {
    try {
        const response = await fetch(`${baseURL}/songs/${folder}/info.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const info = await response.json();
        return {
            title: info.title || folder,
            description: info.description || "Music Album"
        };
    } catch (error) {
        console.error("Error fetching album info:", error);
        return {
            title: folder,
            description: "Music Album"
        };
    }
}

async function displayAlbums() {
    try {
        const folders = ['EDM Hits', 'Another Songs', 'Another Songs - Copy'];
        let cardcontainer = document.querySelector(".cardcontainer");
        cardcontainer.innerHTML = '';
        
        for (const folder of folders) {
            try {
                // Get album info from info.json
                const albumInfo = await getAlbumInfo(folder);
                
                // Update the cover image path
                const coverPath = `${baseURL}/songs/${folder}/cover.jpeg`;
                
                cardcontainer.innerHTML += `  
                    <div data-folder="songs/${folder}" class="card">
                        <div class="play">
                            <div><i class="ri-play-large-fill"></i></div>
                        </div>
                        <img style="height: 249px; width: 218px; object-fit: cover; object-position: center;" 
                             src="${coverPath}" alt="cover img">
                        <h2>${albumInfo.title}</h2>
                        <p>${albumInfo.description}</p>
                    </div>`;
            } catch (error) {
                console.error("Error processing folder:", folder, error);
            }
        }

        // Add click events to cards
        const hamburger = document.querySelector(".hamburger");
        const leftSidebar = document.querySelector(".left");

        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                const folderPath = item.currentTarget.dataset.folder;
                songs = await getSongs(folderPath);
                if (songs.length > 0) {
                    currFolder = folderPath;
                    playMusic(songs[0]);

                    // Activate the hamburger menu
                    if (leftSidebar) {
                        leftSidebar.classList.add("active");
                    }
                }
            });
        });
    } catch (error) {
        console.error("Error in displayAlbums:", error);
    }
}

async function main() {
    // Display all the albums on the page
    displayAlbums();

    // Attach an event listener to play, next and pervious buttons
    play.addEventListener("click", () => {
        currentSong.play();
        play.style.display = "none";
        pause.style.display = "block";
        triggerHapticFeedback();
    })

    pause.addEventListener("click", () => {
        currentSong.pause();
        let playButton = document.getElementById("play");
        let pauseButton = document.getElementById("pause");
        playButton.style.display = "block";
        pauseButton.style.display = "none";
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

    // Add haptic feedback to all interactive elements
    document.querySelectorAll('.card, .songbuttons i, .volumecont i, .seekbar').forEach(element => {
        element.addEventListener('touchstart', () => {
            triggerHapticFeedback();
        });
    });

    // Add haptic feedback for volume changes
    document.querySelector('.range').addEventListener('input', () => {
        triggerHapticFeedback();
    });
}

function triggerHapticFeedback() {
    // Try the Vibration API first
    if (navigator.vibrate) {
        navigator.vibrate(50); // 50ms vibration
        return;
    }

    // Fallback for iOS devices
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.hapticFeedback) {
        window.webkit.messageHandlers.hapticFeedback.postMessage("selection");
        return;
    }
}


document.addEventListener("DOMContentLoaded", function () {
    const menu = document.querySelector(".left");
    const hamburger = document.querySelector(".hamburger");
    const closeBtn = document.querySelector(".close");

    function openMenu() {
        menu.classList.add("active");
    }

    function closeMenu() {
        menu.classList.remove("active");
    }

    // Open sidebar when clicking the hamburger
    hamburger.addEventListener("click", openMenu);

    // Close sidebar when clicking the close button
    closeBtn.addEventListener("click", closeMenu);

    // Close sidebar when clicking outside of it
    document.addEventListener("click", function (event) {
        if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
            closeMenu();
        }
    });
});

main();
