// CONFIGURAZIONE SUPABASE
const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";

// LEGGI ID DALL'URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const cittaCorrente = params.get("citta") || localStorage.getItem("yn_citta") || "Torino";
localStorage.setItem("yn_citta", cittaCorrente);

const linkMappa = document.querySelector("header nav a");
if (linkMappa) {
  linkMappa.href = `index.html?citta=${encodeURIComponent(cittaCorrente)}`;
}

async function caricaDettaglio() {
  if (!id) {
    document.getElementById("dettaglio-evento").innerHTML = "<p style='color:#e63946'>Evento non trovato.</p>";
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
    document.getElementById("dettaglio-evento").innerHTML = "<p style='color:#e63946'>Evento non trovato.</p>";
    return;
  }

  const e = dati[0];

  document.title = `${e.nome} — Your Nights`;

  document.getElementById("dettaglio-evento").innerHTML = `
    <div class="dettaglio-header">
      <div class="tipo">${e.tipo}</div>
      <h1>${e.nome}</h1>
      <p class="dettaglio-locale">${e.locale}</p>
    </div>
    <div class="dettaglio-info">
      <div class="info-riga">📍 <span>${e.indirizzo}</span></div>
      <div class="info-riga">🕐 <span>${e.orario}</span></div>
      <div class="info-riga">📅 <span>${e.data}</span></div>
      <div class="info-riga">💶 <span>${e.prezzo}</span></div>
      <div class="info-riga">🏙️ <span>${e.citta}</span></div>
    </div>
    <div class="dettaglio-descrizione">
      <h2>Descrizione</h2>
      <p>${e.descrizione || "Descrizione non ancora disponibile."}</p>
    </div>
  `;
}

caricaDettaglio();