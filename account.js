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

  // Per ora mostra empty state — implementare con tabella eventi_salvati
  container.innerHTML = `<p class="empty-state">Non hai ancora salvato nessuna serata.<br>Esplora la mappa e salva quelle che ti interessano.</p>`;
  statSalvate.textContent = "0";
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

controllaSessione();