import {
  getData,
  getTeam,
  getRounds,
  getTotalRounds,
  generateRound,
  recordMatchResult,
} from '../js/data.js';
import { alertCustom } from '../js/main-buttons.js';

// ---------- Helpers para leer nombre/id de estudiante (igual que en data.js) ----------
function getStudentId(team, student, index) {
  return typeof student === 'object' && student !== null && student.id
    ? student.id
    : `${team.id}_student_${index + 1}`;
}

function getStudentName(student) {
  return typeof student === 'object' && student !== null
    ? student.name || student.nombre || 'Estudiante'
    : String(student);
}

let rondaSeleccionada = 1;

// ---------- Generar siguiente ronda ----------
// ---------- Evento del Botón Principal ----------
document
  .getElementById('btnSiguienteRonda')
  .addEventListener('click', async () => {
    const data = getData();
    const rounds = getRounds();
    const totalRounds = getTotalRounds();

    // 1. Si ya se generaron todas las rondas, redirige a Clasificaciones
    if (rounds.length >= totalRounds) {
      window.location.href = '../clasificacion/clasificacion.html';
      return;
    }

    // 2. Validación de equipos mínimos
    if (data.teams.length < 2) {
      await alertCustom(
        'Todavía no hay suficientes equipos registrados (se necesitan al menos 2).'
      );
      return;
    }

    // 3. Intenta generar la siguiente ronda
    try {
      const nuevaRonda = generateRound();
      rondaSeleccionada = nuevaRonda.number;

      window.scrollTo({ top: 0, behavior: 'smooth' });

      await alertCustom(`Se ha generado la ronda ${nuevaRonda.number}.`);
    } catch (err) {
      await alertCustom(err.message);
    }

    renderizarPantalla();
  });

// ---------- Registrar puntajes de un enfrentamiento ----------
async function registrarEnfrentamiento(roundId, pairingId, tarjeta) {
  const checksIzq = tarjeta.querySelectorAll('.col-izq .check-participa');
  const inputsIzq = tarjeta.querySelectorAll('.col-izq .input-puntaje');
  const checksDer = tarjeta.querySelectorAll('.col-der .check-participa');
  const inputsDer = tarjeta.querySelectorAll('.col-der .input-puntaje');

  const teamAScores = [];
  checksIzq.forEach((chk, i) => {
    if (chk.checked) {
      teamAScores.push({
        participantId: chk.dataset.studentId,
        score: Number(inputsIzq[i].value),
      });
    }
  });

  const teamBScores = [];
  checksDer.forEach((chk, i) => {
    if (chk.checked) {
      teamBScores.push({
        participantId: chk.dataset.studentId,
        score: Number(inputsDer[i].value),
      });
    }
  });

  if (teamAScores.length !== 4 || teamBScores.length !== 4) {
    await alertCustom(
      'Cada equipo debe tener exactamente 4 de sus 5 integrantes marcados.'
    );
    return;
  }

  try {
    recordMatchResult(roundId, pairingId, teamAScores, teamBScores);
    await alertCustom('Resultados registrados correctamente.');
  } catch (err) {
    await alertCustom(err.message);
    return;
  }

  renderizarPantalla();
}

// ---------- Dibuja una columna de 5 estudiantes con checkbox + input ----------
function renderColumnaEstudiantes(
  team,
  studentIdsGuardados,
  studentsConPuntaje,
  lado
) {
  return team.students
    .map((student, index) => {
      const studentId = getStudentId(team, student, index);
      const nombre = getStudentName(student);

      const resultado = studentsConPuntaje?.find((s) => s.id === studentId);
      const yaJugoEsteId = resultado ? true : false;
      const puntaje = resultado ? resultado.score : 0;

      return `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                <input type="checkbox" tabindex="-1" class="check-participa" data-student-id="${studentId}" ${yaJugoEsteId || !studentsConPuntaje ? 'checked' : ''}>
                <label style="flex:1;">${nombre}</label>
                <input type="number" value="${puntaje}" class="input-puntaje">
            </div>
        `;
    })
    .join('');
}

// ---------- Dibuja toda la pantalla ----------
function renderizarPantalla() {
  const rounds = getRounds();
  const totalRounds = getTotalRounds();

  document.getElementById('numRondasGeneradas').textContent = rounds.length;
  document.getElementById('numRondasFinalizadas').textContent = rounds.filter(
    (r) => r.pairings.every((p) => p.completed)
  ).length;
  document.getElementById('numRondasProgramadas').textContent = totalRounds;
  document.getElementById('numTotalEquipos').textContent =
    getData().teams.length;

  // Pestañas de rondas
  const tabsContainer = document.getElementById('tabsRondas');
  tabsContainer.innerHTML = '';
  for (let i = 1; i <= Math.max(rounds.length, 1); i++) {
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = 'Ronda ' + i;
    if (i === rondaSeleccionada) a.classList.add('active');
    a.onclick = (e) => {
      e.preventDefault();
      rondaSeleccionada = i;
      renderizarPantalla();
    };
    tabsContainer.appendChild(a);

    // ---------- Control del Botón Principal (Siguiente Ronda / Ver Resultados) ----------
    const btnPrincipal = document.getElementById('btnSiguienteRonda');

    // Evaluamos si ya se generaron todas las rondas programadas
    if (rounds.length >= totalRounds) {
      btnPrincipal.textContent = 'Ver resultados';
      // Cambiar la clase de estilo para distinguirlo
      btnPrincipal.className = 'button accent-button'; 
    } else {
      btnPrincipal.textContent = 'Generar siguiente ronda';
      btnPrincipal.className = 'button default-button';
    }
  }

  const lista = document.getElementById('listaEnfrentamientos');
  lista.innerHTML = '';

  const ronda = rounds.find((r) => r.number === rondaSeleccionada);
  if (!ronda) return;

  if (ronda.byeTeamId) {
    const equipoBye = getTeam(ronda.byeTeamId);
    const aviso = document.createElement('p');
    aviso.className = 'text-base';
    aviso.style.color = 'white';
    aviso.textContent = `Descansa esta ronda: ${equipoBye.name} (${equipoBye.school})`;
    lista.appendChild(aviso);
  }

  ronda.pairings.forEach((pairing) => {
    const teamA = getTeam(pairing.teamAId);
    const teamB = getTeam(pairing.teamBId);

    const tarjeta = document.createElement('div');
    tarjeta.className = 'card';

    tarjeta.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div><strong>${teamA.name}</strong><br><span class="text-xs">${teamA.school}</span></div>
                <div class="text-bold text-lg">VS</div>
                <div style="text-align:right;"><strong>${teamB.name}</strong><br><span class="text-xs">${teamB.school}</span></div>
            </div>

            <div style="display:flex; justify-content:space-between; gap:20px;">
                <div class="col-izq" style="flex:1;">
                    ${renderColumnaEstudiantes(teamA, pairing.teamAStudentIds, pairing.completed ? pairing.teamAStudents : null)}
                </div>
                <div class="col-der" style="flex:1;">
                    ${renderColumnaEstudiantes(teamB, pairing.teamBStudentIds, pairing.completed ? pairing.teamBStudents : null)}
                </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="text-bold">Marcador: ${pairing.teamAScore}-${pairing.teamBScore}</span>
                <button class="button accent-button">${pairing.completed ? 'Modificar Puntajes' : 'Registrar Enfrentamiento'}</button>
            </div>
        `;

    tarjeta.querySelector('.button').onclick = () =>
      registrarEnfrentamiento(ronda.id, pairing.id, tarjeta);

    lista.appendChild(tarjeta);
  });
}

renderizarPantalla();
