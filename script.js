// DATI EVENTI (per ora scritti a mano, poi verranno dal database)
const eventi = [
  {
    nome: "Jazz Night",
    locale: "Caffè Basaglia",
    tipo: "jazz",
    orario: "21:30",
    indirizzo: "Via Po 12, Torino",
    prezzo: "€5",
    lat: 45.0678,
    lng: 7.6934
  },
  {
    nome: "DJ Set Techno",
    locale: "Bunker",
    tipo: "dj",
    orario: "23:00",
    indirizzo: "Via Nichelino 1, Torino",
    prezzo: "€10",
    lat: 45.0521,
    lng: 7.6678
  },
  {
    nome: "Live Rock",
    locale: "Blah Blah",
    tipo: "live",
    orario: "22:00",
    indirizzo: "Via Po 21, Torino",
    prezzo: "€8",
    lat: 45.0682,
    lng: 7.6941
  },
  {
    nome: "Karaoke Night",
    locale: "Bar Cavour",
    tipo: "karaoke",
    orario: "20:00",
    indirizzo: "Piazza Cavour 3, Torino",
    prezzo: "Gratis",
    lat: 45.0748,
    lng: 7.6823
  }
];

// FUNZIONE: crea una card HTML da un evento
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

// FUNZIONE: mostra tutti gli eventi (o filtrati per tipo)
function mostraEventi(filtro = "tutti") {
  const container = document.getElementById("cards-container");
  const eventiFiltrati = filtro === "tutti"
    ? eventi
    : eventi.filter(e => e.tipo === filtro);

  container.innerHTML = eventiFiltrati.map(creaCard).join("");
}

// FILTRI: click sui bottoni
document.querySelectorAll(".filtro").forEach(bottone => {
  bottone.addEventListener("click", () => {
    document.querySelectorAll(".filtro").forEach(b => b.classList.remove("attivo"));
    bottone.classList.add("attivo");
    mostraEventi(bottone.dataset.tipo);
  });
});

// AVVIO: mostra tutti gli eventi al caricamento
mostraEventi();

// MAPPA
const mappa = L.map('mappa').setView([45.0703, 7.6869], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(mappa);

// PIN SULLA MAPPA
let pinAttivi = [];

function aggiornaMappa(filtro = "tutti") {
  // rimuovi pin precedenti
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

aggiornaMappa();