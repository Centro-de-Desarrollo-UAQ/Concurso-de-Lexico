import {
  getSchoolStandings,
  getTeamStandings,
  getStudentStandings,
  notifyDataChange,
} from '../js/data.js';

window.addEventListener('DOMContentLoaded', () => {
  const gsap = window.gsap;
  const Flip = window.Flip;
  let actualViewId;

  const podium = document.getElementById('podium');
  const positionsTable = document.getElementById('positions-table');
  const printDetails = document.getElementById('print-details');

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

  const getStandingHeadingHTML = (viewId) => {
    switch (viewId) {
      case 'schools':
        return /* html */ `
          <p class="text-bold">Pos</p>
          <p class="text-bold">Escuela</p>
          <p class="text-bold">Equipos</p>
          <p class="text-bold">Puntos</p>
          <p class="text-bold">G</p>
          <p class="text-bold">E</p>
          <p class="text-bold">P</p>
        `;
      case 'teams':
        return /* html */ `
          <p class="text-bold">Pos</p>
          <p class="text-bold">Equipo</p>
          <p class="text-bold">Escuela</p>
          <p class="text-bold">Puntos</p>
          <p class="text-bold">G</p>
          <p class="text-bold">E</p>
          <p class="text-bold">P</p>
        `;
      case 'students':
      case 'male-students':
      case 'female-students':
        return /* html */ `
          <p class="text-bold">Pos</p>
          <p class="text-bold">Estudiante</p>
          <p class="text-bold">Escuela</p>
          <p class="text-bold">Equipo</p>
          <p class="text-bold">Rondas Jugadas</p>
          <p class="text-bold">Puntos</p>
        `;
    }
  };

  const getStandingHTML = (viewId, entry, position) => {
    switch (viewId) {
      case 'schools':
        return /* html */ `
          <p class="text-bold">${position}</p>
          <p>${entry.school}</p>
          <p>${entry.teams}</p>
          <p>${entry.score}</p>
          <p>${entry.wins}</p>
          <p>${entry.draws}</p>
          <p>${entry.losses}</p>
        `;
      case 'teams':
        return /* html */ `
          <p class="text-bold">${position}</p>
          <p>${entry.name}</p>
          <p>${entry.school}</p>
          <p>${entry.score}</p>
          <p>${entry.wins}</p>
          <p>${entry.draws}</p>
          <p>${entry.losses}</p>
        `;
      case 'students':
      case 'male-students':
      case 'female-students':
        return /* html */ `
          <p class="text-bold">${position}</p>
          <p>${entry.name}</p>
          <p>${entry.school}</p>
          <p>${entry.team}</p>
          <p>${entry.roundsPlayed}</p>
          <p>${entry.score}</p>
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
      [...positionsTable.querySelectorAll('.position-card[data-standing-key]')].map(
        (element) => [element.dataset.standingKey, element]
      )
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
    const visualOrder = [podiumElements[1], podiumElements[0], podiumElements[2]];
    podium.replaceChildren(...visualOrder.filter(Boolean));
  };

  const renderNoTeamsAdvice = () => {
    const adviceElement = document.createElement('h3');
    adviceElement.classList.add('text-center', 'text-bold');
    adviceElement.textContent =
      'No hay equipos registrados. Por favor, registre equipos para ver la clasificación.';

    podium.appendChild(adviceElement);
  };

  const renderPrintDetails = (viewId) => {
    printDetails.innerHTML = /* html */ `
      <h1 class="text-center text-2xl text-bold">Clasificación de ${getName(viewId)}</h1>
      <p class="text-center">Generado el ${new Date().toLocaleDateString()}</p>
    `;
  };

  const animateInitialRender = () => {
    const podiumAnimationOrder = [...podium.querySelectorAll('.podium-entry')].sort(
      (left, right) => {
        const leftPosition = Number(
          left.querySelector('.podium-number').textContent
        );
        const rightPosition = Number(
          right.querySelector('.podium-number').textContent
        );
        return rightPosition - leftPosition;
      }
    );

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
        gsap.set(
          positionsTable.querySelectorAll('.position-card'),
          { clearProps: 'transform' }
        ),
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
    printDetails.innerHTML = '';

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
    renderPrintDetails(viewId);

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
  });
});
