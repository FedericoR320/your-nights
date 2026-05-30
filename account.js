// CONFIGURAZIONE SUPABASE
const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXMiLCJyZWYiOiJid3d2bWZyd3JiYWtsaGhocmZwY2EiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4MDA3NzY1NywiZXhwIjoyMDk1NjUzNjV9.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ELEMENTI HTML
const authSection = document.getElementById("auth-section");
const profileSection = document.getElementById("profile-section");

const tabLogin = document.getElementById("tab-login");
const tabRegister = document.getElementById("tab-register");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginMessage = document.getElementById("login-message");

const registerUsername = document.getElementById("register-username");
const registerEmail = document.getElementById("register-email");
const registerPassword = document.getElementById("register-password");
const registerMessage = document.getElementById("register-message");

const profileUsername = document.getElementById("profile-username");
const profileEmail = document.getElementById("profile-email");

const btnLogin = document.getElementById("btn-login");
const btnRegister = document.getElementById("btn-register");
const btnLogout = document.getElementById("btn-logout");

// CAMBIO TAB
tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");

  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
});

tabRegister.addEventListener("click", () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");

  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

// REGISTRAZIONE
btnRegister.addEventListener("click", async () => {
  const username = registerUsername.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value.trim();

  registerMessage.textContent = "";

  if (!username || !email || !password) {
    registerMessage.textContent = "Compila tutti i campi.";
    return;
  }

  if (password.length < 6) {
    registerMessage.textContent = "La password deve avere almeno 6 caratteri.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) {
    registerMessage.textContent = error.message;
    return;
  }

  const user = data.user;

  if (!user) {
    registerMessage.textContent = "Registrazione non completata.";
    return;
  }

  const { error: profileError } = await supabaseClient
    .from("profili")
    .insert({
      id: user.id,
      username: username
    });

  if (profileError) {
    registerMessage.textContent = "Account creato, ma errore nel salvataggio username.";
    console.error(profileError);
    return;
  }

  registerMessage.textContent = "Account creato. Ora accedi.";
  
  tabLogin.click();
  loginEmail.value = email;
});

// LOGIN
btnLogin.addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  loginMessage.textContent = "";

  if (!email || !password) {
    loginMessage.textContent = "Inserisci email e password.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMessage.textContent = "Email o password errati.";
    return;
  }

  await mostraAccount(data.user);
});

// MOSTRA ACCOUNT
async function mostraAccount(user) {
  if (!user) return;

  const { data: profilo, error } = await supabaseClient
    .from("profili")
    .select("username")
    .eq("id", user.id)
    .single();

  if (error || !profilo) {
    profileUsername.textContent = "Ciao";
  } else {
    profileUsername.textContent = `Ciao, ${profilo.username}`;
  }

  profileEmail.textContent = user.email;

  authSection.classList.add("hidden");
  profileSection.classList.remove("hidden");
}

// LOGOUT
btnLogout.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();

  profileSection.classList.add("hidden");
  authSection.classList.remove("hidden");

  loginEmail.value = "";
  loginPassword.value = "";
});

// CONTROLLO SESSIONE GIÀ ATTIVA
async function controllaSessione() {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    await mostraAccount(data.session.user);
  }
}

controllaSessione();