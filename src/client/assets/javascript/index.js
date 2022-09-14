// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// store to hold global state object
let store = {
    track_id: undefined,
    player_id: undefined,
    race_id: undefined,
};

// We need our javascript to wait until the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    onPageLoad();
    setupClickHandlers();
});

async function onPageLoad() {
    try {
        await getTracks().then((tracks) => {
            const html = renderTrackCards(tracks);
            renderAt('#tracks', html);
        });

        await getRacers().then((racers) => {
            const html = renderRacerCars(racers);
            renderAt('#racers', html);
        });
    } catch (error) {
        console.log('Problem getting tracks and racers ::', error.message);
        console.error(error);
    }
}

// Handle clicks
function setupClickHandlers() {
    document.addEventListener(
        'click',
        function (event) {
            const { target } = event;

            // Race track form field
            if (target.matches('.card.track')) {
                handleSelectTrack(target);
            }

            // Podracer form field
            if (target.matches('.card.podracer')) {
                handleSelectPodRacer(target);
            }

            // Submit create race form
            if (target.matches('#submit-create-race')) {
                event.preventDefault();

                // start race
                handleCreateRace();
            }

            // Handle acceleration click
            if (target.matches('#gas-peddle')) {
                handleAccelerate(target);
            }
        },
        false
    );
}

// Promise that resolves after a time given, receives the parameter in ms
async function delay(ms) {
    try {
        return await new Promise((resolve) => setTimeout(resolve, ms));
    } catch (error) {
        console.log("an error shouldn't be possible here");
        console.log(error);
    }
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
    try {
        const player_id = store.player_id;
        const track_id = store.track_id;
        // check if there is no player id or track id, alert to the user and return
        if (!player_id || !track_id) {
            alert(`Please select a track and player to start the race`);
        } else {
            const race = await createRace(player_id, track_id);
            store.race_id = parseInt(race.ID) - 1;

            // render starting UI
            renderAt('#race', renderRaceStartView(race.Track, race.Cars));

            await runCountdown();
            await startRace(store.race_id);
            await runRace(store.race_id);
        }
    } catch (error) {
        console.log(`Error in handleCreateRace function::`, error.message);
        console.error(error);
    }
}

// Get race info every 500ms, check status and update view
async function runRace(raceID) {
    try {
        return new Promise((resolve) => {
            const raceInterval = setInterval(async () => {
                const raceResponse = await getRace(raceID);
                if (raceResponse.status === 'in-progress') {
                    renderAt(
                        '#leaderBoard',
                        raceProgress(raceResponse.positions)
                    );
                } else if (raceResponse.status === 'finished') {
                    // Stop the interval from repeating
                    clearInterval(raceInterval);
                    // Render the results view
                    renderAt('#race', resultsView(raceResponse.positions));
                    // Resolve the promise
                    resolve(raceResponse);
                }
            }, 500);
        });
    } catch (error) {
        console.log(`Error in runRace function::`, error.message);
        console.error(error);
    }
}

// function to run the count down, starting at 3
async function runCountdown() {
    try {
        // wait for the DOM to load
        await delay(1000);
        //set the countdown
        let timer = 3;

        return new Promise((resolve) => {
            const countdownInterval = setInterval(() => {
                // run this DOM manipulation to decrement the countdown for the user
                document.getElementById('big-numbers').innerHTML = --timer;
                if (timer <= 0) {
                    clearInterval(countdownInterval);
                    resolve('done');
                }
            }, 1000);
        });
    } catch (error) {
        console.log(`Error in runCountdown function::`, error.message);
        console.error(error);
    }
}

// function to select a Racer or Player
function handleSelectPodRacer(target) {
    console.log('selected a pod', target.id);

    // remove class selected from all racer options
    const selected = document.querySelector('#racers .selected');
    if (selected) {
        selected.classList.remove('selected');
    }

    // add class selected to current target
    target.classList.add('selected');

    // convert string into number
    store.player_id = parseInt(target.id);
    //console.log(typeof store.player_id);
}

// function to select a Track
function handleSelectTrack(target) {
    console.log('selected a track', target.id);

    // remove class selected from all track options
    const selected = document.querySelector('#tracks .selected');
    if (selected) {
        selected.classList.remove('selected');
    }

    // add class selected to current target
    target.classList.add('selected');

    // convert string into number
    store.track_id = parseInt(target.id);
    //console.log(typeof store.track_id) // number
}

// function to handle Accelerate button
async function handleAccelerate() {
    try {
        await accelerate(store.race_id);
    } catch (error) {
        console.log(`Error in handleAccelerate function::`, error.message);
        console.error(error);
    }
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
    if (!racers.length) {
        return `
			<h4>Loading Racers...</4>
		`;
    }
    const results = racers.map(renderRacerCard).join('');
    return `
		<ul id="racers">
			${results}
		</ul>
	`;
}

// custom player or racer names
const customRacerName = {
    'Racer 1': 'Amy',
    'Racer 2': 'Sammy',
    'Racer 3': 'Sailor',
    'Racer 4': 'Loren',
    'Racer 5': 'Nina',
};

// custom track names for the race
const customTrackName = {
    'Track 1': 'Plitvice Lakes',
    'Track 2': 'Yellowstone',
    'Track 3': 'Glacier National Park',
    'Track 4': 'Belluno Dolomites',
    'Track 5': 'Wild Taiga',
    'Track 6': 'Ordesa',
};

// render racer or player cards
function renderRacerCard(racer) {
    const { id, driver_name, top_speed, acceleration, handling } = racer;

    return `
		<li class="card podracer" id="${id}">
			<h3>${customRacerName[driver_name]}</h3>
			<p>${`Top Speed: ${top_speed}`}</p>
			<p>${`Acceleration: ${acceleration}`}</p>
			<p>${`Handling: ${handling}`}</p>
		</li>
	`;
}

function renderTrackCards(tracks) {
    if (!tracks.length) {
        return `
			<h4>Loading Tracks...</4>
		`;
    }

    const results = tracks.map(renderTrackCard).join('');
    return `
		<ul id="tracks">
			${results}
		</ul>
	`;
}

// render track cards
function renderTrackCard(track) {
    const { id, name } = track;
    return `
		<li id="${id}" class="card track">
			<h3>${customTrackName[name]}</h3>
		</li>
	`;
}

// render the count down number
function renderCountdown(count) {
    return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

// render race start view
function renderRaceStartView(track, racers) {
    return `
		<header>
			<h1>Track: ${customTrackName[track.name]}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2 class="title">Directions</h2>
				<p class="msg-click">Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer>
			<div>Credits: <a href="http://www.freepik.com">Picture designed by upklyak / Freepik</a>
			<a href="https://www.flaticon.com/authors/srip" title="srip">srip</a>from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com, </a>
			<a href="https://www.iconfinder.com/icons/3069187/achivement_business_mission_winner_icon" title="Iconfinder">www.iconfinder.com</a>
			</div>
		</footer>
	`;
}

// render results view with the final positions
function resultsView(positions) {
    positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));
    const first = positions.filter((player) => player.final_position === 1);
    //console.log(first[0].driver_name);
    //console.log(`${customRacerName[first[0].driver_name]}`);

    return `
		<header class="header-wrap">
			<h1>Race Results</h1>
			<div class="winner-wrapper">
				<img class="winner-icon" src="../assets/stylesheets/images/winner.png" alt="winner">
				<h5>${customRacerName[first[0].driver_name]}, you win! </h5>
			</div>	
		</header>
		<main class="wrapper-results">
			${raceProgress(positions)}
			<a class="start-button" href="/race">Start a new race</a>
		</main>
	`;
}

// check the progress of the players
function raceProgress(positions) {
    //let userPlayer = positions.find((e) => parseInt(e.id) === parseInt(store.player_id))
    //let userPlayer = positions.find(e => e.id === store.player_id)
    //userPlayer.driver_name += " (you)"
    //console.log(positions);

    // Get the progress or completion of players based on segment
    const trackProgress = positions
        .map((player) => {
            // segment 201 means the player had finished the race, so segment 201 is 100% of completion
            const playerProgress = player.segment / 201;
            const playerPercentage = Math.round(playerProgress * 100);
            //console.log(`Player segment: ${player.segment}, Progress: ${playerProgress}, Percentage: ${playerPercentage}%`)

            // cards to show graphic progress for players
            if (player.id === store.player_id) {
                return `
			<div class="wrap-progress">
				<div class="player-info">
					<div class="player-name-progress selected-player">${
                    customRacerName[player.driver_name]
                }- You!</div>
					<div class="player-percentage">${playerPercentage}%</div>
				</div>
				<div class="player-hedgehog" style="left:${playerPercentage}%">
					<img class="hedgehog-progress" src="../assets/stylesheets/images/hedgehog.png" alt="hedgehog">
				</div>
			</div>
			`;
            } else {
                return `
			<div class="wrap-progress">
				<div class="player-info">
					<div class="player-name-progress">${customRacerName[player.driver_name]}</div>
					<div class="player-percentage">${playerPercentage}%</div>
				</div>
				<div class="player-hedgehog" style="left:${playerPercentage}%">
					<img class="hedgehog-progress" src="../assets/stylesheets/images/hedgehog.png" alt="hedgehog">
				</div>
			</div>
			`;
            }
        })
        .join('');

    // cards to show positions list
    positions = positions.sort((a, b) => (a.segment > b.segment ? -1 : 1));
    let count = 1;

    const results = positions
        .map((p) => {
            if (p.id === store.player_id) {
                return `
			<tr>
				<td>
					<h3 class="selected-player">${count++} - ${
                    customRacerName[p.driver_name]
                } - You! </h3>
				</td>
			</tr>
		`;
            } else {
                return `
			<tr>
				<td>
					<h3>${count++} - ${customRacerName[p.driver_name]}</h3>
				</td>
			</tr>
		`;
            }
        })
        .join('');

    return `
		<main>
			<h2 class="title">Leaderboard</h2>
			<section id="leaderBoard">
				<div class="resultsBoard">
					${results}
				</div>
				<div class="trackProgress">
					${trackProgress}
				</div>
			</section>
		</main>
	`;
}

function renderAt(element, html) {
    const node = document.querySelector(element);

    node.innerHTML = html;
}

// ^ Provided code ^ do not remove

// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000';

function defaultFetchOpts() {
    return {
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': SERVER,
        },
    };
}

// GET request to `${SERVER}/api/tracks`
async function getTracks() {
    try {
        //http://localhost:8000/api/tracks
        const response = await fetch(`${SERVER}/api/tracks`); //get data from promise returned by fetch
        const data = await response.json(); // get data from promise returned by .json()
        return data; // return the data to use it later
    } catch (error) {
        console.log(`Problem with getTracks request::`, error.message);
        console.error(error);
    }
}

// GET request to `${SERVER}/api/cars`
async function getRacers() {
    try {
        //http://localhost:8000/api/cars
        const response = await fetch(`${SERVER}/api/cars`);
        const data = await response.json();
        return data; // return the data to use it later
    } catch (error) {
        console.log(`Problem with getRacers request::`, error.message);
        console.error(error);
    }
}

// Refactor function createRace - async/ await PROMISE
//http://localhost:8000/api/races
async function createRace(player_id, track_id) {
    try {
        player_id = parseInt(player_id);
        track_id = parseInt(track_id);
        const body = { player_id, track_id };

        const response = await fetch(`${SERVER}/api/races`, {
            method: 'POST',
            ...defaultFetchOpts(),
            dataType: 'jsonp',
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return data; // return the data to use it later
    } catch (err) {
        console.log('Problem with createRace request::', err);
        console.error(error);
    }
}

// GET request to `${SERVER}/api/races/${id}`
//http://localhost:8000/api/races/${id}
async function getRace(id) {
    try {
        const response = await fetch(`${SERVER}/api/races/${id}`);
        const data = await response.json();
        return data; // return the data to use it later
    } catch (error) {
        console.log(`Problem with getRace request::`, error.message);
        console.error(error);
    }
}

// Refactor function startRace - async/ await PROMISE
async function startRace(id) {
    return await fetch(`${SERVER}/api/races/${id}/start`, {
        method: 'POST',
        ...defaultFetchOpts(),
    })
        //.then(res => res.json())
        .catch((error) => {
            console.log('Problem with getRace request::', error.message);
            console.log(error);
        });
}

// POST request to `${SERVER}/api/races/${id}/accelerate`
// options parameter provided as defaultFetchOpts
// no body or datatype needed for this request
async function accelerate(id) {
    return await fetch(`${SERVER}/api/races/${id}/accelerate`, {
        method: 'POST',
        ...defaultFetchOpts(),
    }).catch((error) => {
        console.log(`Problem with accelerate request::`, error.message);
        console.log(error);
    });
}
