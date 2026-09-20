const config = JSON.parse(localStorage.getItem("lexico_config")) || { numRondas: 5 };
l
et rondas = JSON.parse(localStorage.getItem("lexico_rondas")) || [];

let equipos = JSON.parse(localStorage.getItem("lexico_equipos"));

if (!equipos || equipos.length === 0) {
    equipos = [
        { id: "eq1", escuela: "Escuela A", nombre: "Equipo 1", estudiantes: [] },
        { id: "eq2", escuela: "Escuela A", nombre: "Equipo 2", estudiantes: [] },
        { id: "eq3", escuela: "Escuela B", nombre: "Equipo 3", estudiantes: [] },
        { id: "eq4", escuela: "Escuela B", nombre: "Equipo 4", estudiantes: [] },
        { id: "eq5", escuela: "Escuela C", nombre: "Equipo 5", estudiantes: [] },
        { id: "eq6", escuela: "Escuela C", nombre: "Equipo 6", estudiantes: [] },
        { id: "eq7", escuela: "Escuela D", nombre: "Equipo 7", estudiantes: [] }
    ];
    localStorage.setItem("lexico_equipos", JSON.stringify(equipos));
    console.log("No había equipos guardados — se generaron equipos de prueba automáticamente.");
}

const LIMITE_RONDAS = config.numRondas;
let rondaSeleccionada = rondas.length > 0 ? rondas.length : 1;

function guardarRondas() {
    localStorage.setItem("lexico_rondas", JSON.stringify(rondas));
}

function buscarEquipo(id) {
    return equipos.find(e => e.id === id);
}

function mismaEscuela(id1, id2) {
    const e1 = buscarEquipo(id1);
    const e2 = buscarEquipo(id2);
    return e1.escuela === e2.escuela;
}

function yaSeEnfrentaron(id1, id2) {
    return rondas.some(ronda =>
        ronda.enfrentamientos.some(enf =>
            (enf.equipo1Id === id1 && enf.equipo2Id === id2) ||
            (enf.equipo1Id === id2 && enf.equipo2Id === id1)
        )
    );
}

function puntajeAcumulado(equipoId) {
    let total = 0;
    rondas.forEach(ronda => {
        ronda.enfrentamientos.forEach(enf => {
            if (!enf.finalizado) return;
            if (enf.equipo1Id === equipoId) total += enf.puntajes1.filter(p => p !== null).reduce((a, b) => a + b, 0);
            if (enf.equipo2Id === equipoId) total += enf.puntajes2.filter(p => p !== null).reduce((a, b) => a + b, 0);
        });
    });
    return total;
}

function crearEnfrentamiento(id1, id2) {
    return {
        equipo1Id: id1,
        equipo2Id: id2,
        puntajes1: [0, 0, 0, 0, null],
        puntajes2: [0, 0, 0, 0, null],
        finalizado: false
    };
}

function generarRonda1() {
    let disponibles = equipos.map(e => e.id);

    for (let i = disponibles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [disponibles[i], disponibles[j]] = [disponibles[j], disponibles[i]];
    }

    const enfrentamientos = [];
    while (disponibles.length > 1) {
        const id1 = disponibles.shift();
        const indexRival = disponibles.findIndex(id2 => !mismaEscuela(id1, id2));
        if (indexRival === -1) { disponibles.push(id1); break; }
        const id2 = disponibles.splice(indexRival, 1)[0];
        enfrentamientos.push(crearEnfrentamiento(id1, id2));
    }

    const bye = disponibles.length === 1 ? disponibles[0] : null;
    rondas.push({ numero: 1, bye, enfrentamientos });
    guardarRondas();
}

function generarSiguienteRonda() {
    const numeroRonda = rondas.length + 1;

    if (numeroRonda > LIMITE_RONDAS) {
        alert("Ya se generaron todas las rondas programadas (" + LIMITE_RONDAS + ").");
        return;
    }

    let disponibles = equipos.map(e => e.id)
        .sort((a, b) => puntajeAcumulado(b) - puntajeAcumulado(a));

    const enfrentamientos = [];
    while (disponibles.length > 1) {
        const id1 = disponibles.shift();

        let indexRival = disponibles.findIndex(id2 =>
            !mismaEscuela(id1, id2) && !yaSeEnfrentaron(id1, id2)
        );
        if (indexRival === -1) {
            indexRival = disponibles.findIndex(id2 => !mismaEscuela(id1, id2));
        }
        if (indexRival === -1) { disponibles.push(id1); break; }

        const id2 = disponibles.splice(indexRival, 1)[0];
        enfrentamientos.push(crearEnfrentamiento(id1, id2));
    }

    const bye = disponibles.length === 1 ? disponibles[0] : null;
    rondas.push({ numero: numeroRonda, bye, enfrentamientos });
    guardarRondas();
    rondaSeleccionada = numeroRonda;
}

function registrarEnfrentamiento(numeroRonda, indexEnfrentamiento) {
    const ronda = rondas.find(r => r.numero === numeroRonda);
    const enf = ronda.enfrentamientos[indexEnfrentamiento];
    const tarjeta = document.querySelector(`[data-ronda="${numeroRonda}"][data-index="${indexEnfrentamiento}"]`);

    const inputsIzq = tarjeta.querySelectorAll(".col-izq .input-puntaje");
    const checksIzq = tarjeta.querySelectorAll(".col-izq .check-participa");
    const inputsDer = tarjeta.querySelectorAll(".col-der .input-puntaje");
    const checksDer = tarjeta.querySelectorAll(".col-der .check-participa");

    enf.puntajes1 = Array.from(inputsIzq).map((input, i) => checksIzq[i].checked ? Number(input.value) : null);
    enf.puntajes2 = Array.from(inputsDer).map((input, i) => checksDer[i].checked ? Number(input.value) : null);

    enf.finalizado = true;
    guardarRondas();
    renderizarPantalla();
}

function renderizarPantalla() {
    document.getElementById("numRondasGeneradas").textContent = rondas.length;
    document.getElementById("numRondasFinalizadas").textContent =
        rondas.filter(r => r.enfrentamientos.every(e => e.finalizado)).length;
    document.getElementById("numRondasProgramadas").textContent = LIMITE_RONDAS;
    document.getElementById("numTotalEquipos").textContent = equipos.length;

    const tabsContainer = document.getElementById("tabsRondas");
    tabsContainer.innerHTML = "";
    for (let i = 1; i <= Math.max(rondas.length, 1); i++) {
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = "Ronda " + i;
        if (i === rondaSeleccionada) a.classList.add("active");
        a.onclick = (e) => { e.preventDefault(); rondaSeleccionada = i; renderizarPantalla(); };
        tabsContainer.appendChild(a);
    }

    const lista = document.getElementById("listaEnfrentamientos");
    lista.innerHTML = "";

    const ronda = rondas.find(r => r.numero === rondaSeleccionada);
    if (!ronda) return;

    ronda.enfrentamientos.forEach((enf, index) => {
        const eq1 = buscarEquipo(enf.equipo1Id);
        const eq2 = buscarEquipo(enf.equipo2Id);

        const totalIzq = enf.puntajes1.filter(p => p !== null).reduce((a, b) => a + b, 0);
        const totalDer = enf.puntajes2.filter(p => p !== null).reduce((a, b) => a + b, 0);

        const tarjeta = document.createElement("div");
        tarjeta.className = "card";
        tarjeta.dataset.ronda = ronda.numero;
        tarjeta.dataset.index = index;

        tarjeta.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div><strong>${eq1.nombre}</strong><br><span class="text-xs">${eq1.escuela}</span></div>
                <div class="text-bold text-lg">VS</div>
                <div style="text-align:right;"><strong>${eq2.nombre}</strong><br><span class="text-xs">${eq2.escuela}</span></div>
            </div>

            <div style="display:flex; justify-content:space-between; gap:20px;">
                <div class="col-izq" style="flex:1;">
                    ${enf.puntajes1.map((p, i) => `
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                            <input type="checkbox" class="check-participa" ${p !== null ? "checked" : ""}>
                            <label style="flex:1;">Integrante ${i + 1}</label>
                            <input type="number" value="${p ?? 0}" class="input-puntaje" style="width:60px;">
                        </div>
                    `).join("")}
                </div>
                <div class="col-der" style="flex:1;">
                    ${enf.puntajes2.map((p, i) => `
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
                            <input type="checkbox" class="check-participa" ${p !== null ? "checked" : ""}>
                            <label style="flex:1;">Integrante ${i + 1}</label>
                            <input type="number" value="${p ?? 0}" class="input-puntaje" style="width:60px;">
                        </div>
                    `).join("")}
                </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="text-bold">Marcador: ${totalIzq}-${totalDer}</span>
                <button class="button accent-button">${enf.finalizado ? "Modificar Puntajes" : "Registrar Enfrentamiento"}</button>
            </div>
        `;

        tarjeta.querySelector(".button").onclick = () => registrarEnfrentamiento(ronda.numero, index);
        lista.appendChild(tarjeta);
    });
}

document.getElementById("btnSiguienteRonda").addEventListener("click", () => {
    if (rondas.length === 0) {
        generarRonda1();
    } else {
        generarSiguienteRonda();
    }
    renderizarPantalla();
});

renderizarPantalla();