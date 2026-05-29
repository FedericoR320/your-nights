// CONFIGURAZIONE SUPABASE
const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";

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
    <div class="card" data-tipo="${evento.tipo}" onclick="window.location.href='evento.html?id=${evento.id}'", style="cursor:pointer">
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
      document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("attiva"));
      document.querySelector("[data-vista='mappa']").classList.add("attiva");
      setTimeout(() => mappa.invalidateSize(), 100);

     caricaEventi(citta.charAt(0).toUpperCase() + citta.slice(1).toLowerCase());
    });
}

// AVVIO
caricaEventi("Torino");