const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ELEMENTI AUTH
const sezioneAuth = document.getElementById("sezione-auth");
const sezioneProfilo = document.getElementById("sezione-profilo");
const boxLogin = document.getElementById("box-login");
const boxRegistrazione = document.getElementById("box-registrazione");
const boxRecupera = document.getElementById("box-recupera");

// SWITCH TRA FORM
document.getElementById("link-a-registrazione").addEventListener("click", () => {
  boxLogin.style.display = "none";
  boxRegistrazione.style.display = "flex";
});
document.getElementById("link-a-login").addEventListener("click", () => {
  boxRegistrazione.style.display = "none";
  boxLogin.style.display = "flex";
});
document.getElementById("link-recupera").addEventListener("click", () => {
  boxLogin.style.display = "none";
  boxRecupera.style.display = "flex";
});
document.getElementById("link-torna-login").addEventListener("click", () => {
  boxRecupera.style.display = "none";
  boxLogin.style.display = "flex";
});

// LOGIN
document.getElementById("btn-login").addEventListener("click", async () => {
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value.trim();
  const msg = document.getElementById("auth-messaggio");
  msg.textContent = "";

  if (!email || !password) { msg.textContent = "Inserisci email e password."; return; }

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) { msg.textContent = "Email o password errati."; return; }
  await mostraProfilo(data.user);
});

// REGISTRAZIONE
document.getElementById("btn-registrati").addEventListener("click", async () => {
  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value.trim();
  const msg = document.getElementById("reg-messaggio");
  msg.textContent = "";

  if (!username || !email || !password) { msg.textContent = "Compila tutti i campi."; return; }
  if (password.length < 6) { msg.textContent = "Password minimo 6 caratteri."; return; }

  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if (error) { msg.textContent = error.message; return; }

  const user = data.user;
  if (!user) { msg.textContent = "Registrazione non completata."; return; }

  await supabaseClient.from("profili").insert({ id: user.id, username });

  boxRegistrazione.style.display = "none";
  boxLogin.style.display = "flex";
  document.getElementById("auth-email").value = email;
  document.getElementById("auth-messaggio").textContent = "Account creato! Conferma l'email poi accedi.";
});

// RECUPERA PASSWORD
document.getElementById("btn-recupera").addEventListener("click", async () => {
  const email = document.getElementById("recupera-email").value.trim();
  const msg = document.getElementById("recupera-messaggio");
  msg.textContent = "";

  if (!email) { msg.textContent = "Inserisci la tua email."; return; }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: "https://your-nights.vercel.app/account.html"
  });

  if (error) { msg.textContent = "Errore nell'invio. Riprova."; return; }
  msg.textContent = "Email inviata! Controlla la tua casella.";
});

// MOSTRA PROFILO
async function mostraProfilo(user) {
    // nascondi link mappa, mostra campanella e avatar
    document.getElementById("nav-mappa").style.display = "none";
    document.getElementById("btn-notifiche").style.display = "inline-flex";
    document.getElementById("avatar-link").style.display = "inline-flex";

    const { data: profilo } = await supabaseClient
    .from("profili")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  document.getElementById("profile-username").textContent = profilo?.username || "Utente";
  document.getElementById("profile-email").textContent = user.email;

  if (profilo?.avatar_url) {
    document.getElementById("avatar-emoji").style.display = "none";
    const img = document.getElementById("profile-avatar-img");
    img.src = profilo.avatar_url;
    img.style.display = "block";
    // Aggiorna anche avatar header
    document.getElementById("avatar").innerHTML = `<img src="${profilo.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
  }

  sezioneAuth.style.display = "none";
  sezioneProfilo.style.display = "block";

  caricaEventiSalvati(user.id);
}

// CARICA EVENTI SALVATI
async function caricaEventiSalvati(userId) {
  const container = document.getElementById("saved-events-container");
  const statSalvate = document.getElementById("stat-salvate");

  const { data: salvati, error } = await supabaseClient
    .from("eventi_salvati")
    .select("evento_id")
    .eq("user_id", userId);

  if (error || !salvati || salvati.length === 0) {
    container.innerHTML = `<p class="empty-state">Non hai ancora salvato nessuna serata.<br>Esplora la mappa e salva quelle che ti interessano.</p>`;
    statSalvate.textContent = "0";
    return;
  }

  const ids = salvati.map(s => s.evento_id);
  const { data: eventi } = await supabaseClient
    .from("Eventi")
    .select("*")
    .in("id", ids);

  statSalvate.textContent = eventi.length;

  container.innerHTML = eventi.map(e => `
    <div class="card" style="position:relative">
      <div class="card-img" style="background-image:url('${e.immagine || ''}'); position:relative;">
        <div class="card-img-overlay"></div>
        <button class="btn-salva salvato" data-evento-id="${e.id}" title="Rimuovi" style="position:absolute; top:10px; right:10px; z-index:10;">
          <span class="salva-label">Rimuovi</span>
          <i data-lucide="bookmark"></i>
        </button>
      </div>
      <div class="card-body" data-href="evento.html?id=${e.id}" style="cursor:pointer">
        <div class="tipo">${e.tipo}</div>
        <h3>${e.nome}</h3>
        <div class="dettagli">
          <span>📍 ${e.locale}</span>
          <span>🕐 ${e.orario}</span>
          <span>💶 ${e.prezzo}</span>
        </div>
      </div>
    </div>
  `).join("");

  lucide.createIcons();

  document.querySelectorAll(".btn-salva").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      rimuoviEvento(parseInt(btn.dataset.eventoId), btn);
    });
  });

  document.querySelectorAll(".card-body[data-href]").forEach(body => {
    body.addEventListener("click", () => {
      window.location.href = body.dataset.href;
    });
  });

  document.querySelectorAll(".card-img").forEach(img => {
    img.addEventListener("click", (e) => {
      if (!e.target.closest(".btn-salva")) {
        const href = img.closest(".card").querySelector(".card-body[data-href]").dataset.href;
        window.location.href = href;
      }
    });
  });
}

// RIMUOVI EVENTO SALVATO
async function rimuoviEvento(eventoId, btn) {
  const { data: sessionData } = await supabaseClient.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) return;

  await supabaseClient
    .from("eventi_salvati")
    .delete()
    .eq("user_id", user.id)
    .eq("evento_id", eventoId);

  btn.closest(".card").remove();

  const statSalvate = document.getElementById("stat-salvate");
  statSalvate.textContent = parseInt(statSalvate.textContent) - 1;
}

// UPLOAD FOTO PROFILO
document.getElementById("profile-avatar-btn").addEventListener("click", () => {
  document.getElementById("input-foto").click();
});

document.getElementById("input-foto").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const { data: sessionData } = await supabaseClient.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return;

  const ext = file.name.split(".").pop();
  const path = `avatars/${user.id}.${ext}`;

  const { error: uploadError } = await supabaseClient.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) { alert("Errore upload foto."); return; }

  const { data: urlData } = supabaseClient.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = urlData.publicUrl;

  await supabaseClient.from("profili").update({ avatar_url: avatarUrl }).eq("id", user.id);

  document.getElementById("avatar-emoji").style.display = "none";
  const img = document.getElementById("profile-avatar-img");
  img.src = avatarUrl;
  img.style.display = "block";
  document.getElementById("avatar").innerHTML = `<img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
});

// LOGOUT
async function logout() {
    document.getElementById("nav-mappa").style.display = "inline";
    document.getElementById("btn-notifiche").style.display = "none";
    document.getElementById("avatar-link").style.display = "none";
    
    await supabaseClient.auth.signOut();
    sezioneProfilo.style.display = "none";
    sezioneAuth.style.display = "block";
    boxLogin.style.display = "flex";
    boxRegistrazione.style.display = "none";
}

document.getElementById("btn-logout").addEventListener("click", logout);
document.getElementById("btn-logout-sidebar").addEventListener("click", logout);

// SESSIONE ATTIVA
async function controllaSessione() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) await mostraProfilo(data.session.user);
}

// CERCA CITTÀ DALLA PAGINA ACCOUNT
const inputCittaAccount = document.getElementById("input-citta-account");
const btnCittaAccount = document.getElementById("btn-citta-account");

if (inputCittaAccount) {
  inputCittaAccount.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      window.location.href = `index.html?citta=${encodeURIComponent(inputCittaAccount.value.trim())}`;
    }
  });
  btnCittaAccount.addEventListener("click", () => {
    window.location.href = `index.html?citta=${encodeURIComponent(inputCittaAccount.value.trim())}`;
  });
}

// NAVIGAZIONE SIDEBAR ACCOUNT
document.getElementById("btn-sidebar-salvate").addEventListener("click", () => {
  document.getElementById("vista-salvate").style.display = "block";
  document.getElementById("vista-cal-account").style.display = "none";
  document.getElementById("btn-sidebar-salvate").classList.add("attiva");
  document.getElementById("btn-sidebar-calendario").classList.remove("attiva");
});

document.getElementById("btn-sidebar-calendario").addEventListener("click", () => {
  document.getElementById("vista-salvate").style.display = "none";
  document.getElementById("vista-cal-account").style.display = "block";
  document.getElementById("btn-sidebar-salvate").classList.remove("attiva");
  document.getElementById("btn-sidebar-calendario").classList.add("attiva");
  renderCalendarioAccount();
});

// CALENDARIO ACCOUNT
let meseAcc = new Date().getMonth();
let annoAcc = new Date().getFullYear();

const mesiNomiAcc = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno",
                     "Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const giorniNomiAcc = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];

async function renderCalendarioAccount() {
  const { data: sessionData } = await supabaseClient.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) return;

  // carica eventi salvati con dettagli
  const { data: salvati } = await supabaseClient
    .from("eventi_salvati")
    .select("evento_id")
    .eq("user_id", user.id);

  let eventiSalvati = [];
  if (salvati && salvati.length > 0) {
    const ids = salvati.map(s => s.evento_id);
    const { data: eventi } = await supabaseClient
      .from("Eventi")
      .select("*")
      .in("id", ids);
    eventiSalvati = eventi || [];
  }

  const griglia = document.getElementById("cal-griglia-account");
  const titolo = document.getElementById("cal-titolo");
  titolo.textContent = `${mesiNomiAcc[meseAcc]} ${annoAcc}`;
  griglia.innerHTML = "";

  giorniNomiAcc.forEach(g => {
    const el = document.createElement("div");
    el.className = "cal-intestazione";
    el.textContent = g;
    griglia.appendChild(el);
  });

  const primoGiorno = new Date(annoAcc, meseAcc, 1).getDay();
  const offset = primoGiorno === 0 ? 6 : primoGiorno - 1;
  const giorniNelMese = new Date(annoAcc, meseAcc + 1, 0).getDate();

  for (let i = 0; i < offset; i++) {
    const vuoto = document.createElement("div");
    vuoto.className = "cal-giorno vuoto";
    griglia.appendChild(vuoto);
  }

  for (let g = 1; g <= giorniNelMese; g++) {
    const dataStr = `${annoAcc}-${String(meseAcc + 1).padStart(2,"0")}-${String(g).padStart(2,"0")}`;
    const eventiDelGiorno = eventiSalvati.filter(e => e.data === dataStr);

    const cella = document.createElement("div");
    cella.className = "cal-giorno" + (eventiDelGiorno.length > 0 ? " ha-eventi" : "");
    cella.innerHTML = g + (eventiDelGiorno.length > 0 ? '<div class="punto"></div>' : "");

    if (eventiDelGiorno.length > 0) {
      cella.addEventListener("click", () => {
        document.getElementById("cal-giorno-titolo").textContent = `${g} ${mesiNomiAcc[meseAcc]}`;
        document.getElementById("cal-giorno-container").innerHTML = eventiDelGiorno.map(e => `
          <div class="card" onclick="window.location.href='evento.html?id=${e.id}'" style="cursor:pointer">
            <div class="card-img" style="background-image:url('${e.immagine || ''}')"></div>
            <div class="card-body">
              <div class="tipo">${e.tipo}</div>
              <h3>${e.nome}</h3>
              <div class="dettagli">
                <span>📍 ${e.locale}</span>
                <span>🕐 ${e.orario}</span>
                <span>💶 ${e.prezzo}</span>
              </div>
            </div>
          </div>
        `).join("");
      });
    }

    griglia.appendChild(cella);
  }
}

document.getElementById("cal-prec").addEventListener("click", () => {
  meseAcc--;
  if (meseAcc < 0) { meseAcc = 11; annoAcc--; }
  renderCalendarioAccount();
});

document.getElementById("cal-succ").addEventListener("click", () => {
  meseAcc++;
  if (meseAcc > 11) { meseAcc = 0; annoAcc++; }
  renderCalendarioAccount();
});

controllaSessione();