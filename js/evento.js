// CONFIGURAZIONE SUPABASE
const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";

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

const cittaCorrente = normalizzaCitta(params.get("citta") || localStorage.getItem("yn_citta") || "Torino");
localStorage.setItem("yn_citta", cittaCorrente);

const linkMappa = document.querySelector("header nav a");
if (linkMappa) {
  linkMappa.href = `index.html?citta=${encodeURIComponent(cittaCorrente)}`;
}

function valore(value, fallback = "Da confermare") {
  return value || fallback;
}

function formattaData(data) {
  if (!data) return "Data da confermare";
  const parsed = new Date(`${data}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return data;
  return parsed.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

function tipoEventoLabel(tipo) {
  if (!tipo) return "Serata";
  const labels = {
    dj: "DJ set",
    live: "Live music",
    jazz: "Jazz",
    karaoke: "Karaoke",
    sport: "Sport"
  };
  return labels[tipo] || tipo;
}

function eventoGratis(prezzo) {
  const valorePrezzo = String(prezzo || "").toLowerCase().trim();
  return valorePrezzo === "0" || valorePrezzo === "0 euro" || valorePrezzo === "0€" || valorePrezzo.includes("gratis") || valorePrezzo.includes("free");
}

function mapsUrl(e) {
  if (e.lat && e.lng) return `https://www.google.com/maps/search/?api=1&query=${e.lat},${e.lng}`;
  const query = [e.indirizzo, e.locale, e.citta].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function condividiEvento(e) {
  const shareData = {
    title: e.nome || "Your Nights",
    text: `${e.nome || "Evento"} - ${e.locale || e.citta || ""}`,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
    return;
  }

  navigator.clipboard?.writeText(window.location.href);
  const btn = document.getElementById("btn-condividi-evento");
  if (btn) btn.textContent = "Link copiato";
}

async function caricaDettaglio() {
  if (!id) {
    document.getElementById("dettaglio-evento").innerHTML = "<p class='evento-error'>Evento non trovato.</p>";
    return;
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/Eventi?id=eq.${id}&select=*`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`
    }
  });

  const dati = await res.json();

  if (!dati || dati.length === 0) {
    document.getElementById("dettaglio-evento").innerHTML = "<p class='evento-error'>Evento non trovato.</p>";
    return;
  }

  const e = dati[0];
  const img = e.immagine || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1800&q=80";
  const prezzo = valore(e.prezzo, "Info prezzo");
  const tipo = tipoEventoLabel(e.tipo);
  const dataLabel = formattaData(e.data);
  const mapUrl = mapsUrl(e);

  document.title = `${e.nome || "Evento"} - Your Nights`;

  document.getElementById("dettaglio-evento").innerHTML = `
    <section class="evento-hero" style="background-image:url('${img}')">
      <div class="evento-hero-overlay"></div>
      <div class="evento-hero-content">
        <a class="evento-back" href="index.html?citta=${encodeURIComponent(e.citta || cittaCorrente)}">
          <i data-lucide="arrow-left"></i>
          Torna agli eventi
        </a>
        <div class="evento-badges">
          <span>${tipo}</span>
          ${eventoGratis(e.prezzo) ? "<span>Gratis</span>" : ""}
        </div>
        <h1>${valore(e.nome, "Evento senza nome")}</h1>
        <p>${valore(e.locale, "Locale da confermare")} · ${valore(e.citta, cittaCorrente)}</p>
        <div class="evento-hero-facts">
          <div><i data-lucide="calendar-days"></i><span>${dataLabel}</span></div>
          <div><i data-lucide="clock"></i><span>${valore(e.orario, "Orario da confermare")}</span></div>
          <div><i data-lucide="ticket"></i><span>${prezzo}</span></div>
        </div>
      </div>
    </section>

    <main class="evento-layout">
      <section class="evento-main">
        <div class="evento-section">
          <h2>Descrizione</h2>
          <p>${valore(e.descrizione, "Descrizione non ancora disponibile.")}</p>
        </div>

        <div class="evento-section evento-place-section">
          <h2>Locale</h2>
          <div class="evento-place-card">
            <div>
              <strong>${valore(e.locale, "Locale da confermare")}</strong>
              <span>${valore(e.indirizzo, e.citta || cittaCorrente)}</span>
            </div>
            <a href="${mapUrl}" target="_blank" rel="noopener">Apri mappa</a>
          </div>
        </div>
      </section>

      <aside class="evento-sidebar">
        <div class="evento-info-card">
          <h2>Info serata</h2>
          <div class="evento-info-row"><i data-lucide="map-pin"></i><span>${valore(e.indirizzo, e.citta || cittaCorrente)}</span></div>
          <div class="evento-info-row"><i data-lucide="clock"></i><span>${valore(e.orario, "Orario da confermare")}</span></div>
          <div class="evento-info-row"><i data-lucide="calendar-days"></i><span>${dataLabel}</span></div>
          <div class="evento-info-row"><i data-lucide="ticket"></i><span>${prezzo}</span></div>
          <div class="evento-info-row"><i data-lucide="music"></i><span>${tipo}</span></div>
        </div>

        <div class="evento-actions">
          <a class="evento-action-primary" href="${mapUrl}" target="_blank" rel="noopener">Vai al locale</a>
          <button class="evento-action-secondary" id="btn-condividi-evento" type="button">Condividi</button>
        </div>
      </aside>
    </main>
  `;

  document.getElementById("btn-condividi-evento")?.addEventListener("click", () => condividiEvento(e));
  lucide.createIcons();
}

caricaDettaglio();
