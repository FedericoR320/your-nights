const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let utenteCorrente = null;
let eventiSalvatiCache = [];

let meseAcc = new Date().getMonth();
let annoAcc = new Date().getFullYear();

let mappaAccount = null;
let markerAccount = [];

const mesiNomiAcc = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

const giorniNomiAcc = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

function el(id) {
  return document.getElementById(id);
}

function mostraBox(nome) {
  el("box-login").style.display = nome === "login" ? "flex" : "none";
  el("box-registrazione").style.display = nome === "registrazione" ? "flex" : "none";
  el("box-recupera").style.display = nome === "recupera" ? "flex" : "none";
}

function mostraVista(nomeVista) {
  el("vista-salvate").style.display = nomeVista === "salvate" ? "block" : "none";
  el("vista-cal-account").style.display = nomeVista === "calendario" ? "block" : "none";
  el("vista-mappa-account").style.display = nomeVista === "mappa" ? "block" : "none";

  el("btn-sidebar-salvate").classList.toggle("attiva", nomeVista === "salvate");
  el("btn-sidebar-calendario").classList.toggle("attiva", nomeVista === "calendario");
  el("btn-sidebar-mappa").classList.toggle("attiva", nomeVista === "mappa");

  if (nomeVista === "calendario") {
    renderCalendarioAccount();
  }

  if (nomeVista === "mappa") {
    setTimeout(() => {
      renderMappaAccount();
    }, 150);
  }
}

async function registrati() {
  const username = el("reg-username").value.trim();
  const email = el("reg-email").value.trim();
  const password = el("reg-password").value.trim();
  const msg = el("reg-messaggio");

  msg.textContent = "";

  if (!username || !email || !password) {
    msg.textContent = "Compila tutti i campi.";
    return;
  }

  if (password.length < 6) {
    msg.textContent = "La password deve avere almeno 6 caratteri.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) {
    msg.textContent = error.message;
    return;
  }

  const user = data.user;

  if (!user) {
    msg.textContent = "Registrazione non completata.";
    return;
  }

  const { error: profiloError } = await supabaseClient
    .from("profili")
    .upsert({
      id: user.id,
      username: username
    });

  if (profiloError) {
    console.error(profiloError);
    msg.textContent = "Account creato, ma errore nel salvataggio username.";
    return;
  }

  el("auth-email").value = email;
  el("auth-messaggio").textContent = "Account creato. Ora accedi.";
  mostraBox("login");
}

async function login() {
  const email = el("auth-email").value.trim();
  const password = el("auth-password").value.trim();
  const msg = el("auth-messaggio");

  msg.textContent = "";

  if (!email || !password) {
    msg.textContent = "Inserisci email e password.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    msg.textContent = "Email o password errati.";
    return;
  }

  await mostraProfilo(data.user);
}

async function recuperaPassword() {
  const email = el("recupera-email").value.trim();
  const msg = el("recupera-messaggio");

  msg.textContent = "";

  if (!email) {
    msg.textContent = "Inserisci la tua email.";
    return;
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: "https://your-nights.vercel.app/account.html"
  });

  if (error) {
    msg.textContent = "Errore nell'invio. Riprova.";
    return;
  }

  msg.textContent = "Email inviata. Controlla la tua casella.";
}

async function mostraProfilo(user) {
  utenteCorrente = user;

  const { data: profilo, error } = await supabaseClient
    .from("profili")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  if (error) {
    console.warn("Profilo non trovato:", error);
  }

  const username = profilo?.username || user.email.split("@")[0];

  el("profile-username").textContent = username;
  el("profile-email").textContent = user.email;

  el("btn-notifiche").style.display = "inline-flex";
  el("avatar-link").style.display = "inline-flex";

  if (profilo?.avatar_url) {
    mostraAvatar(profilo.avatar_url);
  }

  el("sezione-auth").style.display = "none";
  el("sezione-profilo").style.display = "block";

  await caricaEventiSalvati(user.id);
  mostraVista("salvate");

  lucide.createIcons();
}

function mostraAvatar(url) {
  el("avatar-emoji").style.display = "none";

  const img = el("profile-avatar-img");
  img.src = url;
  img.style.display = "block";

  el("avatar").innerHTML = `
    <img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />
  `;
}

async function caricaEventiSalvati(userId) {
  const container = el("saved-events-container");
  const statSalvate = el("stat-salvate");

  const { data: salvati, error } = await supabaseClient
    .from("eventi_salvati")
    .select("evento_id")
    .eq("user_id", userId);

  if (error) {
    console.error(error);
    container.innerHTML = `<p class="empty-state">Errore nel caricamento delle serate salvate.</p>`;
    statSalvate.textContent = "0";
    return;
  }

  if (!salvati || salvati.length === 0) {
    eventiSalvatiCache = [];
    container.innerHTML = `
      <p class="empty-state">
        Non hai ancora salvato nessuna serata.<br>
        Esplora la mappa e salva quelle che ti interessano.
      </p>
    `;
    statSalvate.textContent = "0";
    return;
  }

  const ids = salvati.map(s => s.evento_id);

  const { data: eventi, error: eventiError } = await supabaseClient
    .from("Eventi")
    .select("*")
    .in("id", ids);

  if (eventiError) {
    console.error(eventiError);
    container.innerHTML = `<p class="empty-state">Errore nel caricamento degli eventi.</p>`;
    statSalvate.textContent = "0";
    return;
  }

  eventiSalvatiCache = eventi || [];
  statSalvate.textContent = eventiSalvatiCache.length;

  renderListaSalvati();
}

function renderListaSalvati() {
  const container = el("saved-events-container");

  if (eventiSalvatiCache.length === 0) {
    container.innerHTML = `
      <p class="empty-state">
        Non hai ancora salvato nessuna serata.<br>
        Esplora la mappa e salva quelle che ti interessano.
      </p>
    `;
    return;
  }

  container.innerHTML = eventiSalvatiCache.map(creaCardAccount).join("");

  document.querySelectorAll(".btn-rimuovi-salvato").forEach(btn => {
    btn.addEventListener("click", async e => {
      e.stopPropagation();
      const eventoId = Number(btn.dataset.eventoId);
      await rimuoviEvento(eventoId);
    });
  });

  lucide.createIcons();
}

function creaCardAccount(e) {
  const imgUrl = e.immagine || "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800";

  return `
    <div class="card" style="position:relative">
      <div class="card-img" style="background-image:url('${imgUrl}')" onclick="window.location.href='evento.html?id=${e.id}'">
        <div class="card-img-overlay"></div>
        <button class="btn-salva salvato btn-rimuovi-salvato" data-evento-id="${e.id}" title="Rimuovi">
          <span class="salva-label">Rimuovi</span>
          <i data-lucide="bookmark"></i>
        </button>
      </div>

      <div class="card-body" onclick="window.location.href='evento.html?id=${e.id}'">
        <div class="tipo">${e.tipo || ""}</div>
        <h3>${e.nome || "Evento senza nome"}</h3>
        <div class="dettagli">
          <span><i data-lucide="map-pin"></i> ${e.locale || ""}</span>
          <span><i data-lucide="clock"></i> ${e.orario || ""}</span>
          <span><i data-lucide="euro"></i> ${e.prezzo || ""}</span>
        </div>
      </div>
    </div>
  `;
}

async function rimuoviEvento(eventoId) {
  if (!utenteCorrente) return;

  const { error } = await supabaseClient
    .from("eventi_salvati")
    .delete()
    .eq("user_id", utenteCorrente.id)
    .eq("evento_id", eventoId);

  if (error) {
    console.error(error);
    alert("Errore nella rimozione dell'evento.");
    return;
  }

  eventiSalvatiCache = eventiSalvatiCache.filter(e => e.id !== eventoId);
  el("stat-salvate").textContent = eventiSalvatiCache.length;

  renderListaSalvati();

  if (el("vista-cal-account").style.display !== "none") {
    renderCalendarioAccount();
  }

  if (el("vista-mappa-account").style.display !== "none") {
    renderMappaAccount();
  }
}

function renderCalendarioAccount() {
  const griglia = el("cal-griglia-account");
  const titolo = el("cal-titolo");

  titolo.textContent = `${mesiNomiAcc[meseAcc]} ${annoAcc}`;
  griglia.innerHTML = "";

  giorniNomiAcc.forEach(giorno => {
    const cella = document.createElement("div");
    cella.className = "cal-intestazione";
    cella.textContent = giorno;
    griglia.appendChild(cella);
  });

  const primoGiorno = new Date(annoAcc, meseAcc, 1).getDay();
  const offset = primoGiorno === 0 ? 6 : primoGiorno - 1;
  const giorniNelMese = new Date(annoAcc, meseAcc + 1, 0).getDate();

  for (let i = 0; i < offset; i++) {
    const vuoto = document.createElement("div");
    vuoto.className = "cal-giorno vuoto";
    griglia.appendChild(vuoto);
  }

  for (let giorno = 1; giorno <= giorniNelMese; giorno++) {
    const dataStr = `${annoAcc}-${String(meseAcc + 1).padStart(2, "0")}-${String(giorno).padStart(2, "0")}`;
    const eventiDelGiorno = eventiSalvatiCache.filter(e => e.data === dataStr);

    const cella = document.createElement("div");
    cella.className = "cal-giorno" + (eventiDelGiorno.length > 0 ? " ha-eventi" : "");
    cella.innerHTML = giorno + (eventiDelGiorno.length > 0 ? `<div class="punto"></div>` : "");

    if (eventiDelGiorno.length > 0) {
      cella.addEventListener("click", () => {
        el("cal-giorno-titolo").textContent = `Eventi del ${giorno} ${mesiNomiAcc[meseAcc]}`;
        el("cal-giorno-container").innerHTML = eventiDelGiorno.map(creaCardAccount).join("");

        document.querySelectorAll(".btn-rimuovi-salvato").forEach(btn => {
          btn.addEventListener("click", async e => {
            e.stopPropagation();
            const eventoId = Number(btn.dataset.eventoId);
            await rimuoviEvento(eventoId);
          });
        });

        lucide.createIcons();
      });
    }

    griglia.appendChild(cella);
  }
}

function renderMappaAccount() {
  const eventiConCoordinate = eventiSalvatiCache.filter(e => e.lat && e.lng);

  if (!mappaAccount) {
    mappaAccount = L.map("mappa-account").setView([45.0703, 7.6869], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(mappaAccount);
  }

  markerAccount.forEach(marker => mappaAccount.removeLayer(marker));
  markerAccount = [];

  if (eventiConCoordinate.length === 0) {
    mappaAccount.setView([45.0703, 7.6869], 13);
    setTimeout(() => mappaAccount.invalidateSize(), 100);
    return;
  }

  eventiConCoordinate.forEach(evento => {
    const marker = L.marker([evento.lat, evento.lng])
      .addTo(mappaAccount)
      .bindPopup(`
        <strong>${evento.nome}</strong><br>
        ${evento.locale || ""}<br>
        🕐 ${evento.orario || ""}<br>
        💶 ${evento.prezzo || ""}<br>
        <a href="evento.html?id=${evento.id}" style="color:#e63946;">Vedi dettagli →</a>
      `);

    markerAccount.push(marker);
  });

  const gruppo = L.featureGroup(markerAccount);
  mappaAccount.fitBounds(gruppo.getBounds().pad(0.2));

  setTimeout(() => mappaAccount.invalidateSize(), 100);
}

async function uploadAvatar(e) {
  const file = e.target.files[0];
  if (!file || !utenteCorrente) return;

  const ext = file.name.split(".").pop();
  const path = `avatars/${utenteCorrente.id}.${ext}`;

  const { error: uploadError } = await supabaseClient.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) {
    console.error(uploadError);
    alert("Errore upload foto. Controlla che il bucket 'avatars' esista su Supabase.");
    return;
  }

  const { data } = supabaseClient.storage
    .from("avatars")
    .getPublicUrl(path);

  const avatarUrl = data.publicUrl;

  const { error: updateError } = await supabaseClient
    .from("profili")
    .update({ avatar_url: avatarUrl })
    .eq("id", utenteCorrente.id);

  if (updateError) {
    console.error(updateError);
    alert("Foto caricata, ma errore nel salvataggio profilo.");
    return;
  }

  mostraAvatar(avatarUrl);
}

async function logout() {
  await supabaseClient.auth.signOut();

  utenteCorrente = null;
  eventiSalvatiCache = [];

  el("btn-notifiche").style.display = "none";
  el("avatar-link").style.display = "none";

  el("sezione-profilo").style.display = "none";
  el("sezione-auth").style.display = "block";

  mostraBox("login");

  el("auth-email").value = "";
  el("auth-password").value = "";
}

function setupEventListeners() {
  el("link-a-registrazione").addEventListener("click", () => mostraBox("registrazione"));
  el("link-a-login").addEventListener("click", () => mostraBox("login"));
  el("link-recupera").addEventListener("click", () => mostraBox("recupera"));
  el("link-torna-login").addEventListener("click", () => mostraBox("login"));

  el("btn-login").addEventListener("click", login);
  el("btn-registrati").addEventListener("click", registrati);
  el("btn-recupera").addEventListener("click", recuperaPassword);
  el("btn-logout").addEventListener("click", logout);

  el("btn-sidebar-salvate").addEventListener("click", () => mostraVista("salvate"));
  el("btn-sidebar-calendario").addEventListener("click", () => mostraVista("calendario"));
  el("btn-sidebar-mappa").addEventListener("click", () => mostraVista("mappa"));

  el("cal-prec").addEventListener("click", () => {
    meseAcc--;
    if (meseAcc < 0) {
      meseAcc = 11;
      annoAcc--;
    }
    renderCalendarioAccount();
  });

  el("cal-succ").addEventListener("click", () => {
    meseAcc++;
    if (meseAcc > 11) {
      meseAcc = 0;
      annoAcc++;
    }
    renderCalendarioAccount();
  });

  el("profile-avatar-btn").addEventListener("click", () => {
    el("input-foto").click();
  });

  el("input-foto").addEventListener("change", uploadAvatar);

  el("btn-citta-account").addEventListener("click", vaiAllaCitta);
  el("input-citta-account").addEventListener("keydown", e => {
    if (e.key === "Enter") vaiAllaCitta();
  });

  el("btn-impostazioni").addEventListener("click", () => {
    alert("Impostazioni in arrivo.");
  });

  el("btn-privacy").addEventListener("click", () => {
    alert("Privacy in arrivo.");
  });
}

function vaiAllaCitta() {
  const citta = el("input-citta-account").value.trim();
  if (!citta) return;
  window.location.href = `index.html?citta=${encodeURIComponent(citta)}`;
}

async function controllaSessione() {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    await mostraProfilo(data.session.user);
  } else {
    el("sezione-auth").style.display = "block";
    el("sezione-profilo").style.display = "none";
    el("btn-notifiche").style.display = "none";
    el("avatar-link").style.display = "none";
    mostraBox("login");
  }
}

setupEventListeners();
controllaSessione();