const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const CITY_ALIASES = {
  turin: "Torino",
  torino: "Torino",
  rome: "Roma",
  roma: "Roma",
  milan: "Milano",
  milano: "Milano",
  florence: "Firenze",
  firenze: "Firenze",
  venice: "Venezia",
  venezia: "Venezia",
  naples: "Napoli",
  napoli: "Napoli",
  aosta: "Aosta",
  rimini: "Rimini",
  riccione: "Riccione",
  jesolo: "Jesolo",
  genoa: "Genova",
  genua: "Genova",
  genova: "Genova"
};

function normalizzaCitta(citta) {
  const valore = (citta || "").trim();
  if (!valore) return "Torino";
  const alias = CITY_ALIASES[valore.toLowerCase()];
  if (alias) return alias;
  return valore.charAt(0).toUpperCase() + valore.slice(1).toLowerCase();
}

let cittaCorrente = normalizzaCitta(params.get("citta") || localStorage.getItem("yn_citta") || "Torino");
localStorage.setItem("yn_citta", cittaCorrente);

const CATEGORY_LABELS = {
  bar: "Bar",
  cocktail: "Cocktail bar",
  wine_bar: "Wine bar",
  pub: "Pub",
  club: "Club",
  locale: "Locale",
};

const CATEGORY_IMAGES = {
  club: "https://images.unsplash.com/photo-1571266028243-d220c6a7edbf?auto=format&fit=crop&w=1800&q=80",
  pub: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1800&q=80",
  cocktail: "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=1800&q=80",
  wine_bar: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1800&q=80",
  bar: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1800&q=80",
  locale: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1800&q=80",
};

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

function valore(value, fallback = "Da confermare") {
  return value || fallback;
}

function labelCategoria(categoria) {
  return CATEGORY_LABELS[categoria] || CATEGORY_LABELS.locale;
}

function mapsUrl(locale) {
  if (locale.lat && locale.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${locale.lat},${locale.lng}`)}`;
  }

  const query = [locale.nome, locale.indirizzo, locale.citta].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function descrizioneFallback(categoria) {
  if (categoria === "club") return "Locale serale da monitorare per DJ set, musica e appuntamenti notturni.";
  if (categoria === "cocktail") return "Cocktail bar utile per iniziare la serata o scoprire eventi speciali.";
  if (categoria === "pub") return "Pub cittadino da tenere d'occhio per serate informali, live e ritrovi.";
  if (categoria === "wine_bar") return "Wine bar adatto a uscite tranquille, aperitivi e serate selezionate.";
  return "Locale da esplorare e arricchire con eventi, vibe e dettagli aggiornati.";
}

function formattaData(data) {
  if (!data) return { giorno: "?", mese: "Data", label: "Data da confermare" };

  const parsed = new Date(`${data}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return { giorno: data, mese: "", label: data };

  return {
    giorno: parsed.toLocaleDateString("it-IT", { day: "numeric" }),
    mese: parsed.toLocaleDateString("it-IT", { month: "short" }),
    label: parsed.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" }),
  };
}

function tipoEventoLabel(tipo) {
  const labels = {
    dj: "DJ set",
    live: "Live music",
    jazz: "Jazz",
    karaoke: "Karaoke",
    sport: "Sport",
  };
  return labels[tipo] || tipo || "Serata";
}

function aggiornaLinkHeader() {
  const linkLocali = document.getElementById("link-torna-locali");
  const linkLogo = document.querySelector(".logo");
  const encoded = encodeURIComponent(cittaCorrente);

  if (linkLocali) linkLocali.href = `locali.html?citta=${encoded}`;
  if (linkLogo) linkLogo.href = `index.html?citta=${encoded}`;
}

async function caricaLocale() {
  if (!id) {
    mostraErrore("Locale non trovato.");
    return;
  }

  aggiornaLinkHeader();

  const { data, error } = await supabaseClient
    .from("locali")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    console.error(error);
    mostraErrore("Locale non trovato.");
    return;
  }

  cittaCorrente = data.citta || cittaCorrente;
  localStorage.setItem("yn_citta", cittaCorrente);
  aggiornaLinkHeader();
  renderLocale(data);

  const eventi = await caricaEventiLocale(data);
  renderEventi(eventi, data);
  inizializzaMappa(data);
  lucide.createIcons();
}

async function caricaEventiLocale(locale) {
  const oggi = new Date().toISOString().slice(0, 10);

  const byLocaleId = await supabaseClient
    .from("Eventi")
    .select("*")
    .eq("locale_id", locale.id)
    .gte("data", oggi)
    .order("data", { ascending: true })
    .limit(6);

  if (!byLocaleId.error && byLocaleId.data?.length) {
    return byLocaleId.data;
  }

  const byName = await supabaseClient
    .from("Eventi")
    .select("*")
    .ilike("locale", locale.nome)
    .gte("data", oggi)
    .order("data", { ascending: true })
    .limit(6);

  if (byName.error) {
    console.warn("Eventi locale non caricati", byName.error);
    return [];
  }

  return byName.data || [];
}

function renderLocale(locale) {
  const categoria = locale.categoria || "locale";
  const img = locale.immagine || CATEGORY_IMAGES[categoria] || CATEGORY_IMAGES.locale;
  const website = normalizeUrl(locale.website || locale.sito_url);
  const instagram = normalizeUrl(locale.instagram_url);
  const mapUrl = mapsUrl(locale);

  document.title = `${locale.nome || "Locale"} - Your Nights`;

  document.getElementById("dettaglio-locale").innerHTML = `
    <section class="locale-hero" style="background-image:url('${escapeHtml(img)}')">
      <div class="locale-hero-overlay"></div>
      <div class="locale-hero-content">
        <div class="locale-badges">
          <span>${escapeHtml(labelCategoria(categoria))}</span>
          <span>${escapeHtml(locale.citta || cittaCorrente)}</span>
        </div>
        <h1>${escapeHtml(valore(locale.nome, "Locale senza nome"))}</h1>
        <p>${escapeHtml(valore(locale.indirizzo, locale.citta || cittaCorrente))}</p>
        <div class="locale-hero-facts">
          <div><i data-lucide="map-pin"></i><span>${escapeHtml(locale.citta || cittaCorrente)}</span></div>
          ${locale.opening_hours ? `<div><i data-lucide="clock"></i><span>${escapeHtml(locale.opening_hours)}</span></div>` : ""}
          ${locale.telefono ? `<div><i data-lucide="phone"></i><span>${escapeHtml(locale.telefono)}</span></div>` : ""}
        </div>
      </div>
    </section>

    <main class="locale-layout">
      <section class="locale-main">
        <div class="locale-section">
          <h2>Il locale</h2>
          <p>${escapeHtml(locale.descrizione || descrizioneFallback(categoria))}</p>
        </div>

        <div class="locale-section" id="locale-eventi-section">
          <h2>Prossimi eventi in questo locale</h2>
          <div class="locale-events-grid" id="locale-eventi-grid">
            <div class="locale-empty">Caricamento eventi...</div>
          </div>
        </div>

        <div class="locale-section locale-map">
          <h2>Dove si trova</h2>
          <div id="locale-map"></div>
        </div>
      </section>

      <aside class="locale-sidebar">
        <div class="locale-info-card">
          <h2>Info locale</h2>
          <div class="locale-info-row"><i data-lucide="tag"></i><span>${escapeHtml(labelCategoria(categoria))}</span></div>
          <div class="locale-info-row"><i data-lucide="map-pin"></i><span>${escapeHtml(valore(locale.indirizzo, locale.citta || cittaCorrente))}</span></div>
          ${locale.opening_hours ? `<div class="locale-info-row"><i data-lucide="clock"></i><span>${escapeHtml(locale.opening_hours)}</span></div>` : ""}
          ${locale.fonte ? `<div class="locale-info-row"><i data-lucide="database"></i><span>${escapeHtml(locale.fonte)}</span></div>` : ""}
        </div>

        <div class="locale-actions">
          <a class="locale-action-primary" href="${mapUrl}" target="_blank" rel="noopener">
            <i data-lucide="navigation"></i>
            Apri mappa
          </a>
          ${website ? `
            <a class="locale-action-secondary" href="${escapeHtml(website)}" target="_blank" rel="noopener">
              <i data-lucide="globe"></i>
              Sito web
            </a>
          ` : ""}
          ${instagram ? `
            <a class="locale-action-secondary" href="${escapeHtml(instagram)}" target="_blank" rel="noopener">
              <i data-lucide="instagram"></i>
              Instagram
            </a>
          ` : ""}
          ${locale.telefono ? `
            <a class="locale-action-secondary" href="tel:${escapeHtml(locale.telefono)}">
              <i data-lucide="phone"></i>
              Chiama
            </a>
          ` : ""}
          <button class="locale-action-secondary" id="btn-condividi-locale" type="button">
            <i data-lucide="share-2"></i>
            Condividi
          </button>
        </div>
      </aside>
    </main>
  `;

  document.getElementById("btn-condividi-locale")?.addEventListener("click", () => condividiLocale(locale));
}

function renderEventi(eventi, locale) {
  const grid = document.getElementById("locale-eventi-grid");
  if (!grid) return;

  if (!eventi.length) {
    grid.innerHTML = `
      <div class="locale-empty">
        Non ci sono ancora eventi associati a ${escapeHtml(locale.nome)}. Appena colleghiamo gli eventi ai locali, questa sezione diventa il cuore della pagina.
      </div>
    `;
    return;
  }

  grid.innerHTML = eventi.map(evento => {
    const data = formattaData(evento.data);
    const href = `evento.html?id=${encodeURIComponent(evento.id)}&citta=${encodeURIComponent(evento.citta || cittaCorrente)}`;

    return `
      <a class="locale-event-card" href="${href}">
        <div class="locale-event-date">
          <div>
            ${escapeHtml(data.giorno)}
            <span>${escapeHtml(data.mese)}</span>
          </div>
        </div>
        <div>
          <h3>${escapeHtml(evento.nome || "Evento senza nome")}</h3>
          <p>${escapeHtml(`${data.label} - ${evento.orario || "Orario da confermare"} - ${tipoEventoLabel(evento.tipo)}`)}</p>
        </div>
        <i data-lucide="arrow-right"></i>
      </a>
    `;
  }).join("");
}

function inizializzaMappa(locale) {
  if (!window.L || !locale.lat || !locale.lng || !document.getElementById("locale-map")) return;

  const lat = Number(locale.lat);
  const lng = Number(locale.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

  const map = L.map("locale-map", {
    zoomControl: true,
    scrollWheelZoom: false,
  }).setView([lat, lng], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  L.marker([lat, lng]).addTo(map).bindPopup(escapeHtml(locale.nome)).openPopup();
}

function condividiLocale(locale) {
  const shareData = {
    title: locale.nome || "Your Nights",
    text: `${locale.nome || "Locale"} - ${locale.citta || cittaCorrente}`,
    url: window.location.href,
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
    return;
  }

  navigator.clipboard?.writeText(window.location.href);
  const btn = document.getElementById("btn-condividi-locale");
  if (btn) btn.innerHTML = `<i data-lucide="check"></i> Link copiato`;
  lucide.createIcons();
}

function mostraErrore(messaggio) {
  document.getElementById("dettaglio-locale").innerHTML = `<p class="locale-error">${escapeHtml(messaggio)}</p>`;
}

caricaLocale();
