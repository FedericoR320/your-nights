const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";

let eventi = [];
let cittaCorrente = getCittaIniziale();
let filtroTipoCorrente = "tutti";
let filtroPeriodoCorrente = "singolo";
let filtroGratisCorrente = false;
let testoRicercaCorrente = "";
let dataSelezionata = dataLocale(new Date());

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const CITY_HERO_IMAGES = {
  Torino: "https://images.unsplash.com/photo-1610651219730-6b580d616e72?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  Milano: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?auto=format&fit=crop&w=1800&q=80",
  Roma: "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1800&q=80",
  Bologna: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1800&q=80",
  Firenze: "https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?auto=format&fit=crop&w=1800&q=80",
  Napoli: "https://images.unsplash.com/photo-1576502200916-3808e07386a5?auto=format&fit=crop&w=1800&q=80",
  Aosta: "https://images.unsplash.com/photo-1653151252091-318a02175fff?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

  Venezia: "https://images.unsplash.com/photo-1517162683422-36daa6db2b22?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=jack-ward-iDULCtMwsOs-unsplash.jpg&w=1800",
  Genova: "https://images.unsplash.com/photo-1744411248744-5c839ee99e6f?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=aditya-segan-bBOZfEiTZWc-unsplash.jpg&w=1800",
  Bari: "https://images.unsplash.com/photo-1721426570243-bd04c1598147?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=benjamin-nilsen-Iswcf58p3Gc-unsplash.jpg&w=1800",
  Palermo: "https://images.unsplash.com/photo-1774244764179-f34b65061ec6?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=christian-lue-tkuXhHi7cg0-unsplash.jpg&w=1800",
  Cagliari: "https://images.unsplash.com/photo-1676203139321-a2fb295238e6?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=zsolt-cserna-Rk1P2j56VRM-unsplash.jpg&w=1800",
  Olbia: "https://images.unsplash.com/photo-1700571969148-87b932ea003c?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=christopher-politano-ejP1X31ckb8-unsplash.jpg&w=1800",

  Rimini: "https://images.unsplash.com/photo-1752937111317-deaa4b5745af?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=monika-sojcakova-bZ4pWlrkGGA-unsplash.jpg&w=1800",
  Riccione: "https://images.unsplash.com/photo-1632046492958-0b3014a11816?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=luc-thomas-pWRirz2SLCc-unsplash.jpg&w=1800",
  Jesolo: "https://images.unsplash.com/photo-1656538632205-5abef6503771?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=alessio-patron-WCwgW29GCeA-unsplash.jpg&w=1800",
  Trieste: "https://images.unsplash.com/photo-1712091705097-42b84c0a5e7a?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=michael-martinelli-ikUandJ7m-c-unsplash.jpg&w=1800",
  Sanremo: "https://images.unsplash.com/photo-1748799545658-5ceeaae52d0a?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=mat-qoiP3AgGUMc-unsplash.jpg&w=1800",
  "San remo": "https://images.unsplash.com/photo-1748799545658-5ceeaae52d0a?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=mat-qoiP3AgGUMc-unsplash.jpg&w=1800",
  Alassio: "https://images.unsplash.com/photo-1713856956101-1621a15ce54f?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=jkphotos-jpg-U6Z58uUV4QA-unsplash.jpg&w=1800",

  Agrigento: "https://images.unsplash.com/photo-1668212145917-79dab85edb91?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=casey-lovegrove-6NGIQct85PY-unsplash.jpg&w=1800",
  Trapani: "https://images.unsplash.com/photo-1757692324926-74a4f5ddc1f1?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=aleksandra-kovacic-T7NptN1lQ-I-unsplash.jpg&w=1800",
  Verona: "https://images.unsplash.com/photo-1741878186841-c8a2620d20e1?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=stepan-konev-gQ-kTWGI0LA-unsplash.jpg&w=1800",
  Pisa: "https://images.unsplash.com/photo-1764214656699-9e8b23696c0c?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=jose-luis-lobera-T8kmB4oVkug-unsplash.jpg&w=1800",
  Lecce: "https://images.unsplash.com/photo-1747842281463-0431c87f01fe?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=neil-bates-lxqsAoz_Fx4-unsplash.jpg&w=1800",
  Taormina: "https://images.unsplash.com/photo-1751675706145-b0e36efb12fb?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&dl=quincy-john-ndem-lRhE6cd4c70-unsplash.jpg&w=1800"
};

const CITY_HERO_DEFAULT = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1800&q=80";

const CITTA_RICERCA = Object.keys(CITY_HERO_IMAGES);

const SEARCH_PLACEHOLDERS = [
  "Cerca citta...",
  "Cerca eventi...",
  "Cerca locali...",
  "Cerca DJ set...",
  "Cerca live music..."
];

function normalizzaCitta(citta) {
  const valore = (citta || "").trim();
  if (!valore) return "Torino";
  return valore.charAt(0).toUpperCase() + valore.slice(1).toLowerCase();
}

function getCittaIniziale() {
  const params = new URLSearchParams(window.location.search);
  return normalizzaCitta(params.get("citta") || localStorage.getItem("yn_citta") || "Torino");
}

function urlConCitta(pagina, extraParams = {}) {
  const params = new URLSearchParams({ citta: cittaCorrente, ...extraParams });
  return `${pagina}?${params.toString()}`;
}

function urlEvento(eventoId) {
  return urlConCitta("evento.html", { id: eventoId });
}

function aggiornaLinkCitta() {
  document.querySelectorAll('a[href^="locali.html"]').forEach(link => {
    link.href = urlConCitta("locali.html");
  });

  document.querySelectorAll('a[href^="account.html"]').forEach(link => {
    const href = link.getAttribute("href") || "";
    const hash = href.includes("#") ? `#${href.split("#")[1]}` : "";
    link.href = `${urlConCitta("account.html")}${hash}`;
  });
}

function impostaCittaCorrente(citta, aggiornaUrl = true) {
  cittaCorrente = normalizzaCitta(citta);
  localStorage.setItem("yn_citta", cittaCorrente);

  const inputCitta = document.getElementById("input-citta");
  if (inputCitta) inputCitta.value = cittaCorrente;

  const inputCittaModal = document.getElementById("input-citta-modal");
  if (inputCittaModal) inputCittaModal.value = cittaCorrente;

  aggiornaHeroCitta();

  if (aggiornaUrl) {
    const params = new URLSearchParams(window.location.search);
    params.set("citta", cittaCorrente);
    history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  aggiornaLinkCitta();
}

function getHeroImageCitta() {
  return CITY_HERO_IMAGES[cittaCorrente] || CITY_HERO_DEFAULT;
}
function aggiornaHeroCitta() {
  const heroCitta = document.getElementById("hero-citta");
  const heroBg = document.getElementById("city-hero-bg");
  const heroCopy = document.getElementById("hero-city-copy");

  if (heroCitta) heroCitta.textContent = cittaCorrente;
  if (heroCopy) heroCopy.textContent = `Eventi, locali e serate da scoprire stasera a ${cittaCorrente}.`;
  if (heroBg) {
    const image = getHeroImageCitta();
    heroBg.style.backgroundImage = `url("${image}")`;
  }

  document.querySelectorAll(".city-suggestion").forEach(btn => {
    btn.classList.toggle("attiva", normalizzaCitta(btn.dataset.citta) === cittaCorrente);
  });
}

function apriCityModal() {
  const modal = document.getElementById("city-modal");
  const input = document.getElementById("input-citta-modal");
  if (!modal) return;

  modal.style.display = "flex";
  if (input) {
    input.value = cittaCorrente;
    setTimeout(() => input.focus(), 50);
  }
  aggiornaHeroCitta();
  lucide.createIcons();
}

function chiudiCityModal() {
  const modal = document.getElementById("city-modal");
  if (modal) modal.style.display = "none";
}
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

function getWeekendRange() {
  const oggi = new Date();
  const giorno = oggi.getDay();
  const giorniAFineSettimana = giorno === 0 ? -2 : giorno <= 5 ? 5 - giorno : -1;
  const venerdi = aggiungiGiorni(oggi, giorniAFineSettimana);
  const domenica = aggiungiGiorni(venerdi, 2);
  return {
    inizio: dataLocale(venerdi),
    fine: dataLocale(domenica)
  };
}

function eventoGratis(evento) {
  const prezzo = String(evento.prezzo || "").toLowerCase().trim();
  return prezzo === "0" || prezzo === "0 euro" || prezzo === "€0" || prezzo === "0€" || prezzo.includes("gratis") || prezzo.includes("free");
}

function testoEvento(evento) {
  return [evento.nome, evento.locale, evento.tipo, evento.citta, evento.descrizione]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function aggiornaStatoQuickFilters() {
  document.querySelectorAll(".date-chip").forEach(btn => btn.classList.remove("attivo"));

  if (filtroPeriodoCorrente === "weekend") {
    document.getElementById("btn-dopodomani")?.classList.add("attivo");
  } else if (dataSelezionata === dataLocale(new Date())) {
    document.getElementById("btn-oggi")?.classList.add("attivo");
  } else if (dataSelezionata === dataLocale(aggiungiGiorni(new Date(), 1))) {
    document.getElementById("btn-domani")?.classList.add("attivo");
  }

  document.getElementById("btn-gratis")?.classList.toggle("attivo", filtroGratisCorrente);
  document.getElementById("btn-live")?.classList.toggle("attivo", filtroTipoCorrente === "live");
  document.getElementById("btn-dj")?.classList.toggle("attivo", filtroTipoCorrente === "dj");
}

function aggiornaTipoAttivo(tipo) {
  document.querySelectorAll(".tipo-opzione").forEach(btn => {
    btn.classList.toggle("attivo", btn.dataset.tipo === tipo);
  });
}

function applicaFiltri() {
  mostraEventi();
  aggiornaMappa();
  aggiornaStatoSalvataggi();
  aggiornaStatoQuickFilters();
}
function getEventiVisibili() {
  const weekend = getWeekendRange();
  const ricerca = testoRicercaCorrente.trim().toLowerCase();

  return eventi.filter(e => {
    const matchTipo = filtroTipoCorrente === "tutti" || e.tipo === filtroTipoCorrente;
    const matchData = filtroPeriodoCorrente === "weekend"
      ? e.data >= weekend.inizio && e.data <= weekend.fine
      : e.data === dataSelezionata;
    const matchGratis = !filtroGratisCorrente || eventoGratis(e);
    const matchRicerca = !ricerca || testoEvento(e).includes(ricerca);

    return matchTipo && matchData && matchGratis && matchRicerca;
  });
}

// CARICA EVENTI DA SUPABASE
async function caricaEventi(citta = cittaCorrente) {
  impostaCittaCorrente(citta);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/Eventi?citta=eq.${encodeURIComponent(cittaCorrente)}&select=*`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  });

  eventi = await res.json();

  mostraEventi();
  aggiornaMappa();

  document.querySelector("#lista-eventi h2").textContent = `Stasera a ${cittaCorrente}`;

  await aggiornaStatoSalvataggi();
}

// CARD
function creaCard(evento) {
  const loggato = !!localStorage.getItem("yn_token");
  const imgUrl = evento.immagine || "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800";

  return `
    <div class="card" data-tipo="${evento.tipo}">
      <div class="card-img" style="background-image:url('${imgUrl}')" onclick="window.location.href='${urlEvento(evento.id)}'">
        <div class="card-img-overlay"></div>
        <button class="btn-salva" onclick="event.stopPropagation(); ${loggato ? `salvaEvento(${evento.id}, this)` : `apriPopupLogin()`}" title="Salva">
          <span class="salva-label">Salva</span>
          <i data-lucide="bookmark"></i>
        </button>
      </div>
      <div class="card-body" onclick="window.location.href='${urlEvento(evento.id)}'" style="cursor:pointer">
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

// MENU FILTRI
document.getElementById("btn-apri-tipi").addEventListener("click", () => {
  document.getElementById("menu-tipi").classList.toggle("aperto");
});

document.querySelectorAll(".tipo-opzione").forEach(bottone => {
  bottone.addEventListener("click", () => {
    document.querySelectorAll(".tipo-opzione").forEach(b => b.classList.remove("attivo"));
    bottone.classList.add("attivo");

    filtroTipoCorrente = bottone.dataset.tipo;
    aggiornaTipoAttivo(filtroTipoCorrente);

    document.getElementById("menu-tipi").classList.remove("aperto");

    applicaFiltri();
  });
});

// MAPPA
const mappa = L.map('mappa').setView([45.0703, 7.6869], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'OpenStreetMap'
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
        Ore ${evento.orario}<br>
        Prezzo ${evento.prezzo}<br>
        <a href="${urlEvento(evento.id)}" style="color:#e63946;">Vedi dettagli</a>
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



function mostraVistaMappa() {
  document.getElementById("vista-mappa").style.display = "block";
  document.getElementById("vista-calendario").style.display = "none";
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("attiva"));
  const navMappa = document.querySelector("[data-vista='mappa']");
  if (navMappa) navMappa.classList.add("attiva");
  setTimeout(() => mappa.invalidateSize(), 100);
}

function estraiCittaDaIndirizzo(address = {}) {
  return address.city || address.town || address.village || address.municipality || address.county || address.state_district || "";
}

async function aggiornaCittaDaCoordinate(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10&addressdetails=1`);
    const dati = await res.json();
    const cittaRilevata = estraiCittaDaIndirizzo(dati.address);

    if (cittaRilevata) {
      await caricaEventi(normalizzaCitta(cittaRilevata));
    }
  } catch (error) {
    console.warn("Citta non rilevata dalla posizione", error);
  }
}

function avviaPlaceholderDinamico() {
  const inputs = [
    document.getElementById("input-citta"),
    document.getElementById("input-citta-modal")
  ].filter(Boolean);

  if (inputs.length === 0) return;

  let indice = 0;
  const aggiornaPlaceholder = () => {
    inputs.forEach(input => {
      if (document.activeElement !== input) {
        input.placeholder = SEARCH_PLACEHOLDERS[indice];
      }
    });
    indice = (indice + 1) % SEARCH_PLACEHOLDERS.length;
  };

  aggiornaPlaceholder();
  setInterval(aggiornaPlaceholder, 2200);
}
function cambiaCitta(citta) {
  const valore = (citta || "").trim();
  if (!valore) return;

  const cittaNormalizzata = normalizzaCitta(valore);

  chiudiCityModal();
  mostraVistaMappa();
  impostaCittaCorrente(cittaNormalizzata);
  caricaEventi(cittaNormalizzata);

  fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cittaNormalizzata)}&format=json&limit=1`)
    .then(res => res.json())
    .then(dati => {
      if (dati.length > 0) {
        const lat = parseFloat(dati[0].lat);
        const lng = parseFloat(dati[0].lon);
        mappa.setView([lat, lng], 13);
        setTimeout(() => mappa.invalidateSize(), 100);
      }
    })
    .catch(() => {});
}

function getRisultatiRicerca(query) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const risultatiCitta = CITTA_RICERCA
    .filter(citta => citta.toLowerCase().includes(q))
    .slice(0, 4)
    .map(citta => ({ tipo: "citta", titolo: citta, meta: "Cambia citta", valore: citta, icona: "map-pin" }));

  const risultatiEventi = eventi
    .filter(evento => testoEvento(evento).includes(q))
    .slice(0, 5)
    .map(evento => ({
      tipo: "evento",
      titolo: evento.nome || "Evento",
      meta: `${evento.locale || cittaCorrente} - ${evento.orario || ""}`,
      valore: evento.id,
      icona: "calendar-days"
    }));

  const localiUnici = [];
  eventi.forEach(evento => {
    const locale = evento.locale;
    if (!locale) return;
    if (!locale.toLowerCase().includes(q)) return;
    if (localiUnici.some(item => item.toLowerCase() === locale.toLowerCase())) return;
    localiUnici.push(locale);
  });

  const risultatiLocali = localiUnici.slice(0, 4).map(locale => ({
    tipo: "locale",
    titolo: locale,
    meta: `Locale a ${cittaCorrente}`,
    valore: locale,
    icona: "building-2"
  }));

  return [...risultatiCitta, ...risultatiEventi, ...risultatiLocali].slice(0, 8);
}

function renderRisultatiRicerca(input, container) {
  if (!input || !container) return;

  const risultati = getRisultatiRicerca(input.value);
  if (risultati.length === 0) {
    container.classList.remove("aperto");
    container.innerHTML = "";
    return;
  }

  container.innerHTML = risultati.map((risultato, index) => `
    <button class="search-result-btn" type="button" data-search-index="${index}">
      <span class="search-result-icon"><i data-lucide="${risultato.icona}"></i></span>
      <span>
        <span class="search-result-title">${risultato.titolo}</span>
        <span class="search-result-meta">${risultato.meta}</span>
      </span>
      <span class="search-result-kind">${risultato.tipo}</span>
    </button>
  `).join("");

  container.classList.add("aperto");

  container.querySelectorAll(".search-result-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const risultato = risultati[Number(btn.dataset.searchIndex)];
      applicaRisultatoRicerca(risultato, input, container);
    });
  });

  lucide.createIcons();
}

function applicaRisultatoRicerca(risultato, input, container) {
  if (!risultato) return;

  container?.classList.remove("aperto");
  if (input) input.value = risultato.titolo;

  if (risultato.tipo === "citta") {
    testoRicercaCorrente = "";
    cambiaCitta(risultato.valore);
    return;
  }

  if (risultato.tipo === "evento") {
    window.location.href = urlEvento(risultato.valore);
    return;
  }

  if (risultato.tipo === "locale") {
    testoRicercaCorrente = risultato.valore;
    applicaFiltri();
    document.getElementById("lista-eventi")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function eseguiRicercaGlobale(input, container) {
  if (!input) return;
  const query = input.value.trim();
  if (!query) return;

  const risultati = getRisultatiRicerca(query);
  if (risultati.length > 0) {
    applicaRisultatoRicerca(risultati[0], input, container);
    return;
  }

  testoRicercaCorrente = "";
  cambiaCitta(query);
}

function setupRicercaGlobale(inputId, containerId, buttonId = null) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);
  const button = buttonId ? document.getElementById(buttonId) : null;

  if (!input || !container) return;

  input.addEventListener("input", () => {
    if (!input.value.trim() && testoRicercaCorrente) {
      testoRicercaCorrente = "";
      applicaFiltri();
    }
    renderRisultatiRicerca(input, container);
  });
  input.addEventListener("focus", () => renderRisultatiRicerca(input, container));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      eseguiRicercaGlobale(input, container);
    }
    if (e.key === "Escape") {
      container.classList.remove("aperto");
    }
  });

  if (button) {
    button.addEventListener("click", () => eseguiRicercaGlobale(input, container));
  }
}
// CERCA CITTA
setupRicercaGlobale("input-citta", "risultati-ricerca", "btn-citta");

function cercaCitta() {
  const citta = document.getElementById("input-citta").value.trim();
  if (!citta) return;
  cambiaCitta(citta);
}

const btnCambiaCitta = document.getElementById("btn-cambia-citta");
const btnChiudiCityModal = document.getElementById("city-modal-close");
const cityModalOverlay = document.getElementById("city-modal-overlay");
const btnCittaModal = document.getElementById("btn-citta-modal");
const inputCittaModal = document.getElementById("input-citta-modal");

if (btnCambiaCitta) btnCambiaCitta.addEventListener("click", apriCityModal);
if (btnChiudiCityModal) btnChiudiCityModal.addEventListener("click", chiudiCityModal);
if (cityModalOverlay) cityModalOverlay.addEventListener("click", chiudiCityModal);
setupRicercaGlobale("input-citta-modal", "risultati-ricerca-modal", "btn-citta-modal");

document.querySelectorAll(".city-suggestion").forEach(btn => {
  btn.addEventListener("click", () => cambiaCitta(btn.dataset.citta));
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".cerca-citta") && !e.target.closest(".city-modal-search")) {
    document.getElementById("risultati-ricerca")?.classList.remove("aperto");
    document.getElementById("risultati-ricerca-modal")?.classList.remove("aperto");
  }
});
// GEOLOCALIZZAZIONE
document.getElementById("btn-geolocal").addEventListener("click", () => {
  if (!navigator.geolocation) { alert("Il tuo browser non supporta la geolocalizzazione."); return; }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      mappa.setView([lat, lng], 14);
      mostraVistaMappa();
      L.marker([lat, lng], {
        icon: L.divIcon({
          className: '',
          html: '<div style="background:#e63946;width:14px;height:14px;border-radius:50%;border:2px solid white;"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        })
      }).addTo(mappa).bindPopup("Tu sei qui").openPopup();
      aggiornaCittaDaCoordinate(lat, lng);
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
        barraRicerca.style.display = "flex";
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
  filtroPeriodoCorrente = "singolo";
  document.getElementById("filtro-data-eventi").value = dataSelezionata;

  applicaFiltri();
}

document.getElementById("btn-oggi").addEventListener("click", () => {
  impostaDataSelezionata(new Date(), document.getElementById("btn-oggi"));
});

document.getElementById("btn-domani").addEventListener("click", () => {
  impostaDataSelezionata(aggiungiGiorni(new Date(), 1), document.getElementById("btn-domani"));
});

document.getElementById("btn-dopodomani").addEventListener("click", () => {
  filtroPeriodoCorrente = "weekend";
  applicaFiltri();
});

document.getElementById("filtro-data-eventi").addEventListener("change", (e) => {
  if (!e.target.value) return;

  dataSelezionata = e.target.value;
  filtroPeriodoCorrente = "singolo";

  applicaFiltri();
});


document.getElementById("btn-gratis")?.addEventListener("click", () => {
  filtroGratisCorrente = !filtroGratisCorrente;
  applicaFiltri();
});

document.getElementById("btn-live")?.addEventListener("click", () => {
  filtroTipoCorrente = filtroTipoCorrente === "live" ? "tutti" : "live";
  aggiornaTipoAttivo(filtroTipoCorrente);
  applicaFiltri();
});

document.getElementById("btn-dj")?.addEventListener("click", () => {
  filtroTipoCorrente = filtroTipoCorrente === "dj" ? "tutti" : "dj";
  aggiornaTipoAttivo(filtroTipoCorrente);
  applicaFiltri();
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
impostaCittaCorrente(cittaCorrente, false);
avviaPlaceholderDinamico();
aggiornaHeader();

// GESTISCI REDIRECT DA ACCOUNT CON CITTA
const urlParams = new URLSearchParams(window.location.search);
const cittaParam = urlParams.get("citta");
const vistaParam = urlParams.get("vista");

caricaEventi(cittaParam ? normalizzaCitta(cittaParam) : cittaCorrente);

// APRI DIRETTAMENTE IL CALENDARIO SE RICHIESTO
if (vistaParam === "calendario") {
  document.getElementById("vista-mappa").style.display = "none";
  document.getElementById("vista-calendario").style.display = "block";
  renderCalendario(meseCorrente, annoCorrente);
}

