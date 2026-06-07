(function () {
  const LANGS = ["IT", "EN", "FR", "ES", "DE"];
  const STORAGE_KEY = "yn_lang";

  const DICT = {
    EN: {
      "Locali": "Venues",
      "Mappa": "Map",
      "Eventi": "Events",
      "Accedi": "Account",
      "Login": "Account",
      "Torna al login": "Back to account",
      "Account": "Account",
      "Calendario": "Calendar",
      "Your Nights in": "Your Nights in",
      "Scegli la citta": "Choose city",
      "Dove usciamo stasera?": "Where are we going tonight?",
      "Vai": "Go",
      "Filtra serate": "Filter nights",
      "Stasera": "Tonight",
      "Domani": "Tomorrow",
      "Weekend": "Weekend",
      "Gratis": "Free",
      "Live": "Live",
      "DJ set": "DJ set",
      "Dove sono adesso": "Use my location",
      "Locali trovati": "Venues found",
      "Caricamento locali...": "Loading venues...",
      "Your Nights locali": "Your Nights venues",
      "Vedi eventi": "See events",
      "Tutti": "All",
      "Bar": "Bars",
      "Cocktail": "Cocktail",
      "Club": "Clubs",
      "Pub": "Pubs",
      "Wine bar": "Wine bars",
      "Mappa locali": "Venue map",
      "Torna ai locali": "Back to venues",
      "Il locale": "The venue",
      "Prossimi eventi in questo locale": "Upcoming events at this venue",
      "Dove si trova": "Where it is",
      "Info locale": "Venue info",
      "Apri mappa": "Open map",
      "Sito web": "Website",
      "Chiama": "Call",
      "Condividi": "Share",
      "Torna alla mappa": "Back to map",
      "Torna agli eventi": "Back to events",
      "Descrizione": "Description",
      "Info serata": "Night info",
      "Vai al locale": "Go to venue",
      "Crea account": "Create account",
      "Salva questa serata": "Save this night"
    },
    FR: {
      "Locali": "Lieux",
      "Mappa": "Carte",
      "Eventi": "Evenements",
      "Accedi": "Compte",
      "Login": "Compte",
      "Torna al login": "Retour au compte",
      "Account": "Compte",
      "Calendario": "Calendrier",
      "Scegli la citta": "Choisir la ville",
      "Dove usciamo stasera?": "Ou sort-on ce soir ?",
      "Vai": "Aller",
      "Filtra serate": "Filtrer les soirees",
      "Stasera": "Ce soir",
      "Domani": "Demain",
      "Weekend": "Week-end",
      "Gratis": "Gratuit",
      "Live": "Live",
      "DJ set": "DJ set",
      "Dove sono adesso": "Utiliser ma position",
      "Locali trovati": "Lieux trouves",
      "Caricamento locali...": "Chargement des lieux...",
      "Your Nights locali": "Lieux Your Nights",
      "Vedi eventi": "Voir les evenements",
      "Tutti": "Tous",
      "Bar": "Bars",
      "Cocktail": "Cocktail",
      "Club": "Clubs",
      "Pub": "Pubs",
      "Wine bar": "Bars a vin",
      "Mappa locali": "Carte des lieux",
      "Torna ai locali": "Retour aux lieux",
      "Il locale": "Le lieu",
      "Prossimi eventi in questo locale": "Prochains evenements dans ce lieu",
      "Dove si trova": "Ou se trouve-t-il",
      "Info locale": "Infos lieu",
      "Apri mappa": "Ouvrir la carte",
      "Sito web": "Site web",
      "Chiama": "Appeler",
      "Condividi": "Partager",
      "Torna alla mappa": "Retour a la carte",
      "Torna agli eventi": "Retour aux evenements",
      "Descrizione": "Description",
      "Info serata": "Infos soiree",
      "Vai al locale": "Aller au lieu",
      "Crea account": "Creer un compte",
      "Salva questa serata": "Enregistrer cette soiree"
    },
    ES: {
      "Locali": "Locales",
      "Mappa": "Mapa",
      "Eventi": "Eventos",
      "Accedi": "Cuenta",
      "Login": "Cuenta",
      "Torna al login": "Volver a cuenta",
      "Account": "Cuenta",
      "Calendario": "Calendario",
      "Scegli la citta": "Elige ciudad",
      "Dove usciamo stasera?": "Donde salimos esta noche?",
      "Vai": "Ir",
      "Filtra serate": "Filtrar noches",
      "Stasera": "Esta noche",
      "Domani": "Manana",
      "Weekend": "Fin de semana",
      "Gratis": "Gratis",
      "Live": "En vivo",
      "DJ set": "DJ set",
      "Dove sono adesso": "Usar mi ubicacion",
      "Locali trovati": "Locales encontrados",
      "Caricamento locali...": "Cargando locales...",
      "Your Nights locali": "Locales Your Nights",
      "Vedi eventi": "Ver eventos",
      "Tutti": "Todos",
      "Bar": "Bares",
      "Cocktail": "Cocktail",
      "Club": "Clubs",
      "Pub": "Pubs",
      "Wine bar": "Bares de vino",
      "Mappa locali": "Mapa de locales",
      "Torna ai locali": "Volver a locales",
      "Il locale": "El local",
      "Prossimi eventi in questo locale": "Proximos eventos en este local",
      "Dove si trova": "Donde esta",
      "Info locale": "Info local",
      "Apri mappa": "Abrir mapa",
      "Sito web": "Sitio web",
      "Chiama": "Llamar",
      "Condividi": "Compartir",
      "Torna alla mappa": "Volver al mapa",
      "Torna agli eventi": "Volver a eventos",
      "Descrizione": "Descripcion",
      "Info serata": "Info noche",
      "Vai al locale": "Ir al local",
      "Crea account": "Crear cuenta",
      "Salva questa serata": "Guardar esta noche"
    },
    DE: {
      "Locali": "Locations",
      "Mappa": "Karte",
      "Eventi": "Events",
      "Accedi": "Konto",
      "Login": "Konto",
      "Torna al login": "Zuruck zum Konto",
      "Account": "Konto",
      "Calendario": "Kalender",
      "Scegli la citta": "Stadt wahlen",
      "Dove usciamo stasera?": "Wohin gehen wir heute Abend?",
      "Vai": "Los",
      "Filtra serate": "Abende filtern",
      "Stasera": "Heute Abend",
      "Domani": "Morgen",
      "Weekend": "Wochenende",
      "Gratis": "Kostenlos",
      "Live": "Live",
      "DJ set": "DJ set",
      "Dove sono adesso": "Meinen Standort nutzen",
      "Locali trovati": "Locations gefunden",
      "Caricamento locali...": "Locations werden geladen...",
      "Your Nights locali": "Your Nights Locations",
      "Vedi eventi": "Events ansehen",
      "Tutti": "Alle",
      "Bar": "Bars",
      "Cocktail": "Cocktail",
      "Club": "Clubs",
      "Pub": "Pubs",
      "Wine bar": "Weinbars",
      "Mappa locali": "Location-Karte",
      "Torna ai locali": "Zuruck zu Locations",
      "Il locale": "Die Location",
      "Prossimi eventi in questo locale": "Nachste Events in dieser Location",
      "Dove si trova": "Wo sie ist",
      "Info locale": "Location-Info",
      "Apri mappa": "Karte offnen",
      "Sito web": "Website",
      "Chiama": "Anrufen",
      "Condividi": "Teilen",
      "Torna alla mappa": "Zuruck zur Karte",
      "Torna agli eventi": "Zuruck zu Events",
      "Descrizione": "Beschreibung",
      "Info serata": "Abend-Info",
      "Vai al locale": "Zur Location",
      "Crea account": "Konto erstellen",
      "Salva questa serata": "Diesen Abend speichern"
    }
  };

  const PLACEHOLDERS = {
    "Cerca citta...": { EN: "Search city...", FR: "Chercher une ville...", ES: "Buscar ciudad...", DE: "Stadt suchen..." },
    "Cerca eventi...": { EN: "Search events...", FR: "Chercher des evenements...", ES: "Buscar eventos...", DE: "Events suchen..." },
    "Cerca locali...": { EN: "Search venues...", FR: "Chercher des lieux...", ES: "Buscar locales...", DE: "Locations suchen..." },
    "Cerca DJ set...": { EN: "Search DJ sets...", FR: "Chercher des DJ sets...", ES: "Buscar DJ sets...", DE: "DJ-Sets suchen..." },
    "Cerca live music...": { EN: "Search live music...", FR: "Chercher live music...", ES: "Buscar musica en vivo...", DE: "Live-Musik suchen..." },
    "Cerca citta": { EN: "Search city", FR: "Chercher une ville", ES: "Buscar ciudad", DE: "Stadt suchen" },
    "Cerca locale, via o categoria...": { EN: "Search venue, street or category...", FR: "Chercher lieu, rue ou categorie...", ES: "Buscar local, calle o categoria...", DE: "Location, Strasse oder Kategorie suchen..." }
  };

  function getLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (LANGS.includes(stored)) return stored;
    const browser = (navigator.language || "it").slice(0, 2).toUpperCase();
    return LANGS.includes(browser) ? browser : "IT";
  }

  function sourceFromTranslated(text) {
    const trimmed = text.trim();
    if (!trimmed) return "";
    for (const source of Object.keys(DICT.EN)) {
      if (source === trimmed) return source;
      for (const lang of Object.keys(DICT)) {
        if (DICT[lang][source] === trimmed) return source;
      }
    }
    return trimmed;
  }

  function translateText(source, lang) {
    if (lang === "IT") return source;
    if (DICT[lang]?.[source]) return DICT[lang][source];

    let output = source;
    const localPrefix = source.match(/^Locali a\s*$/);
    if (localPrefix) {
      const map = {
        EN: "Venues in ",
        FR: "Lieux a ",
        ES: "Locales en ",
        DE: "Locations in "
      };
      return map[lang] || source;
    }

    const eventCity = source.match(/^(Stasera|Serate ed eventi|Eventi e serate|Serate e eventi) a (.+)$/i);
    if (eventCity) {
      const city = eventCity[2];
      const map = {
        EN: `Events in ${city}`,
        FR: `Evenements a ${city}`,
        ES: `Eventos en ${city}`,
        DE: `Events in ${city}`
      };
      return map[lang] || source;
    }

    const cityTonight = source.match(/^Stasera a (.+)$/);
    if (cityTonight) {
      const city = cityTonight[1];
      const map = {
        EN: `Tonight in ${city}`,
        FR: `Ce soir a ${city}`,
        ES: `Esta noche en ${city}`,
        DE: `Heute Abend in ${city}`
      };
      return map[lang] || source;
    }

    const localiCity = source.match(/^Locali a (.+)$/);
    if (localiCity) {
      const city = localiCity[1];
      const map = {
        EN: `Venues in ${city}`,
        FR: `Lieux a ${city}`,
        ES: `Locales en ${city}`,
        DE: `Locations in ${city}`
      };
      return map[lang] || source;
    }

    output = output.replace("Eventi, locali e serate da scoprire stasera a", {
      EN: "Events, venues and nights to discover tonight in",
      FR: "Evenements, lieux et soirees a decouvrir ce soir a",
      ES: "Eventos, locales y noches para descubrir esta noche en",
      DE: "Events, Locations und Abende heute in"
    }[lang] || "Eventi, locali e serate da scoprire stasera a");

    output = output.replace(/Cocktail bar, pub e club di (.+) da tenere d'occhio per la prossima uscita\./, (_, city) => ({
      EN: `Cocktail bars, pubs and clubs in ${city} to keep an eye on for your next night out.`,
      FR: `Cocktail bars, pubs et clubs a ${city} a suivre pour votre prochaine sortie.`,
      ES: `Cocktail bars, pubs y clubs en ${city} para tu proxima salida.`,
      DE: `Cocktailbars, Pubs und Clubs in ${city} fur deinen nachsten Abend.`
    }[lang] || source));

    output = output.replace("Cocktail bar, pub e club da tenere d'occhio per la prossima uscita.", {
      EN: "Cocktail bars, pubs and clubs to keep an eye on for your next night out.",
      FR: "Cocktail bars, pubs et clubs a suivre pour votre prochaine sortie.",
      ES: "Cocktail bars, pubs y clubs para tu proxima salida.",
      DE: "Cocktailbars, Pubs und Clubs fur deinen nachsten Abend."
    }[lang] || "Cocktail bar, pub e club da tenere d'occhio per la prossima uscita.");

    return output;
  }

  function translatePlaceholder(value, lang) {
    if (lang === "IT") return value;
    const source = Object.keys(PLACEHOLDERS).find(key => {
      if (key === value) return true;
      return Object.values(PLACEHOLDERS[key]).includes(value);
    }) || value;
    return PLACEHOLDERS[source]?.[lang] || value;
  }

  function applyTranslations() {
    const lang = getLang();
    document.documentElement.lang = lang.toLowerCase();

    document.querySelectorAll("body *").forEach(el => {
      if (el.closest(".yn-lang-switcher")) return;
      if (["SCRIPT", "STYLE", "LINK", "META"].includes(el.tagName)) return;

      const translateNodeText = (text, key, setter) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const storedSource = el.dataset[key];
        const expected = storedSource ? translateText(storedSource, lang) : "";
        const source = storedSource && trimmed === expected
          ? storedSource
          : sourceFromTranslated(trimmed);
        const translated = translateText(source, lang);

        el.dataset[key] = source;
        if (translated !== trimmed) setter(text.replace(trimmed, translated));
      };

      if (el.children.length === 0) {
        translateNodeText(el.textContent, "i18nSource", value => { el.textContent = value; });
        return;
      }

      Array.from(el.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .forEach((node, index) => {
          translateNodeText(node.textContent, `i18nDirectSource${index}`, value => { node.textContent = value; });
        });
    });

    document.querySelectorAll("input[placeholder]").forEach(input => {
      const source = input.dataset.i18nPlaceholder || input.getAttribute("placeholder");
      input.dataset.i18nPlaceholder = Object.keys(PLACEHOLDERS).find(key => key === source || Object.values(PLACEHOLDERS[key]).includes(source)) || source;
      const translated = translatePlaceholder(input.dataset.i18nPlaceholder, lang);
      if (input.getAttribute("placeholder") !== translated) {
        input.setAttribute("placeholder", translated);
      }
    });

    document.querySelectorAll(".yn-lang-option").forEach(btn => {
      btn.classList.toggle("attivo", btn.dataset.lang === lang);
    });

    const select = document.querySelector(".yn-lang-select");
    if (select) select.value = lang;
  }

  function createSwitcher() {
    if (document.querySelector(".yn-lang-switcher")) return;
    const nav = document.querySelector("header nav");
    if (!nav) return;

    const wrap = document.createElement("div");
    wrap.className = "yn-lang-switcher";
    wrap.setAttribute("aria-label", "Language selector");
    wrap.innerHTML = `
      <select class="yn-lang-select" aria-label="Language">
        ${LANGS.map(lang => `<option value="${lang}">${lang}</option>`).join("")}
      </select>
    `;
    nav.appendChild(wrap);

    wrap.querySelector(".yn-lang-select").addEventListener("change", event => {
      localStorage.setItem(STORAGE_KEY, event.target.value);
      applyTranslations();
    });
  }

  function init() {
    createSwitcher();
    applyTranslations();

    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        applyTranslations();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["placeholder"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
