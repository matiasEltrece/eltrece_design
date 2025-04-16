// background.js

// Asegura que el panel lateral se abra al hacer clic en el icono de la acción
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
});

// Opcional: Escuchar mensajes si la lógica se moviera aquí desde sidepanel.js
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log("Mensaje recibido en background:", message);
//   // Procesar mensaje y quizás responder con sendResponse
//   return true; // Indicar respuesta asíncrona si es necesario
// });
