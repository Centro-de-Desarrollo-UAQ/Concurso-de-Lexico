import { getData, setData, initialData } from "./data.js";

window.addEventListener("DOMContentLoaded", () => {
  const exportButton = document.getElementById("export-button");
  const importButton = document.getElementById("import-button");
  const printButton = document.getElementById("print-button");
  const resetButton = document.getElementById("reset-button");

  exportButton.addEventListener("click", () => {
    const data = getData();

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "tournament_data_" + new Date().toISOString().slice(0, 10) + ".json";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  });

  importButton.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setData(data);
        } catch (error) {
          console.error("Error al parsear el archivo JSON:", error);
        }
      };
      reader.readAsText(file);
    });

    input.click();
  });

  printButton.addEventListener("click", () => {
    // TODO:
  });

  resetButton.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que quieres reiniciar el evento?")) {
      setData(initialData());
    }
  });
});
