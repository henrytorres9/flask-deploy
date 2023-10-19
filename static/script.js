// function handleImage(event) {
//   const image = document.getElementById("imagePreview");
//   image.src = URL.createObjectURL(event.target.files[0]);
//   image.onload = function () {
//     // Convertir la imagen a base64
//     const canvas = document.createElement("canvas");
//     const context = canvas.getContext("2d");
//     canvas.width = image.width;
//     canvas.height = image.height;
//     context.drawImage(image, 0, 0);
//     const base64Image = canvas.toDataURL("image/jpeg");

//     // Enviar la imagen al servidor
//     analyzeImage(base64Image);
//   };
// }

// function displayResults(peopleCount, catsCount, plantsCount) {
//   const resultsElement = document.getElementById("results");
//   resultsElement.innerHTML = `
//     <h2>Resultados:</h2>
//     <p id="resultPeople">Personas: ${peopleCount}</p>
//     <p id="resultCats">Gatos: ${catsCount}</p>
//     <p id="resultPlants">Plantas: ${plantsCount}</p>
//   `;
// }

// function analyzeImage(imageData) {
//   const xhr = new XMLHttpRequest();
//   xhr.open("POST", "/detect_objects", true);
//   xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

//   xhr.onreadystatechange = function () {
//     if (xhr.readyState == XMLHttpRequest.DONE) {
//       if (xhr.status == 200) {
//         const results = JSON.parse(xhr.responseText);
//         displayResults(
//           results.peopleCount,
//           results.catsCount,
//           results.plantsCount
//         );
//       } else {
//         console.error("Ocurrió un error al analizar la imagen.");
//       }
//     }
//   };

//   const data = JSON.stringify({ image: imageData });
//   xhr.send(data);
// }

const fileInput = document.getElementById("file-input");
const selectedImage = document.getElementById("selected-image");
const loaderContainer = document.getElementById("loader-container"); // El contenedor del preloader

// Función para mostrar el preloader
function showLoader() {
  loaderContainer.style.display = "flex";
}

// Función para ocultar el preloader
function hideLoader() {
  loaderContainer.style.display = "none";
}

fileInput.addEventListener("change", function () {
  // Limpiar la previsualización de la imagen al seleccionar una nueva
  selectedImage.src = "";
  const file = fileInput.files[0];
  if (file) {
    const imageURL = URL.createObjectURL(file);
    selectedImage.src = imageURL;
  } else {
    // Mostrar una imagen predeterminada cuando no se ha seleccionado ninguna imagen
    selectedImage.src = "../default.jpg";
  }
});
document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();

  const fileInput = document.getElementById("file-input");
  const selectedImage = document.getElementById("selected-image");

  if (!fileInput.files.length) {
    // Utiliza SweetAlert2 para mostrar un mensaje de error
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Por favor, seleccione una imagen antes de detectar objetos.",
    });
    return;
  }

  // Muestra el preloader
  showLoader();

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  fetch("/detect", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      const personCount = document.getElementById("personCount");
      const catCount = document.getElementById("catCount");
      const plantCount = document.getElementById("plantCount");

      let personCounter = 0;
      let catCounter = 0;
      let plantCounter = 0;

      data.results.forEach((result) => {
        if (result.label === "person") {
          personCounter++;
        } else if (result.label === "cat") {
          catCounter++;
        } else if (result.label === "pottedplant") {
          plantCounter++;
        }
      });

      personCount.textContent = personCounter;
      catCount.textContent = catCounter;
      plantCount.textContent = plantCounter;

      // Mostrar la imagen previsualizada
      const imageURL = URL.createObjectURL(fileInput.files[0]);
      selectedImage.src = imageURL;

      // Oculta el preloader
      hideLoader();
    })
    .catch((error) => {
      console.error(error);
      // Oculta el preloader
      hideLoader();
    });
});

// Agrega un evento click al botón de limpieza
document.getElementById("clear-button").addEventListener("click", function () {
  // Limpia la imagen previsualizada
  document.getElementById("selected-image").src = "";
  // Limpia el campo de entrada de archivo
  document.getElementById("file-input").value = "";
  // Limpia los campos de resultados
  document.getElementById("personCount").textContent = "0";
  document.getElementById("catCount").textContent = "0";
  document.getElementById("plantCount").textContent = "0";
});
