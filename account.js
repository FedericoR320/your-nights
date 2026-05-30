const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ELEMENTI
const boxLogin = document.getElementById("box-login");
const boxRegistrazione = document.getElementById("box-registrazione");
const boxProfilo = document.getElementById("box-profilo");

const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authMessaggio = document.getElementById("auth-messaggio");
const btnLogin = document.getElementById("btn-login");
const linkARegistrazione = document.getElementById("link-a-registrazione");

const regUsername = document.getElementById("reg-username");
const regEmail = document.getElementById("reg-email");
const regPassword = document.getElementById("reg-password");
const regMessaggio = document.getElementById("reg-messaggio");
const btnRegistrati = document.getElementById("btn-registrati");
const linkALogin = document.getElementById("link-a-login");

const profiloNome = document.getElementById("profilo-nome");
const profiloBenvenuto = document.getElementById("profilo-benvenuto");
const btnLogout = document.getElementById("btn-logout");

// SWITCH LOGIN ↔ REGISTRAZIONE
linkARegistrazione.addEventListener("click", () => {
  boxLogin.style.display = "none";
  boxRegistrazione.style.display = "flex";
});

linkALogin.addEventListener("click", () => {
  boxRegistrazione.style.display = "none";
  boxLogin.style.display = "flex";
});

// LOGIN
btnLogin.addEventListener("click", async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();
  authMessaggio.textContent = "";

  if (!email || !password) {
    authMessaggio.textContent = "Inserisci email e password.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    authMessaggio.textContent = "Email o password errati.";
    return;
  }

  await mostraProfilo(data.user);
});

// REGISTRAZIONE
btnRegistrati.addEventListener("click", async () => {
  const username = regUsername.value.trim();
  const email = regEmail.value.trim();
  const password = regPassword.value.trim();
  regMessaggio.textContent = "";

  if (!username || !email || !password) {
    regMessaggio.textContent = "Compila tutti i campi.";
    return;
  }

  if (password.length < 6) {
    regMessaggio.textContent = "La password deve avere almeno 6 caratteri.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({ email, password });

  if (error) {
    regMessaggio.textContent = error.message;
    return;
  }

  const user = data.user;
  if (!user) {
    regMessaggio.textContent = "Registrazione non completata.";
    return;
  }

  const { error: profileError } = await supabaseClient
    .from("profili")
    .insert({ id: user.id, username });

  if (profileError) {
    regMessaggio.textContent = "Account creato, ma errore nel salvataggio username.";
    return;
  }

  // Dopo registrazione vai al login con email già compilata
  boxRegistrazione.style.display = "none";
  boxLogin.style.display = "flex";
  authEmail.value = email;
  authMessaggio.textContent = "Account creato. Ora accedi.";
});

// MOSTRA PROFILO
async function mostraProfilo(user) {
  const { data: profilo } = await supabaseClient
    .from("profili")
    .select("username")
    .eq("id", user.id)
    .single();

  profiloNome.textContent = profilo?.username ? `Ciao, ${profilo.username}` : "Ciao";
  profiloBenvenuto.textContent = user.email;

  boxLogin.style.display = "none";
  boxRegistrazione.style.display = "none";
  boxProfilo.style.display = "flex";
}

// LOGOUT
btnLogout.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  boxProfilo.style.display = "none";
  boxLogin.style.display = "flex";
  authEmail.value = "";
  authPassword.value = "";
});

// CONTROLLA SESSIONE ATTIVA
async function controllaSessione() {
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    await mostraProfilo(data.session.user);
  }
}

controllaSessione();