// CONFIGURAZIONE SUPABASE
const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";
const SUPABASE_AUTH_URL = `${SUPABASE_URL}/auth/v1`;

async function login() {
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value.trim();
  const messaggio = document.getElementById("auth-messaggio");

  if (!email || !password) {
    messaggio.textContent = "Inserisci email e password.";
    return;
  }

  const res = await fetch(`${SUPABASE_AUTH_URL}/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY
    },
    body: JSON.stringify({ email, password })
  });

  const dati = await res.json();

  if (dati.error) {
    messaggio.textContent = "Email o password errati.";
    return;
  }

  const token = dati.access_token || dati.session?.access_token;
  const userId = dati.user?.id || dati.id;

  localStorage.setItem("yn_token", token);
  localStorage.setItem("yn_user_id", userId);

  await caricaProfiloUtente(userId);
}

async function registrati() {
  const email = document.getElementById("reg-email").value.trim();
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value.trim();
  const messaggio = document.getElementById("reg-messaggio");

  if (!email || !username || !password) {
    messaggio.textContent = "Compila tutti i campi.";
    return;
  }

  const res = await fetch(`${SUPABASE_AUTH_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY
    },
    body: JSON.stringify({ email, password })
  });

  const dati = await res.json();

  if (dati.error) {
    messaggio.textContent = dati.error.message;
    return;
  }

  const token = dati.access_token || dati.session?.access_token;
  const userId = dati.user?.id || dati.id;

  await fetch(`${SUPABASE_URL}/rest/v1/profili`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ id: userId, username })
  });

  localStorage.setItem("yn_token", token);
  localStorage.setItem("yn_user_id", userId);
  localStorage.setItem("yn_username", username);

  mostraProfiloUtente(username);
}

async function caricaProfiloUtente(userId) {
  const token = localStorage.getItem("yn_token");

  const res = await fetch(`${SUPABASE_URL}/rest/v1/profili?id=eq.${userId}&select=*`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${token}`
    }
  });

  const dati = await res.json();
  const username = dati[0]?.username || "utente";

  localStorage.setItem("yn_username", username);
  mostraProfiloUtente(username);
}

function mostraProfiloUtente(username) {
  document.getElementById("box-login").style.display = "none";
  document.getElementById("box-registrazione").style.display = "none";
  document.getElementById("box-profilo").style.display = "flex";
  document.getElementById("profilo-benvenuto").textContent = `Accesso come ${username}`;
}

function logout() {
  localStorage.removeItem("yn_token");
  localStorage.removeItem("yn_user_id");
  localStorage.removeItem("yn_username");
  document.getElementById("box-profilo").style.display = "none";
  document.getElementById("box-login").style.display = "flex";
}

document.getElementById("link-vai-registrati").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("box-login").style.display = "none";
  document.getElementById("box-registrazione").style.display = "flex";
});

document.getElementById("link-vai-login").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("box-registrazione").style.display = "none";
  document.getElementById("box-login").style.display = "flex";
});

document.getElementById("btn-login").addEventListener("click", login);
document.getElementById("btn-registrati").addEventListener("click", registrati);
document.getElementById("btn-logout").addEventListener("click", logout);

// controlla se utente già loggato
const usernameSalvato = localStorage.getItem("yn_username");
if (usernameSalvato) mostraProfiloUtente(usernameSalvato);