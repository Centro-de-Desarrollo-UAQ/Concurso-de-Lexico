import {
  getSchoolStandings,
  getTeamStandings,
  getStudentStandings,
  notifyDataChange,
} from '../js/data.js';

let renderPrintTable;

/* Needs to use renderPrintTable on change */
export const setPrintTable = (table) => {
  if (
    table !== 'all' &&
    table !== 'current'
  ) {
    throw new Error(
      `Valor inválido para printTable: ${table}. Debe ser uno de: 'all', 'schools', 'teams', 'students', 'male-students', 'female-students'.`
    );
  }

  if (renderPrintTable) renderPrintTable(table);
};

window.addEventListener('DOMContentLoaded', () => {
  const gsap = window.gsap;
  const Flip = window.Flip;
  let actualViewId;

  const podium = document.getElementById('podium');
  const positionsTable = document.getElementById('positions-table');
  const printZone = document.getElementById('clasification-print-zone');

  if (!gsap || !Flip) {
    throw new Error(
      'GSAP y su plugin Flip no están disponibles para animar la clasificación.'
    );
  }
  gsap.registerPlugin(Flip);

  const getStandings = (viewId) => {
    switch (viewId) {
      case 'schools':
        return getSchoolStandings();
      case 'teams':
        return getTeamStandings();
      case 'students':
        return getStudentStandings();
      case 'male-students':
        return getStudentStandings().filter(
          (student) => student.gender === 'male'
        );
      case 'female-students':
        return getStudentStandings().filter(
          (student) => student.gender === 'female'
        );
    }
  };

  const getName = (viewId) => {
    switch (viewId) {
      case 'schools':
        return 'Escuelas';
      case 'teams':
        return 'Equipos';
      case 'students':
        return 'Estudiantes';
      case 'male-students':
        return 'Estudiantes Masculinos';
      case 'female-students':
        return 'Estudiantes Femeninos';
    }
  };

  const getPrintDetailsHTML = (viewId) => {
    return /* html */ `
      <h1 class="text-center text-2xl text-bold">Clasificación de ${getName(viewId)}</h1>
      <p class="text-center">Generado el ${new Date().toLocaleDateString()}</p>
    `;
  };

  const getPrintTableHTML = (viewId, standings) => {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    thead.innerHTML = /* html */ `
      <tr>
        ${getStandingHeadingHTML(viewId, 'th')}
      </tr>
    `;

    standings.forEach((entry, index) => {
      const position = index + 1;
      const row = document.createElement('tr');
      row.innerHTML = getStandingHTML(viewId, entry, position, 'td');
      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    table.classList.add('print-table');
    return table.outerHTML;
  };

  const getStandingHeadingHTML = (viewId, headingTag = 'p') => {
    switch (viewId) {
      case 'schools':
        return /* html */ `
          <${headingTag} class="text-bold">Pos</${headingTag}>
          <${headingTag} class="text-bold">Escuela</${headingTag}>
          <${headingTag} class="text-bold">Equipos</${headingTag}>
          <${headingTag} class="text-bold">Puntos</${headingTag}>
          <${headingTag} class="text-bold">G</${headingTag}>
          <${headingTag} class="text-bold">E</${headingTag}>
          <${headingTag} class="text-bold">P</${headingTag}>
        `;
      case 'teams':
        return /* html */ `
          <${headingTag} class="text-bold">Pos</${headingTag}>
          <${headingTag} class="text-bold">Equipo</${headingTag}>
          <${headingTag} class="text-bold">Escuela</${headingTag}>
          <${headingTag} class="text-bold">Puntos</${headingTag}>
          <${headingTag} class="text-bold">G</${headingTag}>
          <${headingTag} class="text-bold">E</${headingTag}>
          <${headingTag} class="text-bold">P</${headingTag}>
        `;
      case 'students':
      case 'male-students':
      case 'female-students':
        return /* html */ `
          <${headingTag} class="text-bold">Pos</${headingTag}>
          <${headingTag} class="text-bold">Estudiante</${headingTag}>
          <${headingTag} class="text-bold">Escuela</${headingTag}>
          <${headingTag} class="text-bold">Equipo</${headingTag}>
          <${headingTag} class="text-bold">Rondas Jugadas</${headingTag}>
          <${headingTag} class="text-bold">Puntos</${headingTag}>
        `;
    }
  };

  const getStandingHTML = (viewId, entry, position, headingTag = 'p') => {
    switch (viewId) {
      case 'schools':
        return /* html */ `
          <${headingTag} class="text-bold">${position}</${headingTag}>
          <${headingTag}>${entry.school}</${headingTag}>
          <${headingTag}>${entry.teams}</${headingTag}>
          <${headingTag}>${entry.score}</${headingTag}>
          <${headingTag}>${entry.wins}</${headingTag}>
          <${headingTag}>${entry.draws}</${headingTag}>
          <${headingTag}>${entry.losses}</${headingTag}>
        `;
      case 'teams':
        return /* html */ `
          <${headingTag} class="text-bold">${position}</${headingTag}>
          <${headingTag}>${entry.name}</${headingTag}>
          <${headingTag}>${entry.school}</${headingTag}>
          <${headingTag}>${entry.score}</${headingTag}>
          <${headingTag}>${entry.wins}</${headingTag}>
          <${headingTag}>${entry.draws}</${headingTag}>
          <${headingTag}>${entry.losses}</${headingTag}>
        `;
      case 'students':
      case 'male-students':
      case 'female-students':
        return /* html */ `
          <${headingTag} class="text-bold">${position}</${headingTag}>
          <${headingTag}>${entry.name}</${headingTag}>
          <${headingTag}>${entry.school}</${headingTag}>
          <${headingTag}>${entry.team}</${headingTag}>
          <${headingTag}>${entry.roundsPlayed}</${headingTag}>
          <${headingTag}>${entry.score}</${headingTag}>
        `;
    }
  };

  const getStandingKey = (viewId, entry) => {
    if (viewId === 'schools') return entry.school;
    if (viewId === 'teams') return entry.id;
    return entry.studentId;
  };

  const getStandingGridStyle = (viewId) => {
    switch (viewId) {
      case 'schools':
        return 'grid-template-columns: 1fr 3fr 1fr 1fr 1fr 1fr 1fr;';
      case 'teams':
        return 'grid-template-columns: 1fr 3fr 3fr 1fr 1fr 1fr 1fr;';
      case 'students':
      case 'male-students':
      case 'female-students':
        return 'grid-template-columns: 1fr 3fr 3fr 3fr 2fr 1fr;';
    }
  };

  const createPositionElement = (viewId, entry, position) => {
    const entryElement = document.createElement('div');
    entryElement.classList.add('position-card', 'card');
    entryElement.dataset.standingKey = getStandingKey(viewId, entry);
    entryElement.style = getStandingGridStyle(viewId);
    entryElement.innerHTML = getStandingHTML(viewId, entry, position);
    return entryElement;
  };

  const renderPositions = (viewId, standings) => {
    const existingElements = new Map(
      [
        ...positionsTable.querySelectorAll('.position-card[data-standing-key]'),
      ].map((element) => [element.dataset.standingKey, element])
    );
    const positionsElements = standings.map((entry, index) => {
      const key = getStandingKey(viewId, entry);
      const entryElement =
        existingElements.get(key) ||
        createPositionElement(viewId, entry, index + 1);

      entryElement.innerHTML = getStandingHTML(viewId, entry, index + 1);
      entryElement.style = getStandingGridStyle(viewId);
      return entryElement;
    });
    const headingElement =
      positionsTable.querySelector('.position-heading') ||
      document.createElement('div');
    headingElement.className = 'position-card card position-heading';
    headingElement.style = getStandingGridStyle(viewId);
    headingElement.innerHTML = getStandingHeadingHTML(viewId);

    positionsTable.replaceChildren(headingElement, ...positionsElements);
  };

  const createPodiumElement = (viewId, entry, position) => {
    const podiumEntry = document.createElement('div');
    podiumEntry.classList.add('podium-entry');
    podiumEntry.dataset.standingKey = getStandingKey(viewId, entry);
    updatePodiumElement(podiumEntry, viewId, entry, position);
    return podiumEntry;
  };

  const updatePodiumElement = (podiumEntry, viewId, entry, position) => {
    podiumEntry.classList.remove('podium-1', 'podium-2', 'podium-3');
    podiumEntry.classList.add(`podium-${position}`);
    podiumEntry.innerHTML = /* html */ `
      <p class="podium-number">${position}</p>
      <p class="text-xl">${entry.name || entry.school}</p>
      <p class="text-bold">${entry.score} pts</p>
    `;
  };

  const renderPodium = (viewId, standings) => {
    const podiumEntries = standings.slice(0, 3);
    const existingElements = new Map(
      [...podium.querySelectorAll('.podium-entry')].map((element) => [
        element.dataset.standingKey,
        element,
      ])
    );
    const podiumElements = podiumEntries.map((entry, index) => {
      const position = index + 1;
      const key = getStandingKey(viewId, entry);
      const podiumEntry =
        existingElements.get(key) ||
        createPodiumElement(viewId, entry, position);

      updatePodiumElement(podiumEntry, viewId, entry, position);
      return podiumEntry;
    });

    // The winner stays visually centered, with second and third place on either side.
    const visualOrder = [
      podiumElements[1],
      podiumElements[0],
      podiumElements[2],
    ];
    podium.replaceChildren(...visualOrder.filter(Boolean));
  };

  const renderNoTeamsAdvice = () => {
    const adviceElement = document.createElement('h3');
    adviceElement.classList.add('text-center', 'text-bold');
    adviceElement.textContent =
      'No hay equipos registrados. Por favor, registre equipos para ver la clasificación.';

    podium.appendChild(adviceElement);
  };

  renderPrintTable = (selectedTable) => {
    printZone.innerHTML = '';
    if (selectedTable === 'all') {
      [
        'schools',
        'teams',
        'students',
        'male-students',
        'female-students',
      ].forEach((viewId) => {
        const standings = getStandings(viewId);
        printZone.innerHTML += getPrintDetailsHTML(viewId);
        printZone.innerHTML += getPrintTableHTML(viewId, standings);
      });
    } else {
      const standings = getStandings(actualViewId);
      printZone.innerHTML += getPrintDetailsHTML(actualViewId);
      printZone.innerHTML += getPrintTableHTML(actualViewId, standings);
    }
  };

  const animateInitialRender = () => {
    const podiumAnimationOrder = [
      ...podium.querySelectorAll('.podium-entry'),
    ].sort((left, right) => {
      const leftPosition = Number(
        left.querySelector('.podium-number').textContent
      );
      const rightPosition = Number(
        right.querySelector('.podium-number').textContent
      );
      return rightPosition - leftPosition;
    });

    gsap.fromTo(
      podiumAnimationOrder,
      { autoAlpha: 0, scaleY: 0, transformOrigin: 'bottom center' },
      {
        autoAlpha: 1,
        scaleY: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.25,
        clearProps: 'transform,opacity,visibility',
      }
    );
    gsap.fromTo(
      positionsTable.querySelectorAll('.position-card:not(.position-heading)'),
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        ease: 'power2.out',
        stagger: 0.1,
        clearProps: 'transform,opacity,visibility',
      }
    );
  };

  const animatePositionChange = (podiumState, positionsState) => {
    Flip.from(podiumState, {
      duration: 0.9,
      ease: 'power2.inOut',
      nested: true,
      prune: true,
      onComplete: () => gsap.set(podium.children, { clearProps: 'transform' }),
    });
    Flip.from(positionsState, {
      duration: 0.9,
      ease: 'power2.inOut',
      nested: true,
      prune: true,
      onComplete: () =>
        gsap.set(positionsTable.querySelectorAll('.position-card'), {
          clearProps: 'transform',
        }),
    });

    gsap.fromTo(
      positionsTable.querySelectorAll('.position-card:not(.position-heading)'),
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.35,
        stagger: 0.04,
        clearProps: 'opacity,visibility',
      }
    );
  };

  const updateView = (viewId) => {
    const previousViewId = actualViewId;
    const canFlip =
      podium.querySelector('.podium-entry') && previousViewId === viewId;
    actualViewId = viewId;

    const standings = getStandings(viewId);

    if (standings.length === 0) {
      podium.innerHTML = '';
      positionsTable.innerHTML = '';
      renderNoTeamsAdvice();
      return;
    }

    const podiumState = canFlip ? Flip.getState(podium.children) : null;
    const positionsState = canFlip
      ? Flip.getState(positionsTable.querySelectorAll('.position-card'))
      : null;

    renderPodium(viewId, standings);
    renderPositions(viewId, standings);

    if (canFlip) {
      animatePositionChange(podiumState, positionsState);
    } else {
      animateInitialRender();
    }
  };

  /* Allow Values: schools, teams, students, male-students, female-students */
  const switcherButtons = document.querySelectorAll('.content-switcher button');
  switcherButtons.forEach((button) => {
    button.addEventListener('click', () => {
      switcherButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      updateView(button.id);
    });
  });

  updateView('schools');

  notifyDataChange(() => {
    updateView(actualViewId);
    if (printTable) renderPrintTable(printTable);
  });
});
