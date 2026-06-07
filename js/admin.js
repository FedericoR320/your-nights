const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
  genova: "Genova",
};

const CONFIG = {
  eventi: {
    table: "Eventi",
    title: "Eventi",
    singular: "evento",
    order: "data",
    fields: [
      { name: "nome", label: "Nome", required: true },
      { name: "citta", label: "Citta", required: true },
      { name: "locale", label: "Locale" },
      { name: "indirizzo", label: "Indirizzo" },
      { name: "data", label: "Data", type: "date" },
      { name: "orario", label: "Orario", type: "time" },
      { name: "prezzo", label: "Prezzo" },
      { name: "tipo", label: "Tipo", type: "select", options: ["dj", "live", "jazz", "karaoke", "sport"] },
      { name: "lat", label: "Lat", type: "number", step: "any" },
      { name: "lng", label: "Lng", type: "number", step: "any" },
      { name: "immagine", label: "Immagine URL", full: true },
      { name: "descrizione", label: "Descrizione", type: "textarea", full: true },
    ],
    describe: record => [record.data, record.orario, record.locale || record.citta].filter(Boolean).join(" - "),
  },
  locali: {
    table: "locali",
    title: "Locali",
    singular: "locale",
    order: "nome",
    fields: [
      { name: "nome", label: "Nome", required: true },
      { name: "citta", label: "Citta", required: true },
      { name: "categoria", label: "Categoria", type: "select", options: ["cocktail", "bar", "pub", "club", "wine_bar", "locale"] },
      { name: "indirizzo", label: "Indirizzo" },
      { name: "opening_hours", label: "Orari" },
      { name: "telefono", label: "Telefono" },
      { name: "website", label: "Sito" },
      { name: "instagram_url", label: "Instagram" },
      { name: "lat", label: "Lat", type: "number", step: "any" },
      { name: "lng", label: "Lng", type: "number", step: "any" },
      { name: "immagine", label: "Immagine URL", full: true },
      { name: "descrizione", label: "Descrizione", type: "textarea", full: true },
    ],
    describe: record => [record.categoria, record.indirizzo || record.citta].filter(Boolean).join(" - "),
  },
};

let activeTab = "eventi";
let currentRecords = [];
let editingId = null;
let currentUser = null;

function el(id) {
  return document.getElementById(id);
}

function normalizzaCitta(citta) {
  const value = (citta || "").trim();
  if (!value) return "Torino";
  return CITY_ALIASES[value.toLowerCase()] || value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getCittaIniziale() {
  const params = new URLSearchParams(window.location.search);
  return normalizzaCitta(params.get("citta") || localStorage.getItem("yn_citta") || "Torino");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setGate(title, text, icon = "lock", action = "") {
  el("admin-gate").innerHTML = `
    <div class="admin-state-card">
      <i data-lucide="${icon}"></i>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(text)}</p>
      ${action}
    </div>
  `;
  lucide.createIcons();
}

async function isAdmin(user) {
  const { data, error } = await supabaseClient
    .from("profili")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Controllo admin non riuscito", error);
    return false;
  }

  return data?.is_admin === true;
}

function updateLinks() {
  const citta = normalizzaCitta(el("admin-city").value);
  const encoded = encodeURIComponent(citta);
  el("admin-nav-eventi").href = `index.html?citta=${encoded}`;
  el("admin-nav-locali").href = `locali.html?citta=${encoded}`;
}

function showDashboard(user) {
  currentUser = user;
  el("admin-user-pill").innerHTML = `<i data-lucide="shield-check"></i>${escapeHtml(user.email)}`;
  el("admin-gate").style.display = "none";
  el("admin-dashboard").style.display = "block";
  el("admin-city").value = getCittaIniziale();
  updateLinks();
  renderForm();
  loadRecords();
  lucide.createIcons();
}

function renderForm(record = {}) {
  const config = CONFIG[activeTab];
  editingId = record.id || null;
  el("admin-form-title").textContent = editingId ? `Modifica ${config.singular}` : `Nuovo ${config.singular}`;
  el("admin-form-status").textContent = editingId ? `Stai modificando #${editingId}.` : "Compila i campi principali e salva.";

  const fields = config.fields.map(field => {
    const value = record[field.name] ?? (field.name === "citta" ? normalizzaCitta(el("admin-city")?.value) : "");
    const common = `id="field-${field.name}" name="${field.name}" ${field.required ? "required" : ""}`;
    const label = `<label for="field-${field.name}">${field.label}</label>`;
    let control = "";

    if (field.type === "textarea") {
      control = `<textarea ${common}>${escapeHtml(value)}</textarea>`;
    } else if (field.type === "select") {
      control = `
        <select ${common}>
          <option value="">Da scegliere</option>
          ${field.options.map(option => `<option value="${option}" ${value === option ? "selected" : ""}>${option}</option>`).join("")}
        </select>
      `;
    } else {
      control = `<input ${common} type="${field.type || "text"}" value="${escapeHtml(value)}" ${field.step ? `step="${field.step}"` : ""} />`;
    }

    return `<div class="admin-field ${field.full ? "full" : ""}">${label}${control}</div>`;
  }).join("");

  el("admin-form").innerHTML = `
    ${fields}
    <div class="admin-form-actions">
      <button class="admin-btn" type="submit">
        <i data-lucide="save"></i>
        Salva
      </button>
      <button class="admin-btn secondary" type="button" id="admin-cancel">
        <i data-lucide="x"></i>
        Annulla
      </button>
    </div>
  `;

  el("admin-cancel").addEventListener("click", () => renderForm());
  lucide.createIcons();
}

function formPayload() {
  const config = CONFIG[activeTab];
  const payload = {};

  config.fields.forEach(field => {
    const input = el(`field-${field.name}`);
    if (!input) return;
    const raw = input.value.trim();

    if (field.type === "number") {
      payload[field.name] = raw === "" ? null : Number(raw);
      return;
    }

    payload[field.name] = raw || null;
  });

  if (payload.citta) {
    payload.citta = normalizzaCitta(payload.citta);
    localStorage.setItem("yn_citta", payload.citta);
    el("admin-city").value = payload.citta;
    updateLinks();
  }

  return payload;
}

async function saveRecord(event) {
  event.preventDefault();
  const config = CONFIG[activeTab];
  const payload = formPayload();
  el("admin-form-status").textContent = "Salvataggio...";

  const query = editingId
    ? supabaseClient.from(config.table).update(payload).eq("id", editingId).select("*").single()
    : supabaseClient.from(config.table).insert(payload).select("*").single();

  const { data, error } = await query;

  if (error) {
    console.error(error);
    el("admin-form-status").textContent = `Errore: ${error.message}`;
    return;
  }

  el("admin-form-status").textContent = `${config.singular} salvato.`;
  renderForm(data);
  await loadRecords();
}

async function loadRecords() {
  const config = CONFIG[activeTab];
  const citta = normalizzaCitta(el("admin-city").value);
  el("admin-city").value = citta;
  localStorage.setItem("yn_citta", citta);
  updateLinks();

  el("admin-list-title").textContent = config.title;
  el("admin-list-status").textContent = "Caricamento...";
  el("admin-records").innerHTML = "";

  let query = supabaseClient
    .from(config.table)
    .select("*")
    .ilike("citta", citta)
    .limit(40);

  query = config.order === "data"
    ? query.order("data", { ascending: false, nullsFirst: false })
    : query.order(config.order, { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error(error);
    el("admin-list-status").textContent = `Errore: ${error.message}`;
    return;
  }

  currentRecords = data || [];
  el("admin-list-status").textContent = `${currentRecords.length} record per ${citta}`;
  renderRecords();
}

function renderRecords() {
  const config = CONFIG[activeTab];

  if (currentRecords.length === 0) {
    el("admin-records").innerHTML = `<p class="empty-state">Nessun record trovato per questa citta.</p>`;
    return;
  }

  el("admin-records").innerHTML = currentRecords.map(record => `
    <article class="admin-record">
      <h3>${escapeHtml(record.nome || `Record #${record.id}`)}</h3>
      <p>${escapeHtml(config.describe(record) || record.citta || "")}</p>
      <div class="admin-record-actions">
        <button type="button" data-action="edit" data-id="${escapeHtml(record.id)}">Modifica</button>
        <button class="danger" type="button" data-action="delete" data-id="${escapeHtml(record.id)}">Elimina</button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-action='edit']").forEach(button => {
    button.addEventListener("click", () => {
      const record = currentRecords.find(item => String(item.id) === String(button.dataset.id));
      if (record) renderForm(record);
    });
  });

  document.querySelectorAll("[data-action='delete']").forEach(button => {
    button.addEventListener("click", () => deleteRecord(button.dataset.id));
  });
}

async function deleteRecord(id) {
  const config = CONFIG[activeTab];
  const record = currentRecords.find(item => String(item.id) === String(id));
  const name = record?.nome || `#${id}`;

  if (!confirm(`Eliminare ${name}?`)) return;

  const { error } = await supabaseClient
    .from(config.table)
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    el("admin-list-status").textContent = `Errore eliminazione: ${error.message}`;
    return;
  }

  if (String(editingId) === String(id)) renderForm();
  await loadRecords();
}

function setupEvents() {
  document.querySelectorAll(".admin-tab").forEach(button => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab;
      document.querySelectorAll(".admin-tab").forEach(tab => tab.classList.toggle("attiva", tab === button));
      renderForm();
      loadRecords();
    });
  });

  el("admin-refresh").addEventListener("click", loadRecords);
  el("admin-new").addEventListener("click", () => renderForm());
  el("admin-city").addEventListener("keydown", event => {
    if (event.key === "Enter") loadRecords();
  });
  el("admin-city").addEventListener("change", loadRecords);
  el("admin-form").addEventListener("submit", saveRecord);
}

async function initAdmin() {
  setupEvents();

  const { data, error } = await supabaseClient.auth.getSession();
  if (error || !data.session?.user) {
    setGate("Accesso richiesto", "Accedi con il tuo account per usare il pannello admin.", "log-in", `<a class="admin-btn" href="account.html">Vai al login</a>`);
    el("admin-user-pill").innerHTML = `<i data-lucide="lock"></i> Non connesso`;
    return;
  }

  const user = data.session.user;
  const allowed = await isAdmin(user);

  if (!allowed) {
    setGate("Accesso non autorizzato", "Questo account non ha permessi admin.", "shield-x");
    el("admin-user-pill").innerHTML = `<i data-lucide="shield-x"></i>${escapeHtml(user.email)}`;
    return;
  }

  showDashboard(user);
}

initAdmin();
