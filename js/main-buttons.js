import { getData, setData, initialData } from './data.js';

window.addEventListener('DOMContentLoaded', () => {
  injectConfirmModal();
  injectAlertModal();

  const exportButton = document.getElementById('export-button');
  const importButton = document.getElementById('import-button');
  const printButton = document.getElementById('print-button');
  const resetButton = document.getElementById('reset-button');

  exportButton.addEventListener('click', () => {
    const data = getData();

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download =
      'tournament_data_' + new Date().toISOString().slice(0, 10) + '.json';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  });

  importButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setData(data);
        } catch (error) {
          await alertCustom('Error al parsear el archivo JSON.');
          console.error('Error al parsear el archivo JSON:', error);
        }
      };
      reader.readAsText(file);
    });

    input.click();
  });

  printButton.addEventListener('click', () => {
    const printZone = document.getElementById('clasification-print-zone');

    if (!printZone) {
      window.location.href = '../clasificacion/clasificacion.html?print=true';

      return;
    }

    window.print();
  });

  resetButton.addEventListener('click', async () => {
    if (
      await confirmCustom('¿Estás seguro de que quieres reiniciar el evento?')
    ) {
      setData(initialData());

      window.location.href = '../configuracion/configuracion.html';
    }
  });

  if (window.location.search.includes('print=true')) {
    const printZone = document.getElementById('clasification-print-zone');

    if (printZone) {
      printButton.click();
    }

    const url = new URL(window.location);
    url.searchParams.delete('print');
    window.history.replaceState({}, document.title, url.toString());
  }
});

function injectConfirmModal() {
  const modalHTML = /* html */ `
        <div id="custom-modal" class="modal-overlay hidden">
        <div class="modal-card">
            <h3 id="modal-title"></h3>
            <p id="modal-message"></p>
            
            <div class="modal-actions">
                <button id="modal-cancel-btn" class="button default-button">Cancelar</button>
                <button id="modal-confirm-btn" class="button accent-button">Aceptar</button>
            </div>
        </div>
    </div>
    `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function injectAlertModal() {
  const modalHTML = /* html */ `
        <div id="custom-alert-modal" class="modal-overlay hidden">
        <div class="modal-card">
            <h3 id="alert-modal-title">Alerta</h3>
            <p id="alert-modal-message"></p>

            <div class="modal-actions"></div>
                <button id="alert-modal-ok-btn" class="button accent-button">Aceptar</button>
            </div>
        </div>
    </div>
    `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

export function alertCustom(mensaje, titulo = 'Alerta') {
  return new Promise((resolve) => {
    const modal = document.getElementById('custom-alert-modal');
    const modalTitle = document.getElementById('alert-modal-title');
    const modalMessage = document.getElementById('alert-modal-message');
    const okBtn = document.getElementById('alert-modal-ok-btn');

    modalTitle.textContent = titulo;
    modalMessage.textContent = mensaje;

    modal.classList.remove('hidden');

    const handleOk = () => {
      modal.classList.add('hidden');
      okBtn.removeEventListener('click', handleOk);
      resolve(true);
    };

    okBtn.addEventListener('click', handleOk);
  });
}

export function confirmCustom(mensaje, titulo = 'Confirmar acción') {
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
