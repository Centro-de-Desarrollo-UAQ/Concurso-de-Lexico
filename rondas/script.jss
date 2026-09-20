document.addEventListener('DOMContentLoaded', () => {
    
    let equipos = [];
    let historial = [];

    // 1. Extraer los equipos de la memoria (guardados en la página de registro)
    let datosGuardados = localStorage.getItem("misEquipos");
    
    if (datosGuardados !== null) {
        equipos = JSON.parse(datosGuardados);
        document.getElementById("totalEquipos").textContent = equipos.length;
    } else {
        // Datos de prueba por si pruebas la pantalla sin haber registrado nada aún
        equipos = ["Equipo 1", "Equipo 2", "Equipo 3", "Equipo 4", "Equipo 5", "Equipo 6"];
        document.getElementById("totalEquipos").textContent = equipos.length;
    }

    // 2. Evento para el botón "Generar Siguiente Ronda"
    const btnGenerarRonda = document.getElementById("btnSiguienteRonda");
    btnGenerarRonda.addEventListener("click", generarRonda);

    // 3. Función para comprobar si dos equipos ya compitieron
    function yaSeEnfrentaron(equipoA, equipoB) {
        let comb1 = equipoA + "-" + equipoB;
        let comb2 = equipoB + "-" + equipoA;
        return historial.includes(comb1) || historial.includes(comb2);
    }

    // 4. Lógica de emparejamiento aleatorio
    function generarRonda() {
        // Clonamos y mezclamos el arreglo
        let equiposDisponibles = [...equipos].sort(() => Math.random() - 0.5);
        let emparejamientos = [];

        while (equiposDisponibles.length >= 2) {
            let equipo1 = equiposDisponibles.shift();
            let equipo2 = null;
            let indexE2 = -1;

            // Buscar el primer rival que no esté en el historial
            for (let i = 0; i < equiposDisponibles.length; i++) {
                if (!yaSeEnfrentaron(equipo1, equiposDisponibles[i])) {
                    equipo2 = equiposDisponibles[i];
                    indexE2 = i;
                    break;
                }
            }

            if (equipo2 !== null) {
                equiposDisponibles.splice(indexE2, 1);
                emparejamientos.push([equipo1, equipo2]);
                historial.push(equipo1 + "-" + equipo2); // Guardamos la partida
            }
        }

        // Si quedan equipos impares sin pareja, podrías manejarlos aquí (ej. descansan)
        imprimirTarjetas(emparejamientos);
    }

    // 5. Inyectar el diseño de tarjetas al HTML
    function imprimirTarjetas(parejas) {
        let contenedor = document.getElementById("listaEnfrentamientos");
        contenedor.innerHTML = ""; // Limpia la ronda anterior

        parejas.forEach(pareja => {
            let equipoA = pareja[0];
            let equipoB = pareja[1];

            // Código HTML de la tarjeta inyectado dinámicamente
            let tarjetaHTML = `
                <div class="tarjeta-enfrentamiento">
                    <div class="cabecera-enfrentamiento">
                        <div class="equipo-lado">
                            <h4>${equipoA}</h4>
                            <span class="etiqueta">Escuela X</span>
                        </div>
                        <div class="centro-vs">
                            <div class="vs">VS</div>
                        </div>
                        <div class="equipo-lado derecha">
                            <h4>${equipoB}</h4>
                            <span class="etiqueta">Escuela X</span>
                        </div>
                    </div>

                    <div class="cuerpo-enfrentamiento">
                        <div class="columna-estudiantes columna-izquierda">
                            <div class="fila-estudiante">
                                <input type="checkbox" class="check-participa" checked>
                                <label>Integrante Equipo</label>
                                <input type="number" class="input-puntaje" value="0">
                            </div>
                            <div class="fila-estudiante">
                                <input type="checkbox" class="check-participa" checked>
                                <label>Integrante Equipo</label>
                                <input type="number" class="input-puntaje" value="0">
                            </div>
                        </div>

                        <div class="columna-estudiantes columna-derecha">
                            <div class="fila-estudiante">
                                <input type="checkbox" class="check-participa" checked>
                                <label>Integrante Equipo</label>
                                <input type="number" class="input-puntaje" value="0">
                            </div>
                            <div class="fila-estudiante">
                                <input type="checkbox" class="check-participa" checked>
                                <label>Integrante Equipo</label>
                                <input type="number" class="input-puntaje" value="0">
                            </div>
                        </div>
                    </div>

                    <div class="pie-enfrentamiento">
                        <div class="marcador">Marcador: 0-0</div>
                        <button class="btn-registrar">Registrar Enfrentamiento</button>
                    </div>
                </div>
            `;
            
            contenedor.innerHTML += tarjetaHTML;
        });
    }
});