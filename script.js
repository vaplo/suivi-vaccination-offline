// 🌍 Webhooks n8n
const webhookEnfant = "https://n8n-automation-server-waz-production.up.railway.app/webhook-test/register-child";
const webhookGrossesse = "https://n8n-automation-server-waz-production.up.railway.app/webhook-test/register-pregnancy";
const webhookVaccins = "https://n8n-automation-server-waz-production.up.railway.app/webhook-test/vaccins-prevus-aujourdhui";
const webhookMarquerFait = "https://n8n-automation-server-waz-production.up.railway.app/webhook-test/marquer-vaccin-fait";

// 📶 Vérifie si connecté
function estEnLigne() {
  return navigator.onLine;
}

// 🔔 Notification visuelle
function afficherNotification(message) {
  const notif = document.createElement("div");
  notif.textContent = message;
  notif.style.position = "fixed";
  notif.style.bottom = "20px";
  notif.style.right = "20px";
  notif.style.backgroundColor = "#16a085";
  notif.style.color = "white";
  notif.style.padding = "10px 15px";
  notif.style.borderRadius = "8px";
  notif.style.zIndex = 1000;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

// ✅ Affiche message texte
function afficherMessage(id, texte, type = 'success') {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<p class="${type}">${texte}</p>`;
}

// 🔁 Synchronise les enfants offline
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
      afficherNotification("👶 Enfant synchronisé");
    });
  });
}

// 🔁 Synchronise les grossesses offline
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
      afficherNotification("🤰 Grossesse synchronisée");
    });
  });
}

// 🔁 Synchronisation globale
function synchroniserDonnees() {
  if (!estEnLigne()) return;
  synchroniserEnfants();
  synchroniserGrossesses();
}

// 🔁 Toutes les 15 secondes
setInterval(synchroniserDonnees, 15000);

// 🚼 Enregistrement Enfant
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
      afficherMessage("message-form", "📴 Données offline", "error");
      formEnfant.reset();
    }
  });
}

// 🤰 Enregistrement Grossesse
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
      afficherMessage("message-form-grossesse", "📴 Données offline", "error");
      formGrossesse.reset();
    }
  });
}

// 📅 Vaccins du jour
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
            <button class="btn" onclick="marquerCommeFait(${v.id})">✅ Fait</button>
          `;
          divVaccins.appendChild(bloc);
        });
      }
    })
    .catch(() => {
      divVaccins.innerHTML = "<p class='error'>Erreur de chargement.</p>";
    });
}

// ✅ Marquer un vaccin comme administré
function marquerCommeFait(id) {
  fetch(webhookMarquerFait, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id })
  })
  .then(() => {
    afficherNotification("💉 Vaccin marqué comme fait");
    setTimeout(() => location.reload(), 1000);
  })
  .catch(() => {
    afficherNotification("❌ Erreur lors du marquage");
  });
}

// 🚀 Démarrage
window.addEventListener("load", synchroniserDonnees);







