// DATI EVENTI
const eventi = [
  {
    nome: "Jazz Night",
    locale: "Caffè Basaglia",
    tipo: "jazz",
    orario: "21:30",
    indirizzo: "Via Po 12, Torino",
    prezzo: "€5",
    lat: 45.0678,
    lng: 7.6934,
    data: "2026-05-29"
  },
  {
    nome: "DJ Set Techno",
    locale: "Bunker",
    tipo: "dj",
    orario: "23:00",
    indirizzo: "Via Nichelino 1, Torino",
    prezzo: "€10",
    lat: 45.0521,
    lng: 7.6678,
    data: "2026-05-30"
  },
  {
    nome: "Live Rock",
    locale: "Blah Blah",
    tipo: "live",
    orario: "22:00",
    indirizzo: "Via Po 21, Torino",
    prezzo: "€8",
    lat: 45.0682,
    lng: 7.6941,
    data: "2026-05-31"
  },
  {
    nome: "Karaoke Night",
    locale: "Bar Cavour",
    tipo: "karaoke",
    orario: "20:00",
    indirizzo: "Piazza Cavour 3, Torino",
    prezzo: "Gratis",
    lat: 45.0748,
    lng: 7.6823,
    data: "2026-05-29"
  }
];

// CARD
function creaCard(evento) {
  return `
    <div class="card" data-tipo="${evento.tipo}">
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
        💶 ${evento.prezzo}
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
        const titolo = document.getElementById("eventi-giorno-titolo");
        const container = document.getElementById("eventi-giorno-container");
        titolo.textContent = `Eventi del ${g} ${mesiNomi[mese]}`;
        container.innerHTML = eventiDelGiorno.map(creaCard).join("");
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

// AVVIO
mostraEventi();
aggiornaMappa();