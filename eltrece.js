
document.addEventListener('DOMContentLoaded', () => {
  const programaSelect = document.getElementById('programaSelect');
  const formatoCheckboxes = document.getElementById('formatoCheckboxes');
  const ajustarCheckbox = document.getElementById('ajustarCheckbox');
  const generateButton = document.getElementById('generateButton');
  const statusDiv = document.getElementById('status');
  const previewContainer = document.getElementById('preview-container');
  const generatedImage = document.getElementById('generatedImage');
  const downloadBtn = document.getElementById('downloadBtn');
  const volverBtn = document.getElementById('volverBtn');
  const outputCanvas = document.getElementById('output-canvas');
  const ctx = outputCanvas.getContext('2d');
  const diseñoUrlInput = document.getElementById('diseñoUrl');
  const fileInput = document.getElementById('fileInput');

  Object.keys(programaFormatoData).forEach(nombre => {
    const option = document.createElement('option');
    option.value = nombre;
    option.textContent = nombre;
    programaSelect.appendChild(option);
  });

  programaSelect.addEventListener('change', () => {
    formatoCheckboxes.innerHTML = "";
    const programa = programaSelect.value;
    if (!programaFormatoData[programa]) return;
    const formatos = programaFormatoData[programa].formatos;

    if (formatos.length > 1) {
      const todosBox = document.createElement('label');
      todosBox.innerHTML = '<input type="checkbox" id="formatoTodos"> Todos';
      formatoCheckboxes.appendChild(todosBox);
      document.getElementById('formatoTodos').addEventListener('change', (e) => {
        const checked = e.target.checked;
        formatos.forEach(f => {
          const cb = document.getElementById(`formato_${f}`);
          if (cb) cb.checked = checked;
        });
      });
    }

    formatos.forEach(f => {
      const label = document.createElement('label');
      label.style.marginRight = "12px";
      label.innerHTML = `<input type="checkbox" name="formato" value="${f}" id="formato_${f}" checked> ${f}`;
      formatoCheckboxes.appendChild(label);
    });
  });

  generateButton.addEventListener('click', async () => {
    const programa = programaSelect.value;
    const formatosActivos = [...formatoCheckboxes.querySelectorAll('input[type="checkbox"]:checked')]
      .filter(cb => cb.value !== "Todos")
      .map(cb => cb.value);

    if (!programa || formatosActivos.length === 0) {
      updateStatus("Seleccioná un programa y al menos un formato.", "error");
      return;
    }

    const diseñoUrl = await getImageURL();
    if (!diseñoUrl) {
      updateStatus("Cargá una imagen por URL o archivo.", "error");
      return;
    }

    const formato = formatosActivos[0];
    const area = programaFormatoData[programa].areas[formato];
    const ajustar = ajustarCheckbox.checked;
    const marcoURL = area.marco;

    try {
      const [img, marco] = await Promise.all([loadImage(diseñoUrl), loadImage(marcoURL)]);

      outputCanvas.width = 1080;
      outputCanvas.height = 1920;
      ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

      if (ajustar) {
        const escala = area.height / img.height;
        const nuevoAncho = img.width * escala;
        const x = area.x + (area.width - nuevoAncho) / 2;
        ctx.drawImage(img, x, area.y, nuevoAncho, area.height);
      } else {
        const x = area.x + (area.width - img.width) / 2;
        const y = area.y + (area.height - img.height) / 2;
        ctx.drawImage(img, x, y);
      }

      ctx.drawImage(marco, 0, 0, outputCanvas.width, outputCanvas.height);

      const url = outputCanvas.toDataURL('image/png');
      generatedImage.src = url;
      previewContainer.style.display = "flex";
      statusDiv.textContent = "Imagen generada.";
      statusDiv.className = "status-success";

      downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = "imagen_eltrece.png";
        a.click();
      };

      volverBtn.onclick = () => {
        previewContainer.style.display = "none";
        generatedImage.src = "";
        statusDiv.textContent = "Listo.";
        statusDiv.className = "status-info";
      };

    } catch (err) {
      updateStatus("Error generando la imagen.", "error");
    }
  });

  function updateStatus(msg, type) {
    statusDiv.textContent = msg;
    statusDiv.className = `status-${type}`;
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject("No se pudo cargar la imagen.");
      img.src = url;
    });
  }

  async function getImageURL() {
    const url = diseñoUrlInput.value.trim();
    if (url) return convertirURL(url);
    if (fileInput.files.length > 0) {
      return await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(fileInput.files[0]);
      });
    }
    return null;
  }

  function convertirURL(url) {
    if (url.includes("dropbox.com")) {
      return url.replace("?dl=0", "?raw=1").replace("?dl=1", "?raw=1").replace("?rlkey=", "?raw=1&rlkey=");
    }
    if (url.includes("google.com/imgres?") || url.includes("googleusercontent.com")) {
      try {
        const obj = new URL(url);
        if (obj.searchParams.get("imgurl")) {
          return decodeURIComponent(obj.searchParams.get("imgurl"));
        }
      } catch (e) {}
    }
    return url;
  }
});
