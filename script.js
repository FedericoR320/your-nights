const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";

let eventi = [];
let filtroTipoCorrente = "tutti";
let dataSelezionata = dataLocale(new Date());

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function dataLocale(data) {
  const anno = data.getFullYear();
  const mese = String(data.getMonth() + 1).padStart(2, "0");
  const giorno = String(data.getDate()).padStart(2, "0");
  return `${anno}-${mese}-${giorno}`;
}

function aggiungiGiorni(data, giorni) {
  const nuovaData = new Date(data);
  nuovaData.setDate(nuovaData.getDate() + giorni);
  return nuovaData;
}

function getEventiVisibili() {
  return eventi.filter(e => {
    const matchTipo = filtroTipoCorrente === "tutti" || e.tipo === filtroTipoCorrente;
    const matchData = e.data === dataSelezionata;
    return matchTipo && matchData;
  });
}

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

  document.querySelector("#lista-eventi h2").textContent = `Eventi a ${citta}`;

  await aggiornaStatoSalvataggi();
}

// CARD
function creaCard(evento) {
  const loggato = !!localStorage.getItem("yn_token");
  const imgUrl = evento.immagine || "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800";

  return `
    <div class="card" data-tipo="${evento.tipo}">
      <div class="card-img" style="background-image:url('${imgUrl}')" onclick="window.location.href='evento.html?id=${evento.id}'">
        <div class="card-img-overlay"></div>
        <button class="btn-salva" onclick="event.stopPropagation(); ${loggato ? `salvaEvento(${evento.id}, this)` : `apriPopupLogin()`}" title="Salva">
          <span class="salva-label">Salva</span>
          <i data-lucide="bookmark"></i>
        </button>
      </div>
      <div class="card-body" onclick="window.location.href='evento.html?id=${evento.id}'" style="cursor:pointer">
        <div class="tipo">${evento.tipo}</div>
        <h3>${evento.nome}</h3>
        <div class="dettagli">
          <span><i data-lucide="map-pin"></i> ${evento.locale}</span><br>
          <span><i data-lucide="clock"></i> ${evento.orario}</span><br>
          <span><i data-lucide="euro"></i> ${evento.prezzo}</span>
        </div>
      </div>
    </div>
  `;
}
// MOSTRA EVENTI
function mostraEventi() {
  const container = document.getElementById("cards-container");
  const eventiVisibili = getEventiVisibili();

  if (eventiVisibili.length === 0) {
    container.innerHTML = `
      <p class="empty-state">
        Nessun evento trovato per questa data.
      </p>
    `;
    return;
  }

  container.innerHTML = eventiVisibili.map(creaCard).join("");
  lucide.createIcons();
}

// FILTRI
document.querySelectorAll(".filtro").forEach(bottone => {
  bottone.addEventListener("click", () => {
    document.querySelectorAll(".filtro").forEach(b => b.classList.remove("attivo"));
    bottone.classList.add("attivo");

    filtroTipoCorrente = bottone.dataset.tipo;

    mostraEventi();
    aggiornaMappa();
    aggiornaStatoSalvataggi();
  });
});

// MAPPA
const mappa = L.map('mappa').setView([45.0703, 7.6869], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(mappa);

let clusterEventi = L.markerClusterGroup({
  showCoverageOnHover: false,
  spiderfyOnMaxZoom: true,
  disableClusteringAtZoom: 17,
  maxClusterRadius: 45
});

mappa.addLayer(clusterEventi);

function aggiornaMappa() {
  clusterEventi.clearLayers();

  const eventiFiltrati = getEventiVisibili();

  eventiFiltrati.forEach(evento => {
    if (!evento.lat || !evento.lng) return;

    const pin = L.marker([evento.lat, evento.lng])
      .bindPopup(`
        <strong>${evento.nome}</strong><br>
        ${evento.locale}<br>
        🕐 ${evento.orario}<br>
        💶 ${evento.prezzo}<br>
        <a href="evento.html?id=${evento.id}" style="color:#e63946;">Vedi dettagli →</a>
      `);

    clusterEventi.addLayer(pin);
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
        lucide.createIcons();
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
document.querySelectorAll(".nav-link[data-vista]").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("attiva"));
    link.classList.add("attiva");

    const vista = link.dataset.vista;
    document.getElementById("vista-mappa").style.display = vista === "mappa" ? "block" : "none";
    document.getElementById("vista-calendario").style.display = vista === "calendario" ? "block" : "none";

    if (vista === "mappa") setTimeout(() => mappa.invalidateSize(), 100);
    if (vista === "calendario") renderCalendario(meseCorrente, annoCorrente);
  });
});

// CERCA CITTÀ
document.getElementById("btn-citta").addEventListener("click", cercaCitta);
document.getElementById("input-citta").addEventListener("keydown", (e) => {
  if (e.key === "Enter") cercaCitta();
});

function cercaCitta() {
  const citta = document.getElementById("input-citta").value.trim();
  if (!citta) return;

  fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(citta)}&format=json&limit=1`)
    .then(res => res.json())
    .then(dati => {
      if (dati.length === 0) { alert("Città non trovata, riprova."); return; }
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

// GEOLOCALIZZAZIONE
document.getElementById("btn-geolocal").addEventListener("click", () => {
  if (!navigator.geolocation) { alert("Il tuo browser non supporta la geolocalizzazione."); return; }

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
    () => { alert("Impossibile ottenere la posizione. Controlla i permessi del browser."); }
  );
});

// STATO UTENTE NELL'HEADER
async function aggiornaHeader() {
  const { data } = await supabaseClient.auth.getSession();

  const btnNotifiche = document.getElementById("btn-notifiche");
  const avatarLink = document.getElementById("avatar-link");
  const navAccedi = document.getElementById("nav-accedi");
  const navCalendario = document.querySelector("[data-vista='calendario']");
  const barraRicerca = document.getElementById("barra-ricerca");

  if (data.session) {
    const user = data.session.user;
    const { data: profilo } = await supabaseClient
      .from("profili")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();

    // Mostra elementi loggato
    btnNotifiche.style.display = "inline-flex";
    avatarLink.style.display = "inline-flex";
    navAccedi.style.display = "none";
    barraRicerca.style.display = "flex";
    if (navCalendario) navCalendario.style.display = "inline";

    if (profilo?.avatar_url) {
      document.getElementById("avatar").innerHTML = `<img src="${profilo.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
    }
  } else {
    //utente non loggato 
        navAccedi.style.display = "inline";
        btnNotifiche.style.display = "none";
        avatarLink.style.display = "none";
        barraRicerca.style.display = "flex"; // ← cambia da "none" a "flex"
  if (navCalendario) navCalendario.style.display = "none";
}
  lucide.createIcons();
}

async function salvaEvento(eventoId, btn) {
  const { data: sessionData } = await supabaseClient.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) { apriPopupLogin(); return; }

  if (btn.classList.contains("salvato")) {
    // rimuovi
    await supabaseClient
      .from("eventi_salvati")
      .delete()
      .eq("user_id", user.id)
      .eq("evento_id", eventoId);
    btn.classList.remove("salvato");
  } else {
    // salva
    await supabaseClient
      .from("eventi_salvati")
      .insert({ user_id: user.id, evento_id: eventoId });
    btn.classList.add("salvato");
  }
}

function apriPopupLogin() {
  document.getElementById("popup-login").style.display = "flex";
  lucide.createIcons();
}

function chiudiPopupLogin() {
  document.getElementById("popup-login").style.display = "none";
}

async function aggiornaStatoSalvataggi() {
  const { data: sessionData } = await supabaseClient.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) return;

  const { data: salvati } = await supabaseClient
    .from("eventi_salvati")
    .select("evento_id")
    .eq("user_id", user.id);

  if (!salvati || salvati.length === 0) return;

  const idsSalvati = salvati.map(s => s.evento_id);

  document.querySelectorAll(".card").forEach(card => {
    const btn = card.querySelector(".btn-salva");
    if (!btn) return;
    const eventoId = parseInt(btn.getAttribute("onclick").match(/salvaEvento\((\d+)/)?.[1]);
    if (idsSalvati.includes(eventoId)) {
      btn.classList.add("salvato");
    }
  });
}

function impostaDataSelezionata(data, bottoneAttivo = null) {
  dataSelezionata = dataLocale(data);
  document.getElementById("filtro-data-eventi").value = dataSelezionata;

  document.querySelectorAll(".date-chip").forEach(btn => btn.classList.remove("attivo"));
  if (bottoneAttivo) bottoneAttivo.classList.add("attivo");

  mostraEventi();
  aggiornaMappa();
  aggiornaStatoSalvataggi();
}

document.getElementById("btn-oggi").addEventListener("click", () => {
  impostaDataSelezionata(new Date(), document.getElementById("btn-oggi"));
});

document.getElementById("btn-domani").addEventListener("click", () => {
  impostaDataSelezionata(aggiungiGiorni(new Date(), 1), document.getElementById("btn-domani"));
});

document.getElementById("btn-dopodomani").addEventListener("click", () => {
  impostaDataSelezionata(aggiungiGiorni(new Date(), 2), document.getElementById("btn-dopodomani"));
});

document.getElementById("filtro-data-eventi").addEventListener("change", (e) => {
  if (!e.target.value) return;

  dataSelezionata = e.target.value;
  document.querySelectorAll(".date-chip").forEach(btn => btn.classList.remove("attivo"));

  mostraEventi();
  aggiornaMappa();
  aggiornaStatoSalvataggi();
});

const btnCalendarioData = document.getElementById("btn-calendario-data");
const inputDataEventi = document.getElementById("filtro-data-eventi");

if (btnCalendarioData && inputDataEventi) {
  btnCalendarioData.addEventListener("click", () => {
    if (inputDataEventi.showPicker) {
      inputDataEventi.showPicker();
    } else {
      inputDataEventi.click();
    }
  });
}

// AVVIO
document.getElementById("filtro-data-eventi").value = dataSelezionata;
aggiornaHeader();

// GESTISCI REDIRECT DA ACCOUNT CON CITTÀ
const urlParams = new URLSearchParams(window.location.search);
const cittaParam = urlParams.get("citta");
const vistaParam = urlParams.get("vista");

if (cittaParam) {
  document.getElementById("input-citta").value = cittaParam;
  caricaEventi(cittaParam.charAt(0).toUpperCase() + cittaParam.slice(1).toLowerCase());
} else {
  caricaEventi("Torino");
}

// APRI DIRETTAMENTE IL CALENDARIO SE RICHIESTO
if (vistaParam === "calendario") {
  document.getElementById("vista-mappa").style.display = "none";
  document.getElementById("vista-calendario").style.display = "block";
  renderCalendario(meseCorrente, annoCorrente);
}