import {setEventName, setTotalRounds} from "../js/data.js"

const nameEventInput = document.getElementById('nameEvent');
const numberRoundsInput = document.getElementById('totalRounds')
const btnSaveConfiguration = document.getElementById("btnConfiguration")

btnSaveConfiguration.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameInput = nameEventInput.value
    const roundsInput = numberRoundsInput.value

    console.log("Guardando:", nameInput, roundsInput);
});

