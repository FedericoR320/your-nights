(async function () {
  const SUPABASE_URL = "https://bwwvmfrwrbaklhhrfpca.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d3ZtZnJ3cmJha2xoaHJmcGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzc2NTcsImV4cCI6MjA5NTY1MzY1N30.7FQtKrxYBfZw8gnTFbPOGRdb73OlSxxH6cA-ED85uP0";

  if (!window.supabase) return;

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const params = new URLSearchParams(window.location.search);
  const cittaCorrente = params.get("citta") || localStorage.getItem("yn_citta") || "Torino";

  document.querySelectorAll('a[href^="index.html"], a[href^="locali.html"], a[href^="account.html"]').forEach(link => {
    const href = link.getAttribute("href") || "";
    const [page, queryString = ""] = href.split("?");
    const linkParams = new URLSearchParams(queryString);
    linkParams.set("citta", cittaCorrente);
    link.href = `${page}?${linkParams.toString()}`;
  });

  const { data } = await client.auth.getSession();
  const logged = !!data.session;

  const navAccedi = document.getElementById("nav-accedi");
  const btnNotifiche = document.getElementById("btn-notifiche");
  const avatarLink = document.getElementById("avatar-link");
  const navCalendario = document.querySelector(".nav-calendario");

  if (navAccedi) navAccedi.style.display = logged ? "none" : "inline-flex";
  if (btnNotifiche) btnNotifiche.style.display = logged ? "inline-flex" : "none";
  if (avatarLink) avatarLink.style.display = logged ? "inline-flex" : "none";
  if (navCalendario) navCalendario.style.display = logged ? "inline-flex" : "none";

  if (logged) {
    const user = data.session.user;
    const { data: profilo } = await client
      .from("profili")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (profilo?.avatar_url) {
      const avatar = document.getElementById("avatar");
      if (avatar) {
        avatar.innerHTML = `<img src="${profilo.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
      }
    }
  }

  lucide.createIcons();
})();
