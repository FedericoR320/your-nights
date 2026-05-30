// CONFIGURAZIONE SUPABASE
const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";
const SUPABASE_AUTH_URL = `${SUPABASE_URL}/auth/v1`;

let eventi = [];

// CARICA EVENTI DA SUPABASE
async function caricaEventi(citta = "Torino") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/Eventi?citta=eq.${encodeURIComponent(citta)}&select=*`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  });
  eventi = await res.json();
  mostraEventi();
  aggiornaMappa();
  document.querySelector("#lista-eventi h2").textContent = `Stasera a ${citta}`;
}

// CARD
function creaCard(evento) {
  return `
    <div class="card" data-tipo="${evento.tipo}" onclick="window.location.href='evento.html?id=${evento.id}'" style="cursor:pointer">
      <div class="tipo">${evento.tipo}</div>
      <h3>${evento.nome}</h3>
      <div class="dettagli">
        📍 ${evento.locale}<br>
        🕐 ${evento.orario}<br>
        📌 ${evento.indirizzo}<br>
        💶 ${evento.prezzo}
      </div>
    </div>
  `;
}

// MOSTRA EVENTI (lista)
function mostraEventi(filtro = "tutti") {
  const container = document.getElementById("cards-container");
  const eventiFiltrati = filtro === "tutti"
    ? eventi
    : eventi.filter(e => e.tipo === filtro);
  container.innerHTML = eventiFiltrati.map(creaCard).join("");
}

// FILTRI
document.querySelectorAll(".filtro").forEach(bottone => {
  bottone.addEventListener("click", () => {
    document.querySelectorAll(".filtro").forEach(b => b.classList.remove("attivo"));
    bottone.classList.add("attivo");
    const filtro = bottone.dataset.tipo;
    mostraEventi(filtro);
    aggiornaMappa(filtro);
  });
});

// MAPPA
const mappa = L.map('mappa').setView([45.0703, 7.6869], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(mappa);

let pinAttivi = [];

function aggiornaMappa(filtro = "tutti") {
  pinAttivi.forEach(pin => mappa.removeLayer(pin));
  pinAttivi = [];
  const eventiFiltrati = filtro === "tutti"
    ? eventi
    : eventi.filter(e => e.tipo === filtro);
  eventiFiltrati.forEach(evento => {
    const pin = L.marker([evento.lat, evento.lng])
      .addTo(mappa)
      .bindPopup(`
        <strong>${evento.nome}</strong><br>
        ${evento.locale}<br>
        🕐 ${evento.orario}<br>
        💶 ${evento.prezzo}<br>
        <a href="evento.html?id=${evento.id}" style="color:#e63946;">Vedi dettagli →</a>
      `);
    pinAttivi.push(pin);
  });
}

// CALENDARIO
let meseCorrente = new Date().getMonth();
let annoCorrente = new Date().getFullYear();

const mesiNomi = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
                  "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const giorniNomi = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];

function renderCalendario(mese, anno) {
  const griglia = document.getElementById("cal-griglia");
  const titolo = document.getElementById("mese-titolo");
  titolo.textContent = `${mesiNomi[mese]} ${anno}`;
  griglia.innerHTML = "";

  giorniNomi.forEach(g => {
    const el = document.createElement("div");
    el.className = "cal-intestazione";
    el.textContent = g;
    griglia.appendChild(el);
  });

  const primoGiorno = new Date(anno, mese, 1).getDay();
  const offset = primoGiorno === 0 ? 6 : primoGiorno - 1;
  const giorniNelMese = new Date(anno, mese + 1, 0).getDate();

  for (let i = 0; i < offset; i++) {
    const vuoto = document.createElement("div");
    vuoto.className = "cal-giorno vuoto";
    griglia.appendChild(vuoto);
  }

  for (let g = 1; g <= giorniNelMese; g++) {
    const dataStr = `${anno}-${String(mese + 1).padStart(2,"0")}-${String(g).padStart(2,"0")}`;
    const eventiDelGiorno = eventi.filter(e => e.data === dataStr);

    const cella = document.createElement("div");
    cella.className = "cal-giorno" + (eventiDelGiorno.length > 0 ? " ha-eventi" : "");
    cella.innerHTML = g + (eventiDelGiorno.length > 0 ? '<div class="punto"></div>' : "");

    if (eventiDelGiorno.length > 0) {
      cella.addEventListener("click", () => {
        document.getElementById("eventi-giorno-titolo").textContent = `Eventi del ${g} ${mesiNomi[mese]}`;
        document.getElementById("eventi-giorno-container").innerHTML = eventiDelGiorno.map(creaCard).join("");
      });
    }

    griglia.appendChild(cella);
  }
}

document.getElementById("mese-prec").addEventListener("click", () => {
  meseCorrente--;
  if (meseCorrente < 0) { meseCorrente = 11; annoCorrente--; }
  renderCalendario(meseCorrente, annoCorrente);
});

document.getElementById("mese-succ").addEventListener("click", () => {
  meseCorrente++;
  if (meseCorrente > 11) { meseCorrente = 0; annoCorrente++; }
  renderCalendario(meseCorrente, annoCorrente);
});

// NAVIGAZIONE VISTE
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("attiva"));
    link.classList.add("attiva");

    const vista = link.dataset.vista;
    document.getElementById("vista-mappa").style.display = vista === "mappa" ? "block" : "none";
    document.getElementById("vista-calendario").style.display = vista === "calendario" ? "block" : "none";
    document.getElementById("vista-account").style.display = vista === "account" ? "block" : "none";

    if (vista === "mappa") {
      setTimeout(() => mappa.invalidateSize(), 100);
    }
    if (vista === "calendario") {
      renderCalendario(meseCorrente, annoCorrente);
    }
  });
});

// CERCA CITTÀ
document.getElementById("btn-citta").addEventListener("click", cercaCitta);
document.getElementById("input-citta").addEventListener("keypress", (e) => {
  if (e.key === "Enter") cercaCitta();
});

function cercaCitta() {
  const citta = document.getElementById("input-citta").value.trim();
  if (!citta) return;

  fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(citta)}&format=json&limit=1`)
    .then(res => res.json())
    .then(dati => {
      if (dati.length === 0) {
        alert("Città non trovata, riprova.");
        return;
      }
      const lat = parseFloat(dati[0].lat);
      const lng = parseFloat(dati[0].lon);
      mappa.setView([lat, lng], 13);

      document.getElementById("vista-mappa").style.display = "block";
      document.getElementById("vista-calendario").style.display = "none";
      document.getElementById("vista-account").style.display = "none";
      document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("attiva"));
      document.querySelector("[data-vista='mappa']").classList.add("attiva");
      setTimeout(() => mappa.invalidateSize(), 100);

      caricaEventi(citta.charAt(0).toUpperCase() + citta.slice(1).toLowerCase());
    });
}

// GEOLOCALIZZAZIONE
document.getElementById("btn-geolocal").addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Il tuo browser non supporta la geolocalizzazione.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      mappa.setView([lat, lng], 14);

      L.marker([lat, lng], {
        icon: L.divIcon({
          className: '',
          html: '<div style="background:#e63946;width:14px;height:14px;border-radius:50%;border:2px solid white;"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(mappa).bindPopup("Tu sei qui").openPopup();
    },
    (errore) => {
      alert("Impossibile ottenere la posizione. Controlla i permessi del browser.");
    }
  );
});

// AUTENTICAZIONE
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

  localStorage.setItem("yn_token", dati.access_token);
  localStorage.setItem("yn_user_id", dati.user.id);

  await caricaProfiloUtente(dati.user.id);
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

  // 1. crea utente in Supabase Auth
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

  // 2. salva username nella tabella profili
  await fetch(`${SUPABASE_URL}/rest/v1/profili`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${dati.access_token}`
    },
    body: JSON.stringify({ id: dati.user.id, username })
  });

  localStorage.setItem("yn_token", dati.access_token);
  localStorage.setItem("yn_user_id", dati.user.id);

  await caricaProfiloUtente(dati.user.id);
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

// switch login/registrazione
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

// AVVIO
caricaEventi("Torino");

// AVVIO
caricaEventi("Torino");