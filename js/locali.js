const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let locali = [];
let cittaCorrente = getCittaIniziale();
let categoriaCorrente = "tutti";

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

function aggiornaLinkCitta() {
  document.querySelectorAll('a[href^="index.html"]').forEach(link => {
    link.href = urlConCitta("index.html");
  });

  document.querySelectorAll('a[href^="account.html"]').forEach(link => {
    link.href = urlConCitta("account.html");
  });
}

function impostaCittaCorrente(citta, aggiornaUrl = true) {
  cittaCorrente = normalizzaCitta(citta);
  localStorage.setItem("yn_citta", cittaCorrente);

  const inputCitta = document.getElementById("input-citta-locali");
  if (inputCitta) inputCitta.value = cittaCorrente;

  const heroTesto = document.querySelector(".locali-hero p");
  if (heroTesto) heroTesto.textContent = `Scopri i locali di ${cittaCorrente}, guarda le vibe e trova le prossime serate.`;

  if (aggiornaUrl) {
    const params = new URLSearchParams(window.location.search);
    params.set("citta", cittaCorrente);
    history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }

  aggiornaLinkCitta();
}

async function caricaLocali(citta = cittaCorrente) {
  impostaCittaCorrente(citta);

  const { data, error } = await supabaseClient
    .from("locali")
    .select("*")
    .eq("citta", cittaCorrente)
    .order("nome", { ascending: true });

  if (error) {
    console.error(error);
    document.getElementById("locali-container").innerHTML = `
      <p class="empty-state">Errore nel caricamento dei locali.</p>
    `;
    return;
  }

  locali = data || [];
  mostraLocali();
}

function mostraLocali() {
  const container = document.getElementById("locali-container");

  const localiFiltrati = categoriaCorrente === "tutti"
    ? locali
    : locali.filter(l => l.categoria === categoriaCorrente);

  if (localiFiltrati.length === 0) {
    container.innerHTML = `
      <p class="empty-state">Nessun locale trovato per questa città .</p>
    `;
    return;
  }

  container.innerHTML = localiFiltrati.map(creaCardLocale).join("");
  lucide.createIcons();
}

function creaCardLocale(locale) {
  const img = locale.immagine || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900";

  return `
    <article class="locale-card">
      <div class="locale-img" style="background-image:url('${img}')"></div>

      <div class="locale-body">
        <div class="tipo">${locale.categoria || "Locale"}</div>
        <h3>${locale.nome}</h3>

        <p class="locale-indirizzo">
          <i data-lucide="map-pin"></i>
          ${locale.indirizzo || locale.citta || ""}
        </p>

        <p class="locale-descrizione">
          ${locale.descrizione || "Descrizione non ancora disponibile."}
        </p>

        <div class="locale-social">
          ${locale.instagram_url ? `<a href="${locale.instagram_url}" target="_blank">Instagram</a>` : ""}
          ${locale.tiktok_url ? `<a href="${locale.tiktok_url}" target="_blank">TikTok</a>` : ""}
          ${locale.sito_url ? `<a href="${locale.sito_url}" target="_blank">Sito</a>` : ""}
        </div>
      </div>
    </article>
  `;
}

document.querySelectorAll(".locale-filtro").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".locale-filtro").forEach(b => b.classList.remove("attivo"));
    btn.classList.add("attivo");

    categoriaCorrente = btn.dataset.categoria;
    mostraLocali();
  });
});

document.getElementById("btn-citta-locali").addEventListener("click", cercaCittaLocali);

document.getElementById("input-citta-locali").addEventListener("keydown", e => {
  if (e.key === "Enter") cercaCittaLocali();
});

function cercaCittaLocali() {
  const citta = document.getElementById("input-citta-locali").value.trim();
  if (!citta) return;

  caricaLocali(normalizzaCitta(citta));
}

impostaCittaCorrente(cittaCorrente, false);
caricaLocali(cittaCorrente);
