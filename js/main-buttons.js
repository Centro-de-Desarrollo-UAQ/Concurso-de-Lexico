import { setPrintTable } from '../clasificacion/clasificacion.js';
import { getData, setData, initialData } from './data.js';

window.addEventListener('DOMContentLoaded', () => {
  injectConfirmModal();
  injectAlertModal();
  injectPrintModal();

  const exportButton = document.getElementById('export-button');
  const importButton = document.getElementById('import-button');
  const printButton = document.getElementById('print-button');
  const resetButton = document.getElementById('reset-button');

  exportButton.addEventListener('click', async () => {
    const data = getData();

    if (!data || Object.keys(data).length === 0 || !data.eventName) {
      await alertCustom(
        'No hay nada que exportar porque aún no se ha configurado el torneo.'
      );
      return; // Detiene la ejecución para no generar la descarga
    }

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

          await alertCustom('¡Datos importados correctamente!');
          window.location.reload();
        } catch (error) {
          await alertCustom('Error al parsear el archivo JSON.');
          console.error('Error al parsear el archivo JSON:', error);
        }
      };
      reader.readAsText(file);
    });

    input.click();
  });

  printButton.addEventListener('click', async () => {
    const printZone = document.getElementById('positions-table');

    if (!printZone) {
      window.location.href = '../clasificacion/clasificacion.html?print=true';
      return;
    }

    await printCustom().then((option) => {
      if (option === 'current') {
        setPrintTable('current');
      } else if (option === 'all') {
        setPrintTable('all');
      }
    });

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
    const url = new URL(window.location);
    url.searchParams.delete('print');
    window.history.replaceState({}, document.title, url.toString());

    printButton.click();

    // const printZone = document.getElementById('clasification-print-zone');

    // if (printZone) {
    //   waitForContent(printZone).then(async () => {
    //     await document.fonts.ready;
    //     await new Promise((r) =>
    //       requestAnimationFrame(() => requestAnimationFrame(r))
    //     );
    //     window.print();
    //   });
    // }
  }
});

function waitForContent(el, timeout = 3000) {
  return new Promise((resolve) => {
    if (el.children.length > 0) return resolve();

    const observer = new MutationObserver(() => {
      if (el.children.length > 0) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(el, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, timeout);
  });
}

export function showCustom(mensaje, titulo = 'Mensaje') {
  return new Promise((resolve) => {
    const modal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');

    modalTitle.textContent = titulo;
    modalMessage.textContent = mensaje;

    cancelBtn.style.display = 'none';

    modal.classList.remove('hidden');

    const handleConfirm = () => {
      cleanup();
      resolve();
    };

    const cleanup = () => {
      modal.classList.add('hidden');

      confirmBtn.removeEventListener('click', handleConfirm);

      cancelBtn.style.display = '';
    };

    confirmBtn.addEventListener('click', handleConfirm);
  });
}

function injectConfirmModal() {
  const modalHTML = /* html */ `
    <div id="custom-modal" class="modal-overlay hidden">
      <div class="modal-card">
        <h3 id="modal-title"></h3>
        <p id="modal-message"></p>

        <div class="modal-actions">
          <button id="modal-cancel-btn" class="button default-button">
            Cancelar
          </button>

          <button id="modal-confirm-btn" class="button accent-button">
            Aceptar
          </button>
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

        <div class="modal-actions">
          <button id="alert-modal-ok-btn" class="button accent-button">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function injectPrintModal() {
  const modalHTML = /* html */ `
    <div id="custom-print-modal" class="modal-overlay hidden">
      <div class="modal-card">
        <h3 id="print-modal-title">Imprimir</h3>
        <p id="print-modal-message">¿Deseas imprimir la vista actual o todas las vistas?</p>

        <div class="modal-actions">
          <button id="print-modal-current-btn" class="button default-button">
            Actual
          </button>

          <button id="print-modal-all-btn" class="button accent-button">
            Todas
          </button>
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

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

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

export function printCustom() {
  return new Promise((resolve) => {
    const modal = document.getElementById('custom-print-modal');
    const currentBtn = document.getElementById('print-modal-current-btn');
    const allBtn = document.getElementById('print-modal-all-btn');

    modal.classList.remove('hidden');

    const handleCurrent = () => {
      modal.classList.add('hidden');
      currentBtn.removeEventListener('click', handleCurrent);
      allBtn.removeEventListener('click', handleAll);
      resolve('current');
    };

    const handleAll = () => {
      modal.classList.add('hidden');
      currentBtn.removeEventListener('click', handleCurrent);
      allBtn.removeEventListener('click', handleAll);
      resolve('all');
    };

    currentBtn.addEventListener('click', handleCurrent);
    allBtn.addEventListener('click', handleAll);
  });
}
