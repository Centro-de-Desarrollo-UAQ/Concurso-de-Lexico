/*
 * type Student = string | {
 *   id?: string;
 *   name?: string;
 *   nombre?: string;
 *   gender?: "male" | "female";
 * };
 *
 * type Team = {
 *   id: string;
 *   school: string;
 *   name: string;
 *   students: [Student, Student, Student, Student, Student];
 * };
 *
 * type Participant = {
 *   id: string;
 *   name: string;
 *   score: number;
 * };
 *
 * type Pairing = {
 *   id: string;
 *   teamAId: string;
 *   teamBId: string;
 *   teamAStudentIds: string[];
 *   teamBStudentIds: string[];
 *   teamAStudents: Participant[];
 *   teamBStudents: Participant[];
 *   teamAScore: number;
 *   teamBScore: number;
 *   completed: boolean;
 * };
 *
 * type Round = {
 *   id: string;
 *   number: number;
 *   pairings: Pairing[];
 *   byeTeamId: string | null;
 * };
 *
 * type TournamentData = {
 *   eventName: string;
 *   totalRounds: number;
 *   teams: Team[];
 *   rounds: Round[];
 *   started: boolean;
 *   createdAt: string;
 *   updatedAt: string;
 * };
 *
 * type MatchResult = {
 *   participantId: string;
 *   score: number;
 * };
 */

const STORAGE_KEY = "datos_torneo";
const STUDENTS_PER_TEAM = 5;
const PLAYERS_PER_MATCH = 4;

const uid = prefix => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export const initialData = () => ({
  eventName: "Concurso de Léxico",
  totalRounds: 5,
  teams: [],
  rounds: [],
  started: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const loadState = () => {
  let storedData = localStorage.getItem(STORAGE_KEY);

  if (!storedData) {
    storedData = JSON.stringify(initialData());
    localStorage.setItem(STORAGE_KEY, storedData);
  }

  return JSON.parse(storedData);
};

let dataState = loadState();

const saveState = () => {
  dataState.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataState));
};

// API Functions
export const getData = () => dataState;

export const setData = data => {
  dataState = data;
  saveState();
};

export const startTournament = () => {
  if (dataState.teams.length < 2) {
    throw new Error("Se necesitan al menos 2 equipos para iniciar el torneo.");
  }

  dataState.started = true;
  if (dataState.rounds.length === 0) {
    generateRound();
  }
  saveState();
};

export const setEventName = name => {
  dataState.eventName = name;
  saveState();
};

export const getEventName = () => dataState.eventName;

export const setTotalRounds = rounds => {
  dataState.totalRounds = rounds;
  saveState();
};

export const getTotalRounds = () => dataState.totalRounds;

export const getTeam = teamId => dataState.teams.find(team => team.id === teamId);

export const getTeams = () => dataState.teams;

export const addTeam = ({ school, name, students }) => {
  if (dataState.started) {
    throw new Error("No se pueden agregar equipos después de que el torneo ha comenzado.");
  }

  if (!school || !name || !students || students.length !== STUDENTS_PER_TEAM) {
    throw new Error("Todos los campos son obligatorios y debe haber 5 estudiantes.");
  }

  if (dataState.teams.some(team => team.school === school && team.name === name)) {
    throw new Error("Ya existe un equipo con el mismo nombre y escuela.");
  }

  if(students.some(student => !student.gender)) {
    throw new Error("Todos los estudiantes deben tener un género especificado (male o female).");
  }

  const newTeam = {
    id: uid("team"),
    school,
    name,
    students,
  };

  dataState.teams.push(newTeam);
  saveState();
};

export const editTeam = (teamId, { school, name, students }) => {
  if (dataState.started) {
    throw new Error("No se pueden editar equipos después de que el torneo ha comenzado.");
  }

  if(students.some(student => !student.gender)) {
    throw new Error("Todos los estudiantes deben tener un género especificado (male o female).");
  }

  if (!school || !name || !students || students.length !== STUDENTS_PER_TEAM) {
    throw new Error("Todos los campos son obligatorios y debe haber 5 estudiantes.");
  }

  const teamIndex = dataState.teams.findIndex(team => team.id === teamId);
  if (teamIndex === -1) {
    throw new Error("No se encontró el equipo.");
  }

  dataState.teams[teamIndex] = {
    id: teamId,
    school,
    name,
    students,
  };

  saveState();
};

export const deleteTeam = teamId => {
  if (dataState.started) {
    throw new Error("No se pueden eliminar equipos después de que el torneo ha comenzado.");
  }

  const teamIndex = dataState.teams.findIndex(team => team.id === teamId);
  if (teamIndex === -1) {
    throw new Error("No se encontró el equipo.");
  }

  dataState.teams.splice(teamIndex, 1);
  saveState();
};

const getStudentId = (team, student, index) =>
  typeof student === "object" && student !== null && student.id
    ? student.id
    : `${team.id}_student_${index + 1}`;

const getStudentName = student =>
  typeof student === "object" && student !== null
    ? student.name || student.nombre || "Estudiante"
    : String(student);

const createParticipants = (team, studentIds) =>
  team.students
    .map((student, index) => ({ student, index, id: getStudentId(team, student, index) }))
    .filter(({ id }) => studentIds.includes(id))
    .map(({ student, id }) => ({
      id,
      name: getStudentName(student),
      score: 0,
    }));

const getTeamScore = teamId =>
  dataState.rounds.reduce((totalScore, round) => {
    const teamPairings = round.pairings.filter(
      pairing => pairing.teamAId === teamId || pairing.teamBId === teamId
    );

    return (
      totalScore +
      teamPairings.reduce((roundScore, pairing) => {
        const teamScore = pairing.teamAId === teamId ? pairing.teamAScore : pairing.teamBScore;
        return roundScore + (teamScore || 0);
      }, 0)
    );
  }, 0);

const getPlayedOpponents = () => {
  const opponents = new Map(dataState.teams.map(team => [team.id, new Set()]));

  dataState.rounds.forEach(round =>
    round.pairings.forEach(pairing => {
      opponents.get(pairing.teamAId)?.add(pairing.teamBId);
      opponents.get(pairing.teamBId)?.add(pairing.teamAId);
    })
  );

  return opponents;
};

const shuffle = values => {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const compareTeamStandings = (left, right) => {
  const scoreDifference = getTeamScore(right.id) - getTeamScore(left.id);
  return scoreDifference || left.id.localeCompare(right.id);
};

const canPair = (team, candidate) => team.school !== candidate.school;

const getPairingCandidates = (team, remainingTeams, opponents) => {
  const teamOpponents = opponents.get(team.id);

  return remainingTeams
    .filter(candidate => canPair(team, candidate))
    .sort((left, right) => {
      const leftHasRematch = teamOpponents.has(left.id);
      const rightHasRematch = teamOpponents.has(right.id);
      return Number(leftHasRematch) - Number(rightHasRematch);
    });
};

const findPairings = (teams, opponents, allowBye) => {
  if (teams.length === 0) return { pairings: [], byeTeam: null };

  const team = teams[0];
  const remaining = teams.slice(1);
  const candidates = getPairingCandidates(team, remaining, opponents);

  for (const candidate of candidates) {
    const result = findPairings(
      remaining.filter(other => other.id !== candidate.id),
      opponents,
      allowBye
    );
    if (result) {
      return {
        pairings: [[team, candidate], ...result.pairings],
        byeTeam: result.byeTeam,
      };
    }
  }

  if (allowBye) {
    const result = findPairings(remaining, opponents, false);
    if (result) return { pairings: result.pairings, byeTeam: team };
  }

  return null;
};

const buildPairings = orderedTeams => {
  const opponents = getPlayedOpponents();
  const result = findPairings(orderedTeams, opponents, orderedTeams.length % 2 === 1);

  if (!result) {
    throw new Error(
      "No existe un emparejamiento posible sin enfrentar equipos de la misma escuela."
    );
  }

  return {
    pairings: result.pairings.map(([teamA, teamB]) => ({
      id: uid("match"),
      teamAId: teamA.id,
      teamBId: teamB.id,
      teamAStudentIds: teamA.students.map((student, index) => getStudentId(teamA, student, index)),
      teamBStudentIds: teamB.students.map((student, index) => getStudentId(teamB, student, index)),
      teamAStudents: [],
      teamBStudents: [],
      teamAScore: 0,
      teamBScore: 0,
      completed: false,
    })),
    byeTeamId: result.byeTeam?.id || null,
  };
};

export const getTeamStandings = () => {
  return dataState.teams
    .map(team => {
      const wins = dataState.rounds.reduce((count, round) => {
        const pairing = round.pairings.find(
          pairing => pairing.teamAId === team.id || pairing.teamBId === team.id
        );

        if (!pairing || !pairing.completed) return count;

        if (pairing.teamAId === team.id) {
          return count + (pairing.teamAScore > pairing.teamBScore ? 1 : 0);
        } else {
          return count + (pairing.teamBScore > pairing.teamAScore ? 1 : 0);
        }
      }, 0);

      const draws = dataState.rounds.reduce((count, round) => {
        const pairing = round.pairings.find(
          pairing => pairing.teamAId === team.id || pairing.teamBId === team.id
        );
        if (!pairing || !pairing.completed) return count;

        return count + (pairing.teamAScore === pairing.teamBScore ? 1 : 0);
      }, 0);

      const losses = dataState.rounds.reduce((count, round) => {
        const pairing = round.pairings.find(
          pairing => pairing.teamAId === team.id || pairing.teamBId === team.id
        );
        if (!pairing || !pairing.completed) return count;
        if (pairing.teamAId === team.id) {
          return count + (pairing.teamAScore < pairing.teamBScore ? 1 : 0);
        } else {
          return count + (pairing.teamBScore < pairing.teamAScore ? 1 : 0);
        }
      }, 0);

      return { ...team, score: getTeamScore(team.id), wins, draws, losses };
    })
    .sort(compareTeamStandings);
};

export const getSchoolStandings = () => {
  const schoolScores = new Map();
  const teamStandings = getTeamStandings();

  for (const team of teamStandings) {
    const school = team.school;
    const score = schoolScores.get(school) || 0;

    schoolScores.set(school, score + team.score);
  }

  return Array.from(schoolScores.entries())
    .map(([school, score]) => {
      const teams = teamStandings.filter(t => t.school === school);
      const wins = teams.reduce((acc, team) => acc + team.wins, 0);
      const draws = teams.reduce((acc, team) => acc + team.draws, 0);
      const losses = teams.reduce((acc, team) => acc + team.losses, 0);

      return { school, teams: teams.length, score, wins, draws, losses };
    })
    .sort((left, right) => right.score - left.score);
};

const getStudentScore = (team, student) => {
  const studentId = getStudentId(team, student, team.students.indexOf(student));
  return dataState.rounds.reduce((total, round) => {
    round.pairings.forEach(pairing => {
      if (pairing.teamAId === team.id && pairing.teamAStudentIds.includes(studentId)) {
        const studentResult = pairing.teamAStudents.find(s => s.id === studentId);
        if (studentResult) {
          total += studentResult.score;
        }
      } else if (pairing.teamBId === team.id && pairing.teamBStudentIds.includes(studentId)) {
        const studentResult = pairing.teamBStudents.find(s => s.id === studentId);
        if (studentResult) {
          total += studentResult.score;
        }
      }
    });
    return total;
  }, 0);
};

export const getStudentStandings = () => {
  const studentScores = new Map();

  for (const team of dataState.teams) {
    for (const student of team.students) {
      const studentId = getStudentId(team, student, team.students.indexOf(student));
      const score = studentScores.get(studentId) || 0;

      studentScores.set(studentId, score + getStudentScore(team, student));
    }
  }

  return Array.from(studentScores.entries())
    .map(([studentId, score]) => {
      const team = dataState.teams.find(team =>
        team.students.some(s => getStudentId(team, s, team.students.indexOf(s)) === studentId)
      );

      const student = dataState.teams
        .flatMap(team => team.students)
        .find(student => getStudentId(team, student, team.students.indexOf(student)) === studentId);

      const roundsPlayed = dataState.rounds.reduce((count, round) => {
        const match = round.pairings.find(
          pairing =>
            (pairing.teamAId === team.id && pairing.teamAStudents.some(s => s.id === studentId)) ||
            (pairing.teamBId === team.id && pairing.teamBStudents.some(s => s.id === studentId))
        );
        return count + (match ? 1 : 0);
      }, 0);


      return {
        studentId,
        score,
        name: student?.name,
        school: team?.school,
        team: team?.name,
        roundsPlayed: roundsPlayed,
        gender: student?.gender
      };
    })
    .sort((left, right) => right.score - left.score);
};

export const generateRound = () => {
  if (dataState.rounds.length >= dataState.totalRounds) {
    throw new Error("Ya se generaron todas las rondas programadas.");
  }

  const roundNumber = dataState.rounds.length + 1;
  const orderedTeams = roundNumber === 1 ? shuffle(dataState.teams) : getTeamStandings();
  const roundPairings = buildPairings(orderedTeams);
  const round = {
    id: uid("round"),
    number: roundNumber,
    pairings: roundPairings.pairings,
    byeTeamId: roundPairings.byeTeamId,
  };

  dataState.rounds.push(round);
  saveState();
  return round;
};

export const getRounds = () => dataState.rounds;

const getMatchContext = (roundId, pairingId) => {
  const round = dataState.rounds.find(candidate => candidate.id === roundId);
  const pairing = round?.pairings.find(candidate => candidate.id === pairingId);

  return {
    pairing,
    teamA: getTeam(pairing?.teamAId),
    teamB: getTeam(pairing?.teamBId),
  };
};

const getResultParticipantIds = results =>
  Array.isArray(results) ? results.map(result => result?.participantId) : [];

const hasValidScoreEntries = results =>
  Array.isArray(results) &&
  results.length === PLAYERS_PER_MATCH &&
  results.every(
    result =>
      result &&
      typeof result === "object" &&
      Object.hasOwn(result, "participantId") &&
      Object.hasOwn(result, "score")
  ) &&
  new Set(getResultParticipantIds(results)).size === PLAYERS_PER_MATCH;

const validateMatchParticipants = (pairing, teamAScores, teamBScores) => {
  const teamAStudentIds = getResultParticipantIds(teamAScores);
  const teamBStudentIds = getResultParticipantIds(teamBScores);
  const hasInvalidTeamAPlayer = teamAStudentIds.some(
    studentId => !pairing.teamAStudentIds.includes(studentId)
  );
  const hasInvalidTeamBPlayer = teamBStudentIds.some(
    studentId => !pairing.teamBStudentIds.includes(studentId)
  );

  if (hasInvalidTeamAPlayer || hasInvalidTeamBPlayer) {
    throw new Error("Los jugadores seleccionados deben pertenecer al equipo del enfrentamiento.");
  }
};

const validateScores = (teamAScores, teamBScores) => {
  const scores = [...teamAScores, ...teamBScores].map(result => Number(result.score));

  if (scores.some(score => !Number.isFinite(score) || score < 0)) {
    throw new Error("Los puntajes deben ser números mayores o iguales a cero.");
  }
};

/**
 * Registra el resultado de un enfrentamiento.
 *
 * `teamAScores` y `teamBScores` deben ser arreglos de exactamente 4 objetos
 * con la forma `{ participantId, score }`, por ejemplo:
 * `[{ participantId: "student_1", score: 8 }, ...]`.
 * `participantId` identifica al jugador que participo y `score` es su puntaje.
 */
export const recordMatchResult = (roundId, pairingId, teamAScores, teamBScores) => {
  const { pairing, teamA, teamB } = getMatchContext(roundId, pairingId);

  if (
    !pairing ||
    !teamA ||
    !teamB ||
    !hasValidScoreEntries(teamAScores) ||
    !hasValidScoreEntries(teamBScores)
  ) {
    throw new Error("Cada equipo debe indicar exactamente 4 jugadores y sus puntajes.");
  }

  const teamAStudentIds = getResultParticipantIds(teamAScores);
  const teamBStudentIds = getResultParticipantIds(teamBScores);
  validateMatchParticipants(pairing, teamAScores, teamBScores);
  validateScores(teamAScores, teamBScores);

  pairing.teamAStudents = createParticipants(teamA, teamAStudentIds);
  pairing.teamBStudents = createParticipants(teamB, teamBStudentIds);
  pairing.teamAStudents.forEach((student, index) => {
    student.score = Number(teamAScores[index].score);
  });
  pairing.teamBStudents.forEach((student, index) => {
    student.score = Number(teamBScores[index].score);
  });
  pairing.teamAScore = teamAScores.reduce((total, result) => total + Number(result.score), 0);
  pairing.teamBScore = teamBScores.reduce((total, result) => total + Number(result.score), 0);
  pairing.completed = true;
  saveState();
  return pairing;
};