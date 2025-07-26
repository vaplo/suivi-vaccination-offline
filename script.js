// 🧠 Config — à adapter selon ton backend
const WEBHOOKS = {
  enfant: '/webhook/enregistrement-enfant',
  grossesse: '/webhook/enregistrement-grossesse',
  vaccinAdministre: '/webhook/vaccin-administre',
};

// ⏺️ Enregistrer un formulaire
function envoyerFormulaire(idForm, type) {
  const form = document.getElementById(idForm);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    if (navigator.onLine) {
      try {
        await fetch(WEBHOOKS[type], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        alert('✅ Données envoyées avec succès !');
        form.reset();
      } catch (err) {
        sauvegarderLocalement(type, data);
        alert('⚠️ Problème d’envoi. Données stockées localement.');
      }
    } else {
      sauvegarderLocalement(type, data);
      alert('📴 Hors ligne. Données enregistrées localement.');
    }
  });
}

// 🧱 Enregistrer localement si offline
function sauvegarderLocalement(type, data) {
  const file = localStorage.getItem('queue') || '[]';
  const queue = JSON.parse(file);
  queue.push({ type, data });
  localStorage.setItem('queue', JSON.stringify(queue));
}

// 🔄 Bouton Synchronisation
document.getElementById('btn-sync')?.addEventListener('click', synchroniser);

// 🔄 Auto-sync quand la connexion revient
window.addEventListener('online', synchroniser);

// 🔁 Synchroniser les données en attente
async function synchroniser() {
  const file = localStorage.getItem('queue') || '[]';
  const queue = JSON.parse(file);
  if (queue.length === 0) {
    alert("✅ Aucune donnée à synchroniser.");
    return;
  }

  for (const item of queue) {
    try {
      await fetch(WEBHOOKS[item.type], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data)
      });
    } catch (err) {
      alert("⚠️ Erreur pendant la synchronisation.");
      return;
    }
  }

  localStorage.removeItem('queue');
  alert("✅ Données synchronisées avec succès !");
}

// 📋 Charger la liste des enfants à vacciner
async function chargerVaccinations() {
  const liste = document.getElementById('liste-vaccins');
  if (!liste) return;

  try {
    const res = await fetch('/webhook/enfants-a-vacciner');
    const enfants = await res.json();
    liste.innerHTML = '';

    enfants.forEach(enfant => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${enfant.nom}</strong> (${enfant.date_naissance}) – ${enfant.vaccin}
        <button data-id="${enfant.id}">✅ Vaccin administré</button>
      `;
      liste.appendChild(li);
    });

    liste.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (navigator.onLine) {
          await fetch(WEBHOOKS.vaccinAdministre, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          });
          btn.parentElement.remove();
        } else {
          sauvegarderLocalement('vaccinAdministre', { id });
          btn.parentElement.remove();
        }
      });
    });

  } catch {
    liste.innerHTML = '<li style="color:red;">Impossible de charger la liste.</li>';
  }
}

// 🔄 Affiche l'état de connexion
function verifierConnexion() {
  const offlineMsg = document.getElementById('offline-status');
  if (!offlineMsg) return;
  offlineMsg.textContent = navigator.onLine ? '' : '📴 Mode hors ligne activé';
}
setInterval(verifierConnexion, 1000);

// ✅ Initialisation
envoyerFormulaire('form-enfant', 'enfant');
envoyerFormulaire('form-grossesse', 'grossesse');
chargerVaccinations();
