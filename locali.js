const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "LA_TUA_ANON_KEY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let locali = [];
let cittaCorrente = "Torino";
let categoriaCorrente = "tutti";

async function caricaLocali(citta = "Torino") {
  cittaCorrente = citta;

  const { data, error } = await supabaseClient
    .from("locali")
    .select("*")
    .eq("citta", citta)
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
      <p class="empty-state">Nessun locale trovato per questa città.</p>
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

  const cittaFormattata = citta.charAt(0).toUpperCase() + citta.slice(1).toLowerCase();
  caricaLocali(cittaFormattata);
}

caricaLocali("Torino");