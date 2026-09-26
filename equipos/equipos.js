import { addTeam, getTeams, editTeam, deleteTeam, startTournament, getData, setData, initialData } from "../js/data.js";

console.log("equipos.js conectado");


const escuelaInput = document.getElementById("Escuela");
const equipoInput = document.getElementById("Equipo");

const estudiante1Input = document.getElementById("Estudiante1");
const estudiante2Input = document.getElementById("Estudiante2");
const estudiante3Input = document.getElementById("Estudiante3");
const estudiante4Input = document.getElementById("Estudiante4");
const estudiante5Input = document.getElementById("Estudiante5");

const sexo1Input = document.getElementById("sexoEstudiante1");
const sexo2Input = document.getElementById("sexoEstudiante2");
const sexo3Input = document.getElementById("sexoEstudiante3");
const sexo4Input = document.getElementById("sexoEstudiante4");
const sexo5Input = document.getElementById("sexoEstudiante5");

const guardarButton = document.getElementById("guardarEquipo");
const limpiarButton = document.getElementById("limpiarCampos");
const iniciarButton = document.getElementById("iniciarEvento");

const equiposRegistrados = document.getElementById("equiposRegistrados");

let equipoEditando = null;





guardarButton.addEventListener("click", function () {

    const escuela = escuelaInput.value.trim();
    const nombreEquipo = equipoInput.value.trim();

    const estudiantes = [
        {
            name: estudiante1Input.value.trim(),
            gender: convertirSexo(sexo1Input.value)
        },
        {
            name: estudiante2Input.value.trim(),
            gender: convertirSexo(sexo2Input.value)
        },
        {
            name: estudiante3Input.value.trim(),
            gender: convertirSexo(sexo3Input.value)
        },
        {
            name: estudiante4Input.value.trim(),
            gender: convertirSexo(sexo4Input.value)
        },
        {
            name: estudiante5Input.value.trim(),
            gender: convertirSexo(sexo5Input.value)
        }
    ];


    if (!escuela || !nombreEquipo) {
        alert("Escribe la escuela y el nombre del equipo.");
        return;
    }


    for (const estudiante of estudiantes) {

        if (!estudiante.name || !estudiante.gender) {
            alert("Completa los datos de los 5 estudiantes.");
            return;
        }

    }


    try {

        if (equipoEditando === null) {

            addTeam({
                school: escuela,
                name: nombreEquipo,
                students: estudiantes
            });

            alert("Equipo guardado correctamente.");

        }

        else {

            editTeam(equipoEditando, {
                school: escuela,
                name: nombreEquipo,
                students: estudiantes
            });

            alert("Equipo actualizado correctamente.");
        }


        limpiarCampos();
        mostrarEquipos();

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

});




function convertirSexo(sexo) {

    if (sexo === "Femenino") {
        return "female";
    }

    if (sexo === "Masculino") {
        return "male";
    }

    return null;
}




function convertirGender(gender) {

    if (gender === "female") {
        return "Femenino";
    }

    if (gender === "male") {
        return "Masculino";
    }

    return "Seleccionar";
}



function mostrarEquipos() {

    equiposRegistrados.innerHTML = "";

    const equipos = getTeams();

    console.log("Equipos registrados:", equipos);


    if (equipos.length === 0) {

        equiposRegistrados.innerHTML = `<p>No hay equipos registrados todavía.</p>`;

        return;
    }


    equipos.forEach((equipo) => {

        const tarjeta = document.createElement("div");

        tarjeta.classList.add("tarjeta-equipo");


        tarjeta.innerHTML = `

            <div class="equipo-header">

                <div>
                    <h3>${equipo.name}</h3>
                    <p>${equipo.school}</p>
                </div>

                <div class="acciones-equipo">

                    <button class="editar-equipo">
                        Editar
                    </button>

                    <button class="eliminar-equipo">
                        Eliminar
                    </button>

                </div>

            </div>


            <div class="estudiantes-equipo">

                <table class="tabla-estudiantes">

                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Estudiante</th>
                            <th>Sexo</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${equipo.students.map((estudiante, index) => `

                            <tr>

                                <td>
                                    ${index + 1}
                                </td>

                                <td>
                                    ${estudiante.name || estudiante.nombre}
                                </td>

                                <td>
                                    ${convertirGender(estudiante.gender)}
                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>

        `;


       

        const botonEditar =
            tarjeta.querySelector(".editar-equipo");

        botonEditar.addEventListener("click", function () {

            cargarEquipoParaEditar(equipo);

        });


        
        const botonEliminar =
            tarjeta.querySelector(".eliminar-equipo");

        botonEliminar.addEventListener("click", function () {

            eliminarEquipo(equipo.id);

        });


        equiposRegistrados.appendChild(tarjeta);

    });

}




function cargarEquipoParaEditar(equipo) {

    equipoEditando = equipo.id;


    escuelaInput.value = equipo.school;

    equipoInput.value = equipo.name;


    estudiante1Input.value =
        equipo.students[0].name || equipo.students[0].nombre;

    sexo1Input.value =
        convertirGender(equipo.students[0].gender);


    estudiante2Input.value =
        equipo.students[1].name || equipo.students[1].nombre;

    sexo2Input.value =
        convertirGender(equipo.students[1].gender);


    estudiante3Input.value =
        equipo.students[2].name || equipo.students[2].nombre;

    sexo3Input.value =
        convertirGender(equipo.students[2].gender);


    estudiante4Input.value =
        equipo.students[3].name || equipo.students[3].nombre;

    sexo4Input.value =
        convertirGender(equipo.students[3].gender);


    estudiante5Input.value =
        equipo.students[4].name || equipo.students[4].nombre;

    sexo5Input.value =
        convertirGender(equipo.students[4].gender);


    guardarButton.textContent = "Guardar cambios";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}




function eliminarEquipo(teamId) {

    const confirmar = confirm(
        "¿Seguro que quieres eliminar este equipo?"
    );


    if (!confirmar) {
        return;
    }


    try {

        deleteTeam(teamId);

        alert("Equipo eliminado correctamente.");

        mostrarEquipos();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}




limpiarButton.addEventListener("click", function () {

    limpiarCampos();

});


function limpiarCampos() {

    escuelaInput.value = "";

    equipoInput.value = "";


    estudiante1Input.value = "";
    estudiante2Input.value = "";
    estudiante3Input.value = "";
    estudiante4Input.value = "";
    estudiante5Input.value = "";


    sexo1Input.value = "Seleccionar";
    sexo2Input.value = "Seleccionar";
    sexo3Input.value = "Seleccionar";
    sexo4Input.value = "Seleccionar";
    sexo5Input.value = "Seleccionar";


    equipoEditando = null;

    guardarButton.textContent = "Guardar Equipo";

}




iniciarButton.addEventListener("click", function () {

    const confirmar = confirm(
        "Al iniciar, los equipos y la configuración quedarán bloqueados. ¿Desea continuar?"
    );


    if (!confirmar) {
        return;
    }


    try {

        startTournament();

        alert("Evento iniciado correctamente.");

        mostrarEquipos();

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

});



mostrarEquipos();