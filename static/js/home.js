document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('audio-player');

    const playerTitle = document.getElementById('player-title');
    const playerArtist = document.getElementById('player-artist');
    const playerImg = document.getElementById('player-img');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');

    const seekSlider = document.getElementById('seek-slider');
    const progressFill = document.getElementById('progress-fill');
    const currentTimeEl = document.getElementById('current-time');
    const totalDurationEl = document.getElementById('total-duration');

    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.getElementById('volume-icon');
    const muteBtn = document.getElementById('mute-btn');

    let isDragging = false;
    let currentCardButton = null;
    let previousVolume = 1;
    const cardPlayButtons = document.querySelectorAll('.play-btn');

    cardPlayButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();

            const songSrc = this.getAttribute('data-src');
            const songTitle = this.getAttribute('data-title');
            const songArtist = this.getAttribute('data-artist');
            const songImg = this.getAttribute('data-img');
            const cardIcon = this.querySelector('i');

            if (currentCardButton === this) {
                togglePlayPause();
            } else {
                if (currentCardButton) {
                    currentCardButton.querySelector('i')
                        .classList.replace('fa-pause', 'fa-play');
                }

                audio.src = songSrc;
                audio.play();

                currentCardButton = this;
                cardIcon.classList.replace('fa-play', 'fa-pause');

                updateBottomPlayerUI(songTitle, songArtist, songImg, true);
            }
        });
    });
    function togglePlayPause() {
        if (audio.paused) {
            audio.play();
            updatePlayIcons(true);
        } else {
            audio.pause();
            updatePlayIcons(false);
        }
    }

    function updatePlayIcons(isPlaying) {
        playIcon.classList.replace(isPlaying ? 'fa-play' : 'fa-pause',
                                   isPlaying ? 'fa-pause' : 'fa-play');

        if (currentCardButton) {
            currentCardButton.querySelector('i')
                .classList.replace(isPlaying ? 'fa-play' : 'fa-pause',
                                   isPlaying ? 'fa-pause' : 'fa-play');
        }
    }

    function updateBottomPlayerUI(title, artist, imgUrl, isPlaying) {
        playerTitle.textContent = title;
        playerArtist.textContent = artist;
        if (imgUrl) playerImg.src = imgUrl;
        updatePlayIcons(isPlaying);
    }

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    audio.addEventListener('timeupdate', () => {
        if (!isDragging) {
            const progress = (audio.currentTime / audio.duration) * 100 || 0;
            seekSlider.value = progress;
            progressFill.style.width = `${progress}%`;
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        totalDurationEl.textContent = formatTime(audio.duration);
    });

    seekSlider.addEventListener('input', (e) => {
        isDragging = true;
        const val = e.target.value;
        progressFill.style.width = `${val}%`;
        currentTimeEl.textContent = formatTime((val / 100) * audio.duration);
    });

    seekSlider.addEventListener('change', (e) => {
        isDragging = false;
        audio.currentTime = (e.target.value / 100) * audio.duration;
    });
    volumeSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        audio.volume = val;

        const fillBar = document.querySelector('.volume-fill');
        if(fillBar) fillBar.style.width = `${val * 100}%`;

        if (val == 0) volumeIcon.className = 'fa-solid fa-volume-xmark';
        else if (val < 0.5) volumeIcon.className = 'fa-solid fa-volume-low';
        else volumeIcon.className = 'fa-solid fa-volume-high';
    });

    muteBtn.addEventListener('click', () => {
        const fillBar = document.querySelector('.volume-fill');
        if (audio.volume > 0) {
            previousVolume = audio.volume;
            audio.volume = 0;
            volumeSlider.value = 0;
            volumeIcon.className = 'fa-solid fa-volume-xmark';
            if(fillBar) fillBar.style.width = '0%';
        } else {
            audio.volume = previousVolume;
            volumeSlider.value = previousVolume;
            if(fillBar) fillBar.style.width = `${previousVolume * 100}%`;
            volumeIcon.className = previousVolume < 0.5
                ? 'fa-solid fa-volume-low'
                : 'fa-solid fa-volume-high';
        }
    });
    audio.addEventListener('ended', () => {
        updatePlayIcons(false);
    });
    const modalElement = document.getElementById('playlistModal');
    if (modalElement) {
        playlistModal = new bootstrap.Modal(modalElement);
    }
});
var playlistModal; 

function openPlaylistModal() {
    if (playlistModal) playlistModal.show();
}

function createPlaylist() {
    const input = document.getElementById('newPlaylistName');
    const name = input.value || "My Playlist";

    fetch('/create_playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name }),
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Playlist created: " + data.name);
            location.reload(); 
        } else {
            alert("Error creating playlist");
        }
    })
    .catch(err => console.error("Fetch Error:", err));
}

function addToPlaylist(playlistId, songId) {
    fetch('/add_to_playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlist_id: playlistId, song_id: songId })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
    })
    .catch(err => console.error(err));
}
