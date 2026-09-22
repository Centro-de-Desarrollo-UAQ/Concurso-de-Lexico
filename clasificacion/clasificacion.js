import { getSchoolStandings, getTeamStandings, getStudentStandings } from "../js/data.js";

window.addEventListener("DOMContentLoaded", () => {
  const podium = document.getElementById("podium");
  const positionsTable = document.getElementById("positions-table");

  const getStandings = viewId => {
    switch (viewId) {
      case "schools":
        return getSchoolStandings();
      case "teams":
        return getTeamStandings();
      case "students":
        return getStudentStandings();
      case "male-students":
        return getStudentStandings().filter(student => student.gender === "male");
      case "female-students":
        return getStudentStandings().filter(student => student.gender === "female");
    }
  };

  const getStandingHeadingHTML = viewId => {
    switch (viewId) {
      case "schools":
        return /* html */ `
          <p class="text-bold">Pos</p>
          <p class="text-bold">Escuela</p>
          <p class="text-bold">Equipos</p>
          <p class="text-bold">Puntos</p>
          <p class="text-bold">G</p>
          <p class="text-bold">E</p>
          <p class="text-bold">P</p>
        `;
      case "teams":
        return /* html */ `
          <p class="text-bold">Pos</p>
          <p class="text-bold">Equipo</p>
          <p class="text-bold">Escuela</p>
          <p class="text-bold">Puntos</p>
          <p class="text-bold">G</p>
          <p class="text-bold">E</p>
          <p class="text-bold">P</p>
        `;
      case "students":
      case "male-students":
      case "female-students":
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
      case "schools":
        return /* html */ `
          <p class="text-bold">${position}</p>
          <p>${entry.school}</p>
          <p>${entry.teams}</p>
          <p>${entry.score}</p>
          <p>${entry.wins}</p>
          <p>${entry.draws}</p>
          <p>${entry.losses}</p>
        `;
      case "teams":
        return /* html */ `
          <p class="text-bold">${position}</p>
          <p>${entry.name}</p>
          <p>${entry.school}</p>
          <p>${entry.score}</p>
          <p>${entry.wins}</p>
          <p>${entry.draws}</p>
          <p>${entry.losses}</p>
        `;
      case "students":
      case "male-students":
      case "female-students":
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

  const getStandingGridStyle = viewId => {
    switch (viewId) {
      case "schools":
        return "grid-template-columns: 1fr 3fr 1fr 1fr 1fr 1fr 1fr;";
      case "teams":
        return "grid-template-columns: 1fr 3fr 3fr 1fr 1fr 1fr 1fr;";
      case "students":
      case "male-students":
      case "female-students":
        return "grid-template-columns: 1fr 3fr 3fr 3fr 2fr 1fr;";
    }
  }

  const renderPositions = (viewId, standings) => {
    positionsTable.innerHTML = "";

    const positionsElements = standings.map((entry, index) => {
      const entryElement = document.createElement("div");
      entryElement.classList.add("position-card", "card");
      entryElement.style = getStandingGridStyle(viewId);
  
      entryElement.innerHTML = getStandingHTML(viewId, entry, index + 1);
      return entryElement;
    });
  
    const headingElement = document.createElement("div");
    headingElement.classList.add("position-card", "card");
    headingElement.style = getStandingGridStyle(viewId);
    headingElement.innerHTML = getStandingHeadingHTML(viewId);
  
    positionsTable.appendChild(headingElement);
    positionsElements.forEach(element => positionsTable.appendChild(element));
  }

  const renderPodium = (viewId, standings) => {
    podium.innerHTML = "";

    const podiumEntries = standings.slice(0, 3);

    const podiumElements = podiumEntries.map((entry, index) => {
      const podiumEntry = document.createElement("div");
      podiumEntry.classList.add("podium-entry", `podium-${index + 1}`);
      podiumEntry.innerHTML = /* html */ `
        <p class="podium-number">${index + 1}</p>
        <p class="text-xl">${entry.name || entry.school}</p>
        <p class="text-bold">${entry.score} pts</p>
      `;

      return podiumEntry;
    });

    podium.appendChild(podiumElements[1]);
    podium.appendChild(podiumElements[0]);
    podium.appendChild(podiumElements[2]);
  }

  const updateView = viewId => {
    podium.innerHTML = "";

    const standings = getStandings(viewId);

    renderPodium(viewId, standings);
    renderPositions(viewId, standings);
  };

  /* Allow Values: schools, teams, students, male-students, female-students */
  const switcherButtons = document.querySelectorAll(".content-switcher button");
  switcherButtons.forEach(button => {
    button.addEventListener("click", () => {
      switcherButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      updateView(button.id);
    });
  });

  updateView("schools");
});
