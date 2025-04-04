// Add your music player functionality here
document.addEventListener('DOMContentLoaded', function() {
    // Initialize playlists and liked songs from localStorage
    let playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    let likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];
    let recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    // Auth Modal Functionality
    const userIcon = document.querySelector('.user');
    const authModal = document.getElementById('authModal');
    const closeModal = document.querySelector('.close-modal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Back Button Functionality
    const backButton = document.getElementById('backButton');
    const profilePage = document.getElementById('profilePage');
    const mainContent = document.querySelector('.song_side > .content');
    const popularSongs = document.querySelector('.popular_song');
    const popularArtists = document.querySelector('.popular_artists');

    userIcon.addEventListener('click', () => {
        if (!currentUser) {
            authModal.style.display = 'block';
        } else {
            // Show profile page
            profilePage.style.display = 'block';
            mainContent.style.display = 'none';
            popularSongs.style.display = 'none';
            popularArtists.style.display = 'none';
            backButton.style.display = 'block';
            updateProfilePage();
        }
    });

    closeModal.addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (tab.dataset.tab === 'login') {
                loginForm.style.display = 'flex';
                signupForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                signupForm.style.display = 'flex';
            }
        });
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        
        // Simple validation (in real app, this would check against a backend)
        if (email && password) {
            currentUser = { email };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            userIcon.querySelector('span').textContent = email.split('@')[0];
            authModal.style.display = 'none';

            // Display success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.textContent = 'You have been logged in successfully!';
            document.body.appendChild(successMessage);

            // Remove the message after a few seconds
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        }
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = signupForm.querySelector('input[type="text"]').value;
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;
        const confirmPassword = signupForm.querySelector('input[type="password"]:last-of-type').value;

        if (password === confirmPassword && email && username) {
            currentUser = { email, username };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            userIcon.querySelector('span').textContent = username;
            authModal.style.display = 'none';
        }
    });

    // Initialize music player
    const music = new Audio('tolerate it.mp3');
    let isPlaying = false;

    // Function to play music
    function playMusic() {
        if (!isPlaying) {
            music.play();
            isPlaying = true;
            updatePlayButtons();
            addToRecentlyPlayed();
        } else {
            music.pause();
            isPlaying = false;
            updatePlayButtons();
        }
    }

    // Function to update play buttons
    function updatePlayButtons() {
        const playButtons = document.querySelectorAll('.playListPlay');
        playButtons.forEach(button => {
            button.className = isPlaying ? 'bi playListPlay bi-pause-circle-fill' : 'bi playListPlay bi-play-circle-fill';
        });
    }

    // Function to add song to recently played
    function addToRecentlyPlayed() {
        const currentSong = {
            title: 'Tolerate It',
            artist: 'Taylor Swift',
            timestamp: new Date().toISOString()
        };
        recentlyPlayed.unshift(currentSong);
        if (recentlyPlayed.length > 10) {
            recentlyPlayed.pop();
        }
        localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
        updateRecentlyPlayedList();
    }

    // Function to update recently played list
    function updateRecentlyPlayedList() {
        const menuSong = document.querySelector('.menu_song');
        const existingContainer = document.querySelector('.recently-played-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = document.createElement('div');
        container.className = 'recently-played-container';
        menuSong.appendChild(container);

        if (recentlyPlayed.length === 0) {
            container.innerHTML = '<li class="songItem"><h5>No recently played songs</h5></li>';
            return;
        }

        recentlyPlayed.forEach((song, index) => {
            const songElement = document.createElement('li');
            songElement.className = 'songItem';
            songElement.innerHTML = `
                <span><i class="fas fa-history"></i></span>
                <h5>${song.title}
                    <div class="subtitle">${song.artist}</div>
                </h5>
                <i class="fas fa-trash delete-btn" data-index="${index}"></i>
                <i class="bi playListPlay bi-play-circle-fill"></i>
            `;
            container.appendChild(songElement);
        });

        // Add delete functionality
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(e.target.dataset.index);
                recentlyPlayed.splice(index, 1);
                localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
                updateRecentlyPlayedList();
            });
        });
    }

    // Add click event listeners to all play buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('playListPlay')) {
            playMusic();
        }
    });

    // Update liked songs functionality
    function toggleLikeSong(song) {
        const songTitle = song.querySelector('h5').textContent;
        const songSubtitle = song.querySelector('.subtitle').textContent;
        const likeBtn = song.querySelector('.like-btn');
        
        if (likedSongs.some(s => s.title === songTitle)) {
            likedSongs = likedSongs.filter(s => s.title !== songTitle);
            likeBtn.classList.remove('active');
        } else {
            likedSongs.push({ title: songTitle, artist: songSubtitle });
            likeBtn.classList.add('active');
        }
        
        localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
        updateLikedSongsPlaylist();
    }

    // Function to update the liked songs playlist
    function updateLikedSongsPlaylist() {
        const menuSong = document.querySelector('.menu_song');
        const existingContainer = document.querySelector('.liked-songs-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = document.createElement('div');
        container.className = 'liked-songs-container';
        menuSong.appendChild(container);

        if (likedSongs.length === 0) {
            container.innerHTML = '<li class="songItem"><h5>No liked songs yet</h5></li>';
            return;
        }

        likedSongs.forEach(song => {
            const songElement = document.createElement('li');
            songElement.className = 'songItem';
            songElement.innerHTML = `
                <span><i class="fas fa-heart"></i></span>
                <h5>${song.title}
                    <div class="subtitle">${song.artist}</div>
                </h5>
                <i class="fas fa-heart like-btn active"></i>
                <i class="bi playListPlay bi-play-circle-fill"></i>
            `;
            container.appendChild(songElement);
        });
    }

    // Update playlist click handler
    document.querySelector('.playlist').addEventListener('click', (e) => {
        const playlistItem = e.target.closest('h4');
        if (playlistItem) {
            document.querySelectorAll('.playlist h4').forEach(item => item.classList.remove('active'));
            playlistItem.classList.add('active');
            
            // Clear any existing containers
            const existingContainers = document.querySelectorAll('.recently-played-container, .liked-songs-container, .playlist-songs-container');
            existingContainers.forEach(container => container.remove());
            
            if (playlistItem.querySelector('.fa-heart')) {
                // Show liked songs
                updateLikedSongsPlaylist();
            } else if (playlistItem.querySelector('.fa-history')) {
                // Show recently played
                updateRecentlyPlayedList();
            } else if (playlistItem.classList.contains('custom-playlist')) {
                // Show custom playlist
                const playlistName = playlistItem.textContent.trim();
                const playlist = playlists.find(p => p.name === playlistName);
                if (playlist) {
                    showPlaylistSongs(playlist);
                }
            }
        }
    });

    // Function to show playlist songs
    function showPlaylistSongs(playlist) {
        const menuSong = document.querySelector('.menu_song');
        const existingContainer = document.querySelector('.playlist-songs-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = document.createElement('div');
        container.className = 'playlist-songs-container';
        menuSong.appendChild(container);

        if (playlist.songs.length === 0) {
            container.innerHTML = '<li class="songItem"><h5>No songs in this playlist</h5></li>';
            return;
        }

        playlist.songs.forEach(song => {
            const songElement = document.createElement('li');
            songElement.className = 'songItem';
            songElement.innerHTML = `
                <span><i class="fas fa-music"></i></span>
                <h5>${song.title}
                    <div class="subtitle">${song.artist}</div>
                </h5>
                <i class="fas fa-heart like-btn"></i>
                <i class="bi playListPlay bi-play-circle-fill"></i>
            `;
            container.appendChild(songElement);
        });
    }

    // Function to add song to playlist
    function addSongToPlaylist(song, playlistName) {
        const playlist = playlists.find(p => p.name === playlistName);
        if (playlist) {
            const songTitle = song.querySelector('h5').textContent;
            const songSubtitle = song.querySelector('.subtitle').textContent;
            
            if (!playlist.songs.some(s => s.title === songTitle)) {
                playlist.songs.push({
                    title: songTitle,
                    artist: songSubtitle
                });
                localStorage.setItem('playlists', JSON.stringify(playlists));
                updatePlaylistsList();
                if (document.querySelector('.playlist h4.active').textContent === playlistName) {
                    showPlaylistSongs(playlist);
                }
            }
        }
    }

    // Add context menu for songs
    document.addEventListener('contextmenu', (e) => {
        const songItem = e.target.closest('.songItem');
        if (songItem) {
            e.preventDefault();
            const menu = document.createElement('div');
            menu.className = 'context-menu';
            menu.innerHTML = `
                <div class="menu-item" data-action="like">
                    <i class="fas fa-heart"></i> Like
                </div>
                <div class="menu-item" data-action="add-to-playlist">
                    <i class="fas fa-plus"></i> Add to Playlist
                </div>
            `;
            
            menu.style.position = 'fixed';
            menu.style.left = e.pageX + 'px';
            menu.style.top = e.pageY + 'px';
            document.body.appendChild(menu);

            menu.addEventListener('click', (e) => {
                const action = e.target.closest('.menu-item')?.dataset.action;
                if (action === 'like') {
                    toggleLikeSong(songItem);
                } else if (action === 'add-to-playlist') {
                    const playlistName = prompt('Enter playlist name to add to:');
                    if (playlistName) {
                        addSongToPlaylist(songItem, playlistName);
                    }
                }
                menu.remove();
            });

            document.addEventListener('click', () => menu.remove(), { once: true });
        }
    });

    // Initialize playlists
    updateLikedSongsPlaylist();
    updateRecentlyPlayedList();

    // Remove recommended section
    const recommendedSection = document.querySelector('.playlist h4:last-of-type');
    if (recommendedSection) {
        recommendedSection.remove();
    }

    // Add click event for main play button
    const mainPlayBtn = document.querySelector('.content .buttons button:first-child');
    mainPlayBtn.addEventListener('click', function() {
        // Hide all artist profiles
        document.querySelectorAll('.artist-profile').forEach(profile => {
            profile.style.display = 'none';
        });

        // Show Taylor Swift's profile
        const taylorProfile = document.getElementById('taylor-swift');
        if (taylorProfile) {
            taylorProfile.style.display = 'block';
            taylorProfile.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // Artist Profile Display
    const artistItems = document.querySelectorAll('.popular_artists .item li');
    const artistProfiles = document.querySelectorAll('.artist-profile');

    // Hide all artist profiles initially
    artistProfiles.forEach(profile => {
        profile.style.display = 'none';
    });

    // Add click event listeners to artist items
    artistItems.forEach(item => {
        item.addEventListener('click', function() {
            const artistId = this.getAttribute('data-artist');
            
            // Hide all artist profiles
            artistProfiles.forEach(profile => {
                profile.style.display = 'none';
            });

            // Show the clicked artist's profile
            const selectedProfile = document.getElementById(artistId);
            if (selectedProfile) {
                selectedProfile.style.display = 'block';
                selectedProfile.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Add event listener for home button
    document.querySelectorAll('.artist-profile nav ul li').forEach(item => {
        item.addEventListener('click', function() {
            if (this.textContent === 'Home') {
                // Hide all artist profiles
                document.querySelectorAll('.artist-profile').forEach(profile => {
                    profile.style.display = 'none';
                });
                // Show main content
                document.querySelector('.song_side > .content').style.display = 'block';
                document.querySelector('.popular_song').style.display = 'block';
                document.querySelector('.popular_artists').style.display = 'block';
            }
        });
    });

    // Create playlist button functionality
    const createPlaylistBtn = document.querySelector('.create-playlist-btn');
    createPlaylistBtn.addEventListener('click', createNewPlaylist);

    // Function to create a new playlist
    function createNewPlaylist() {
        const playlistName = prompt('Enter playlist name:');
        if (playlistName) {
            const newPlaylist = {
                name: playlistName,
                songs: []
            };
            playlists.push(newPlaylist);
            localStorage.setItem('playlists', JSON.stringify(playlists));
            updatePlaylistsList();
        }
    }

    // Function to update the playlists list
    function updatePlaylistsList() {
        const playlistContainer = document.querySelector('.playlist');
        const existingPlaylists = playlistContainer.querySelectorAll('.custom-playlist');
        existingPlaylists.forEach(playlist => playlist.remove());

        playlists.forEach(playlist => {
            const playlistElement = document.createElement('h4');
            playlistElement.className = 'custom-playlist';
            playlistElement.innerHTML = `
                <span></span>
                <i class="fas fa-music"></i> ${playlist.name}
            `;
            playlistContainer.appendChild(playlistElement);
        });
    }

    let masterPlay = document.getElementById('masterPlay');
    let wave = document.getElementsByClassName('wave')[0];

    masterPlay.addEventListener('click',()=>{
        if (music.paused || music.currentTime <=0) {
            music.play();
            masterPlay.classList.remove('bi-play-fill');
            masterPlay.classList.add('bi-pause-fill');
            wave.classList.add('active2');
        } else {
            music.pause();
            masterPlay.classList.add('bi-play-fill');
            masterPlay.classList.remove('bi-pause-fill');
            wave.classList.remove('active2');
        }
    })

    const makeAllPlays = () =>{
        Array.from(document.getElementsByClassName('playListPlay')).forEach((element)=>{
                element.classList.add('bi-play-circle-fill');
                element.classList.remove('bi-pause-circle-fill');
        })
    }
    const makeAllBackgrounds = () =>{
        Array.from(document.getElementsByClassName('songItem')).forEach((element)=>{
                element.style.background = "rgb(105, 105, 170, 0)";
        })
    }

    let index = 0;
    let poster_master_play = document.getElementById('poster_master_play');
    let title = document.getElementById('title');
    Array.from(document.getElementsByClassName('playListPlay')).forEach((element)=>{
        element.addEventListener('click', (e)=>{
            index = e.target.id;
            makeAllPlays();
            e.target.classList.remove('bi-play-circle-fill');
            e.target.classList.add('bi-pause-circle-fill');
            music.src = `audio/${index}.mp3`;
            poster_master_play.src =`img/${index}.jpg`;
            music.play();
            let song_title = songs.filter((ele)=>{
                return ele.id == index;
            })

            song_title.forEach(ele =>{
                let {songName} = ele;
                title.innerHTML = songName;
            })
            masterPlay.classList.remove('bi-play-fill');
            masterPlay.classList.add('bi-pause-fill');
            wave.classList.add('active2');
            music.addEventListener('ended',()=>{
                masterPlay.classList.add('bi-play-fill');
                masterPlay.classList.remove('bi-pause-fill');
                wave.classList.remove('active2');
            })
            makeAllBackgrounds();
            Array.from(document.getElementsByClassName('songItem'))[`${index-1}`].style.background = "rgb(105, 105, 170, .1)";
        })
    })

    let currentStart = document.getElementById('currentStart');
    let currentEnd = document.getElementById('currentEnd');
    let seek = document.getElementById('seek');
    let bar2 = document.getElementById('bar2');
    let dot = document.getElementsByClassName('dot')[0];

    music.addEventListener('timeupdate',()=>{
        let music_curr = music.currentTime;
        let music_dur = music.duration;

        let min = Math.floor(music_dur/60);
        let sec = Math.floor(music_dur%60);
        if (sec<10) {
            sec = `0${sec}`
        }
        currentEnd.innerText = `${min}:${sec}`;

        let min1 = Math.floor(music_curr/60);
        let sec1 = Math.floor(music_curr%60);
        if (sec1<10) {
            sec1 = `0${sec1}`
        }
        currentStart.innerText = `${min1}:${sec1}`;

        let progressbar = parseInt((music.currentTime/music.duration)*100);
        seek.value = progressbar;
        let seekbar = seek.value;
        bar2.style.width = `${seekbar}%`;
        dot.style.left = `${seekbar}%`;
    })

    seek.addEventListener('change', ()=>{
        music.currentTime = seek.value * music.duration/100;
    })

    music.addEventListener('ended', ()=>{
        masterPlay.classList.add('bi-play-fill');
        masterPlay.classList.remove('bi-pause-fill');
        wave.classList.remove('active2');
    })

    let vol_icon = document.getElementById('vol_icon');
    let vol = document.getElementById('vol');
    let vol_dot = document.getElementById('vol_dot');
    let vol_bar = document.getElementsByClassName('vol_bar')[0];

    vol.addEventListener('change', ()=>{
        if (vol.value == 0) {
            vol_icon.classList.remove('bi-volume-down-fill');
            vol_icon.classList.add('bi-volume-mute-fill');
            vol_icon.classList.remove('bi-volume-up-fill');
        }
        if (vol.value > 0) {
            vol_icon.classList.add('bi-volume-down-fill');
            vol_icon.classList.remove('bi-volume-mute-fill');
            vol_icon.classList.remove('bi-volume-up-fill');
        }
        if (vol.value > 50) {
            vol_icon.classList.remove('bi-volume-down-fill');
            vol_icon.classList.remove('bi-volume-mute-fill');
            vol_icon.classList.add('bi-volume-up-fill');
        }

        let vol_a = vol.value;
        vol_bar.style.width = `${vol_a}%`;
        vol_dot.style.left = `${vol_a}%`;
        music.volume = vol_a/100;
    })

    let back = document.getElementById('back');
    let next = document.getElementById('next');

    back.addEventListener('click', ()=>{
        index -= 1;
        if (index < 1) {
            index = Array.from(document.getElementsByClassName('songItem')).length;
        }
        music.src = `audio/${index}.mp3`;
        poster_master_play.src =`img/${index}.jpg`;
        music.play();
        let song_title = songs.filter((ele)=>{
            return ele.id == index;
        })

        song_title.forEach(ele =>{
            let {songName} = ele;
            title.innerHTML = songName;
        })
        makeAllPlays()

        document.getElementById(`${index}`).classList.remove('bi-play-fill');
        document.getElementById(`${index}`).classList.add('bi-pause-fill');
        makeAllBackgrounds();
        Array.from(document.getElementsByClassName('songItem'))[`${index-1}`].style.background = "rgb(105, 105, 170, .1)";
        
    })
    next.addEventListener('click', ()=>{
        index -= 0;
        index += 1;
        if (index > Array.from(document.getElementsByClassName('songItem')).length) {
            index = 1;
            }
        music.src = `audio/${index}.mp3`;
        poster_master_play.src =`img/${index}.jpg`;
        music.play();
        let song_title = songs.filter((ele)=>{
            return ele.id == index;
        })

        song_title.forEach(ele =>{
            let {songName} = ele;
            title.innerHTML = songName;
        })
        makeAllPlays()

        document.getElementById(`${index}`).classList.remove('bi-play-fill');
        document.getElementById(`${index}`).classList.add('bi-pause-fill');
        makeAllBackgrounds();
        Array.from(document.getElementsByClassName('songItem'))[`${index-1}`].style.background = "rgb(105, 105, 170, .1)";
        
    })

    let left_scroll = document.getElementById('left_scroll');
    let right_scroll = document.getElementById('right_scroll');
    let pop_song = document.getElementsByClassName('pop_song')[0];

    left_scroll.addEventListener('click', ()=>{
        pop_song.scrollLeft -= 330;
    })
    right_scroll.addEventListener('click', ()=>{
        pop_song.scrollLeft += 330;
    })

    let left_scrolls = document.getElementById('left_scrolls');
    let right_scrolls = document.getElementById('right_scrolls');
    let item = document.getElementsByClassName('item')[0];

    left_scrolls.addEventListener('click', ()=>{
        item.scrollLeft -= 330;
    })
    right_scrolls.addEventListener('click', ()=>{
        item.scrollLeft += 330;
    })

    // Function to update profile page
    function updateProfilePage() {
        const profileName = document.querySelector('.profile-name');
        const playlistCount = document.querySelector('.stat-item:nth-child(1) .stat-number');
        const likedSongsCount = document.querySelector('.stat-item:nth-child(2) .stat-number');
        const recentlyPlayedCount = document.querySelector('.stat-item:nth-child(3) .stat-number');
        const playlistList = document.querySelector('.playlist-list');

        // Update profile name
        profileName.textContent = currentUser.username || currentUser.email.split('@')[0];

        // Update stats
        playlistCount.textContent = playlists.length;
        likedSongsCount.textContent = likedSongs.length;
        recentlyPlayedCount.textContent = recentlyPlayed.length;

        // Update playlist list
        playlistList.innerHTML = '';
        playlists.forEach(playlist => {
            const playlistElement = document.createElement('div');
            playlistElement.className = 'playlist-item';
            playlistElement.innerHTML = `
                <i class="fas fa-music"></i>
                <span>${playlist.name}</span>
            `;
            playlistList.appendChild(playlistElement);
        });
    }

    // Back Button Functionality
    backButton.addEventListener('click', () => {
        // Hide profile page and show main content
        profilePage.style.display = 'none';
        mainContent.style.display = 'block';
        popularSongs.style.display = 'block';
        popularArtists.style.display = 'block';
        backButton.style.display = 'none';
    });

    // Example function to handle unliking a song
    function unlikeSong(songId) {
        fetch(`/api/unlike/${songId}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                // Update the UI to reflect the song is unliked
                console.log(`Song ${songId} unliked successfully.`);
            } else {
                console.error('Failed to unlike the song.');
            }
        });
    }
}); 
