// 🌍 Webhooks n8n
const webhookEnfant = "https://n8n-automation-server-waz-production.up.railway.app/webhook-test/register-child";
const webhookGrossesse = "https://n8n-automation-server-waz-production.up.railway.app/webhook-test/register-pregnancy";
const webhookVaccins = "https://n8n-automation-server-waz-production.up.railway.app/webhook-test/vaccins-prevus-aujourdhui";

// 📶 Vérifie si connecté
function estEnLigne() {
  return navigator.onLine;
}

// ✅ Affiche message dans une zone (success ou error)
function afficherMessage(id, texte, type = 'success') {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<p class="${type}">${texte}</p>`;
}

// 🔁 Synchronise les enfants stockés offline
function synchroniserEnfants() {
  const enfants = JSON.parse(localStorage.getItem("enfants_offline") || "[]");
  if (enfants.length === 0) return;

  enfants.forEach((enfant, index) => {
    fetch(webhookEnfant, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enfant)
    }).then(() => {
      enfants.splice(index, 1);
      localStorage.setItem("enfants_offline", JSON.stringify(enfants));
      console.log("✅ Enfant synchronisé");
    });
  });
}

// 🔁 Synchronise les grossesses stockées offline
function synchroniserGrossesses() {
  const grossesses = JSON.parse(localStorage.getItem("grossesses_offline") || "[]");
  if (grossesses.length === 0) return;

  grossesses.forEach((femme, index) => {
    fetch(webhookGrossesse, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(femme)
    }).then(() => {
      grossesses.splice(index, 1);
      localStorage.setItem("grossesses_offline", JSON.stringify(grossesses));
      console.log("✅ Grossesse synchronisée");
    });
  });
}

// 🔁 Synchronisation globale (appelée au chargement)
function synchroniserDonnees() {
  if (!estEnLigne()) return;
  synchroniserEnfants();
  synchroniserGrossesses();
}

// 🚼 ENREGISTREMENT ENFANT
const formEnfant = document.getElementById("form-enfant");
if (formEnfant) {
  formEnfant.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(formEnfant).entries());

    if (estEnLigne()) {
      fetch(webhookEnfant, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(() => {
        afficherMessage("message-form", "✅ Enregistrement réussi", "success");
        formEnfant.reset();
      }).catch(() => {
        afficherMessage("message-form", "❌ Erreur réseau", "error");
      });
    } else {
      const offline = JSON.parse(localStorage.getItem("enfants_offline") || "[]");
      offline.push(data);
      localStorage.setItem("enfants_offline", JSON.stringify(offline));
      afficherMessage("message-form", "📴 Données enregistrées offline", "error");
      formEnfant.reset();
    }
  });
}

// 🤰 ENREGISTREMENT GROSSESSE
const formGrossesse = document.getElementById("form-grossesse");
if (formGrossesse) {
  formGrossesse.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(formGrossesse).entries());

    if (estEnLigne()) {
      fetch(webhookGrossesse, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(() => {
        afficherMessage("message-form-grossesse", "✅ Enregistrement réussi", "success");
        formGrossesse.reset();
      }).catch(() => {
        afficherMessage("message-form-grossesse", "❌ Erreur réseau", "error");
      });
    } else {
      const offline = JSON.parse(localStorage.getItem("grossesses_offline") || "[]");
      offline.push(data);
      localStorage.setItem("grossesses_offline", JSON.stringify(offline));
      afficherMessage("message-form-grossesse", "📴 Données enregistrées offline", "error");
      formGrossesse.reset();
    }
  });
}

// 📅 VACCINS À FAIRE AUJOURD'HUI
const divVaccins = document.getElementById("vaccins-jour");
if (divVaccins) {
  fetch(webhookVaccins)
    .then(res => res.json())
    .then(vaccins => {
      divVaccins.innerHTML = "";
      if (vaccins.length === 0) {
        divVaccins.innerHTML = "<p>Aucun vaccin prévu aujourd’hui.</p>";
      } else {
        vaccins.forEach(v => {
          const bloc = document.createElement("div");
          bloc.className = "carte";
          bloc.innerHTML = `
            <p><strong>${v.nom_enfant}</strong> – ${v.nom_vaccin}</p>
            <p>Date prévue : ${v.date_prevue}</p>
          `;
          divVaccins.appendChild(bloc);
        });
      }
    })
    .catch(() => {
      divVaccins.innerHTML = "<p class='error'>Erreur de chargement.</p>";
    });
}

// 🚀 Lancer synchro au démarrage
window.addEventListener("load", synchroniserDonnees);





