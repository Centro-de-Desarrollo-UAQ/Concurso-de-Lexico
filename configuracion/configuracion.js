import {setEventName, setTotalRounds, getEventName, getTotalRounds} from "../js/data.js"

const nameEventInput = document.getElementById('nameEvent');
const numberRoundsInput = document.getElementById('totalRounds')

const formConfiguration = document.getElementById('formConfiguration');

function cargarConfiguracionInicial() {
    if (nameEventInput) nameEventInput.value = getEventName() || "";
    if (numberRoundsInput) numberRoundsInput.value = getTotalRounds() || "";
}

formConfiguration.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nameInput = nameEventInput.value;
    const roundsInput = parseInt(numberRoundsInput.value, 10);

    if (!nameInput) {
        alert("Por favor ingresa un nombre para el evento.");
        return;
    }

    if (isNaN(roundsInput) || roundsInput < 1) {
        alert("Por favor ingresa un número válido de rondas (mínimo 1).");
        return;
    }
    const mensaje = `¿Deseas guardar los cambios e ir a Equipos?\n\n Evento: ${nameInput}\n Rondas: ${roundsInput}`;
    const seguroDeGuardar = await confirmCustom(mensaje, "Guardar Configuración");
    
    if (seguroDeGuardar) {
        setEventName(nameInput);
        setTotalRounds(roundsInput);
        window.location.href = "../equipos/equipos.html";
    }

  
});

cargarConfiguracionInicial();


function confirmCustom(mensaje, titulo = "Confirmar acción") {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn = document.getElementById('modal-cancel-btn');

        modalTitle.textContent = titulo;
        modalMessage.textContent = mensaje;

        modal.classList.remove('hidden');

        // Al hacer clic en Aceptar
        const handleConfirm = () => {
            cleanup();
            resolve(true);
        };

        // Al hacer clic en Cancelar
        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            modal.classList.add('hidden');
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
    });
}