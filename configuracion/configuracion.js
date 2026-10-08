import {
  getData,
  setEventName,
  setTotalRounds,
  getEventName,
  getTotalRounds,
} from '../js/data.js';
import { confirmCustom, alertCustom } from '../js/main-buttons.js';

const nameEventInput = document.getElementById('nameEvent');
const numberRoundsInput = document.getElementById('totalRounds');

const formConfiguration = document.getElementById('formConfiguration');
const saveConfigButton = document.getElementById('saveConfigButton');

function cargarConfiguracionInicial() {
  if (nameEventInput) nameEventInput.value = getEventName() || '';
  if (numberRoundsInput) numberRoundsInput.value = getTotalRounds() || '';

  if (getData().started) {
    nameEventInput.disabled = true;
    numberRoundsInput.disabled = true;

    saveConfigButton.hidden = true;
  }
}

formConfiguration.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (getData().started) return;

  const nameInput = nameEventInput.value;
  const roundsInput = parseInt(numberRoundsInput.value, 10);

  if (!nameInput) {
    await alertCustom('Por favor ingresa un nombre para el evento.');
    return;
  }

  if (isNaN(roundsInput) || roundsInput < 1) {
    await alertCustom(
      'Por favor ingresa un número válido de rondas (mínimo 1).'
    );
    return;
  }
  const mensaje = `¿Deseas guardar los cambios e ir a Equipos?\n\n Evento: ${nameInput}\n Rondas: ${roundsInput}`;
  const seguroDeGuardar = await confirmCustom(mensaje, 'Guardar Configuración');

  if (seguroDeGuardar) {
    setEventName(nameInput);
    setTotalRounds(roundsInput);
    window.location.href = '../equipos/equipos.html';
  }
});

cargarConfiguracionInicial();
