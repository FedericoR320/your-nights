const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const CATEGORY_LABELS = {
  bar: "Bar",
  cocktail: "Cocktail",
  wine_bar: "Wine bar",
  pub: "Pub",
  club: "Club",
  locale: "Locale",
};

const CITY_COORDS = {
  Torino: [45.0703, 7.6869],
  Milano: [45.4642, 9.19],
  Roma: [41.9028, 12.4964],
  Bologna: [44.4949, 11.3426],
  Firenze: [43.7696, 11.2558],
  Napoli: [40.8518, 14.2681],
};

const CATEGORY_IMAGES = {
  club: "https://images.unsplash.com/photo-1571266028243-d220c6a7edbf?auto=format&fit=crop&w=900&q=80",
  pub: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80",
  cocktail: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=900&q=80",
  wine_bar: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80",
  bar: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=900&q=80",
  locale: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80",
};

let locali = [];
let markers = [];
let mappaLocali = null;
let cittaCorrente = getCittaIniziale();
let categoriaCorrente = "tutti";
let ricercaCorrente = "";

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

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function aggiornaLinkCitta() {
  document.querySelectorAll('a[href^="index.html"]').forEach(link => {
    link.href = urlConCitta("index.html");
  });

  document.querySelectorAll('a[href^="account.html"]').forEach(link => {
    link.href = urlConCitta("account.html");
  });

  const linkEventi = document.getElementById("link-eventi-citta");
  if (linkEventi) linkEventi.href = urlConCitta("index.html");
}

function impostaCittaCorrente(citta, aggiornaUrl = true) {
  cittaCorrente = normalizzaCitta(citta);
  localStorage.setItem("yn_citta", cittaCorrente);

  const inputCitta = document.getElementById("input-citta-locali");
  const titoloCitta = document.getElementById("locali-citta-titolo");
  const heroCopy = document.getElementById("locali-hero-copy");
  const mapCity = document.getElementById("locali-map-city");

  if (inputCitta) inputCitta.value = cittaCorrente;
  if (titoloCitta) titoloCitta.textContent = cittaCorrente;
  if (heroCopy) {
    heroCopy.textContent = `Cocktail bar, pub e club di ${cittaCorrente} da tenere d'occhio per la prossima uscita.`;
  }
  if (mapCity) mapCity.textContent = cittaCorrente;

  if (aggiornaUrl) {
    const params = new URLSearchParams(window.location.search);
    params.set("citta", cittaCorrente);
    history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  aggiornaLinkCitta();
}

function inizializzaMappa() {
  if (mappaLocali || !window.L) return;

  const coords = CITY_COORDS[cittaCorrente] || CITY_COORDS.Torino;
  mappaLocali = L.map("mappa-locali", {
    zoomControl: true,
    scrollWheelZoom: false,
  }).setView(coords, 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(mappaLocali);
}

function centraMappa(localiDaMostrare = localiFiltrati()) {
  if (!mappaLocali) return;

  const punti = localiDaMostrare
    .filter(locale => Number.isFinite(Number(locale.lat)) && Number.isFinite(Number(locale.lng)))
    .map(locale => [Number(locale.lat), Number(locale.lng)]);

  if (punti.length === 0) {
    const coords = CITY_COORDS[cittaCorrente] || CITY_COORDS.Torino;
    mappaLocali.setView(coords, 13);
    return;
  }

  if (punti.length === 1) {
    mappaLocali.setView(punti[0], 15);
    return;
  }

  mappaLocali.fitBounds(punti, { padding: [34, 34], maxZoom: 15 });
}

function aggiornaMarker(localiDaMostrare) {
  if (!mappaLocali) return;

  markers.forEach(marker => marker.remove());
  markers = [];

  localiDaMostrare.forEach(locale => {
    const lat = Number(locale.lat);
    const lng = Number(locale.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const marker = L.marker([lat, lng])
      .addTo(mappaLocali)
      .bindPopup(`
        <div class="locale-popup">
          <strong>${escapeHtml(locale.nome)}</strong>
          <span>${escapeHtml(labelCategoria(locale.categoria))}</span>
        </div>
      `);

    markers.push(marker);
  });

  centraMappa(localiDaMostrare);
}

async function caricaLocali(citta = cittaCorrente) {
  impostaCittaCorrente(citta);
  inizializzaMappa();
  setStatus("Caricamento locali...");

  const { data, error } = await supabaseClient
    .from("locali")
    .select("*")
    .ilike("citta", cittaCorrente)
    .order("nome", { ascending: true });

  if (error) {
    console.error(error);
    locali = [];
    mostraLocali("Errore nel caricamento dei locali.");
    return;
  }

  locali = data || [];
  mostraLocali();
}

function labelCategoria(categoria) {
  return CATEGORY_LABELS[categoria] || CATEGORY_LABELS.locale;
}

function localiFiltrati() {
  const query = ricercaCorrente.trim().toLowerCase();

  return locali.filter(locale => {
    const categoria = locale.categoria || "locale";
    const passaCategoria = categoriaCorrente === "tutti" || categoria === categoriaCorrente;

    if (!passaCategoria) return false;
    if (!query) return true;

    const testo = [
      locale.nome,
      locale.citta,
      locale.categoria,
      locale.indirizzo,
      locale.descrizione,
      locale.opening_hours,
    ].join(" ").toLowerCase();

    return testo.includes(query);
  });
}

function setStatus(testo) {
  const status = document.getElementById("locali-status");
  if (status) status.textContent = testo;
}

function mostraLocali(messaggioErrore = "") {
  const container = document.getElementById("locali-container");
  const count = document.getElementById("locali-count");
  const localiDaMostrare = localiFiltrati();

  if (count) {
    const totale = localiDaMostrare.length;
    count.textContent = `${totale} ${totale === 1 ? "locale trovato" : "locali trovati"}`;
  }

  if (messaggioErrore) {
    setStatus("Riprova tra poco o controlla la tabella Supabase.");
    container.innerHTML = `<p class="empty-state">${escapeHtml(messaggioErrore)}</p>`;
    aggiornaMarker([]);
    return;
  }

  if (locali.length === 0) {
    setStatus(`Nessun locale caricato per ${cittaCorrente}.`);
    container.innerHTML = `
      <p class="empty-state">Non ci sono ancora locali per questa citta. Importa il CSV Torino in Supabase e ricarica la pagina.</p>
    `;
    aggiornaMarker([]);
    return;
  }

  if (localiDaMostrare.length === 0) {
    setStatus("Prova a cambiare filtro o ricerca.");
    container.innerHTML = `<p class="empty-state">Nessun locale corrisponde ai filtri attuali.</p>`;
    aggiornaMarker([]);
    return;
  }

  const categoriaLabel = categoriaCorrente === "tutti" ? "tutte le categorie" : labelCategoria(categoriaCorrente);
  setStatus(`${cittaCorrente} - ${categoriaLabel}`);
  container.innerHTML = localiDaMostrare.map(creaCardLocale).join("");
  aggiornaMarker(localiDaMostrare);
  lucide.createIcons();
}

function creaCardLocale(locale) {
  const categoria = locale.categoria || "locale";
  const img = locale.immagine || CATEGORY_IMAGES[categoria] || CATEGORY_IMAGES.locale;
  const website = normalizeUrl(locale.website || locale.sito_url);
  const instagram = normalizeUrl(locale.instagram_url);
  const mapsUrl = locale.lat && locale.lng
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${locale.lat},${locale.lng}`)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${locale.nome} ${locale.indirizzo || cittaCorrente}`)}`;

  return `
    <article class="locale-card" data-locale-id="${escapeHtml(locale.id || locale.osm_id || "")}">
      <div class="locale-img" style="background-image:url('${escapeHtml(img)}')">
        <span class="locale-badge">${escapeHtml(labelCategoria(categoria))}</span>
      </div>

      <div class="locale-body">
        <h3>${escapeHtml(locale.nome)}</h3>

        <div class="locale-meta">
          <p class="locale-meta-row">
            <i data-lucide="map-pin"></i>
            <span>${escapeHtml(locale.indirizzo || locale.citta || cittaCorrente)}</span>
          </p>

          ${locale.opening_hours ? `
            <p class="locale-meta-row">
              <i data-lucide="clock"></i>
              <span>${escapeHtml(locale.opening_hours)}</span>
            </p>
          ` : ""}
        </div>

        <p class="locale-descrizione">
          ${escapeHtml(locale.descrizione || descrizioneFallback(categoria))}
        </p>

        <div class="locale-actions">
          <a href="${mapsUrl}" target="_blank" rel="noopener">
            <i data-lucide="navigation"></i>
            Mappa
          </a>
          ${website ? `
            <a href="${escapeHtml(website)}" target="_blank" rel="noopener">
              <i data-lucide="globe"></i>
              Sito
            </a>
          ` : ""}
          ${instagram ? `
            <a href="${escapeHtml(instagram)}" target="_blank" rel="noopener">
              <i data-lucide="instagram"></i>
              Instagram
            </a>
          ` : ""}
          ${locale.telefono ? `
            <a href="tel:${escapeHtml(locale.telefono)}">
              <i data-lucide="phone"></i>
              Chiama
            </a>
          ` : ""}
        </div>
      </div>
    </article>
  `;
}

function descrizioneFallback(categoria) {
  if (categoria === "club") return "Locale serale da monitorare per DJ set, musica e appuntamenti notturni.";
  if (categoria === "cocktail") return "Cocktail bar utile per iniziare la serata o scoprire eventi speciali.";
  if (categoria === "pub") return "Pub cittadino da tenere d'occhio per serate informali, live e ritrovi.";
  if (categoria === "wine_bar") return "Wine bar adatto a uscite tranquille, aperitivi e serate selezionate.";
  return "Locale da esplorare e arricchire con eventi, vibe e dettagli aggiornati.";
}

document.querySelectorAll(".locale-filtro").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".locale-filtro").forEach(button => button.classList.remove("attivo"));
    btn.classList.add("attivo");
    categoriaCorrente = btn.dataset.categoria;
    mostraLocali();
  });
});

document.getElementById("btn-citta-locali").addEventListener("click", cercaCittaLocali);

document.getElementById("input-citta-locali").addEventListener("keydown", event => {
  if (event.key === "Enter") cercaCittaLocali();
});

document.getElementById("input-ricerca-locale").addEventListener("input", event => {
  ricercaCorrente = event.target.value;
  mostraLocali();
});

document.getElementById("btn-centra-mappa").addEventListener("click", () => {
  centraMappa();
});

function cercaCittaLocali() {
  const citta = document.getElementById("input-citta-locali").value.trim();
  if (!citta) return;

  categoriaCorrente = "tutti";
  ricercaCorrente = "";
  document.getElementById("input-ricerca-locale").value = "";
  document.querySelectorAll(".locale-filtro").forEach(button => {
    button.classList.toggle("attivo", button.dataset.categoria === "tutti");
  });

  caricaLocali(normalizzaCitta(citta));
}

impostaCittaCorrente(cittaCorrente, false);
caricaLocali(cittaCorrente);
