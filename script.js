// Configuration
const BASE_URL = 'https://n8n-automation-server-waz-production.up.railway.app/webhook-test/vaccination';

// Vérifie si connecté à Internet
function estEnLigne() {
  return navigator.onLine;
}

// Affiche un message de statut sous un élément
function afficherMessage(id, texte, type = 'success') {
  const el = document.getElementById(id);
  if (el) {
    el.innerHTML = `<p class="${type}">${texte}</p>`;
  }
}

// 🔁 Synchronise les données stockées localement dès qu'on est en ligne
function synchroniserDonnees() {
  if (!estEnLigne()) return;

  // Enfants à enregistrer
  const enfants = JSON.parse(localStorage.getItem('enfants_offline') || '[]');
  enfants.forEach((enfant, index) => {
    fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enfant)
    })
    .then(() => {
      enfants.splice(index, 1);
      localStorage.setItem('enfants_offline', JSON.stringify(enfants));
    });
  });

  // Vaccins à marquer comme faits
  const vaccins = JSON.parse(localStorage.getItem('vaccins_offline') || '[]');
  vaccins.forEach((id, index) => {
    fetch(`${BASE_URL}/marquer-vaccin-fait`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    .then(() => {
      vaccins.splice(index, 1);
      localStorage.setItem('vaccins_offline', JSON.stringify(vaccins));
    });
  });
}

const form = document.getElementById('form-enfant');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    if (estEnLigne()) {
      fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(() => {
        afficherMessage('message-form', '✅ Enregistrement réussi', 'success');
        form.reset();
      })
      .catch(() => {
        afficherMessage('message-form', '❌ Erreur réseau. Réessayez.', 'error');
      });
    } else {
      const enfantsOffline = JSON.parse(localStorage.getItem('enfants_offline') || '[]');
      enfantsOffline.push(data);
      localStorage.setItem('enfants_offline', JSON.stringify(enfantsOffline));
      afficherMessage('message-form', '❌ Mode hors-ligne – données sauvegardées', 'error');
      form.reset();
    }
  });
}

const vaccinsJourDiv = document.getElementById('vaccins-jour');
if (vaccinsJourDiv) {
  fetch(`${BASE_URL}/vaccins-prevus-aujourdhui`)
    .then(res => res.json())
    .then(vaccins => {
      vaccinsJourDiv.innerHTML = '';
      if (vaccins.length === 0) {
        vaccinsJourDiv.innerHTML = '<p>Aucun vaccin prévu aujourd’hui.</p>';
      } else {
        vaccins.forEach(v => {
          const bloc = document.createElement('div');
          bloc.className = 'carte';
          bloc.innerHTML = `
            <p><strong>${v.nom_enfant}</strong> – ${v.nom_vaccin}</p>
            <p>Date prévue : ${v.date_prevue}</p>
            <button class="btn btn-primary" data-id="${v.id}">✅ Marquer comme fait</button>
          `;
          vaccinsJourDiv.appendChild(bloc);
        });

        document.querySelectorAll('[data-id]').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            if (estEnLigne()) {
              fetch(`${BASE_URL}/marquer-vaccin-fait`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
              }).then(() => {
                btn.parentElement.remove();
              });
            } else {
              const vaccinsOffline = JSON.parse(localStorage.getItem('vaccins_offline') || '[]');
              vaccinsOffline.push(id);
              localStorage.setItem('vaccins_offline', JSON.stringify(vaccinsOffline));
              btn.parentElement.remove();
            }
          });
        });
      }
    });
}

// Le reste du code (statistiques superviseur, grossesse) peut aussi être adapté à BASE_URL si les routes existent





