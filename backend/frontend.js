import { io } from "socket.io-client";

// Remplacez par votre JWT valide
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZDA0MDU0OTM0ODNjOGE5ODM2NDBmOCIsImVtYWlsIjoidXRpbGlzYXRldXIyQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQxNzA0OTg5LCJleHAiOjE3NDE3OTEzODl9.bYf3O72TAofQum9n5i3ZxRJMBQw-rgkpRlD5MkQ6qSw";

// URL du backend
const BASE_URL = "http://localhost:3000";

// Connexion WebSocket simple
const socket = io(BASE_URL, {
  auth: {
    token,
  },
  transports: ["websocket"],
});

// Écouter la connexion réussie
socket.on("connect", () => {
  console.log("✅ Connecté au WebSocket :", socket.id);
});

// Écouter les notifications à la connexion
socket.on("notifications", (data) => {
  console.log("🔔 Notifications reçues lors de la connexion:", data);
});

// Écouter les notifications en temps réel
socket.on("notification", (data) => {
  console.log("🔔 Notification reçue en temps réel:", data);
  console.log("📥 Test log : Notification bien reçue côté frontend !");
});

// Écouter les erreurs de connexion
socket.on("connect_error", (err) => {
  console.error("❌ Erreur de connexion WebSocket :", err.message);
});
