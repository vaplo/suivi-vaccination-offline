// Configuration
const BASE_URL = 'https://mon-n8n-url/webhook';

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
    fetch(`${BASE_URL}/enregistrement-enfant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enfant)
    })
    .then(() => {
      enfants.splice(index, 1); // Supprimer après envoi
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

// Enregistrement formulaire enfant
const form = document.getElementById('form-enfant');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    if (estEnLigne()) {
      fetch(`${BASE_URL}/enregistrement-enfant`, {
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
      // Hors-ligne : stockage local
      const enfantsOffline = JSON.parse(localStorage.getItem('enfants_offline') || '[]');
      enfantsOffline.push(data);
      localStorage.setItem('enfants_offline', JSON.stringify(enfantsOffline));
      afficherMessage('message-form', '❌ Mode hors-ligne – données sauvegardées', 'error');
      form.reset();
    }
  });
}

// Récupère les vaccins du jour
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

        // Gestion des clics sur "marquer comme fait"
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
              // Offline : sauvegarde
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

// Chargement des statistiques superviseur
const totalEl = document.getElementById('total-enfants');
const ajdEl = document.getElementById('vaccins-aujourdhui');
const retardEl = document.getElementById('vaccins-retard');
const filtreCentre = document.getElementById('filtre-centre');
const tbody = document.querySelector('#table-retards tbody');

if (totalEl && ajdEl && retardEl && filtreCentre) {
  fetch(`${BASE_URL}/statistiques-centre`)
    .then(res => res.json())
    .then(stats => {
      totalEl.textContent = stats.total_enfants;
      ajdEl.textContent = stats.vaccins_aujourdhui;
      retardEl.textContent = stats.vaccins_retard;
    });

  fetch(`${BASE_URL}/retards-vaccination`)
    .then(res => res.json())
    .then(retards => {
      const centres = new Set();
      tbody.innerHTML = '';

      retards.forEach(r => {
        centres.add(r.centre_sante);
        const tr = document.createElement('tr');
        tr.dataset.centre = r.centre_sante;
        tr.innerHTML = `
          <td>${r.nom_enfant}</td>
          <td>${r.centre_sante}</td>
          <td>${r.nom_vaccin}</td>
          <td>${r.date_prevue}</td>
        `;
        tbody.appendChild(tr);
      });

      // Ajout des centres dans le filtre
      centres.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        filtreCentre.appendChild(opt);
      });

      filtreCentre.addEventListener('change', () => {
        const selected = filtreCentre.value;
        document.querySelectorAll('#table-retards tbody tr').forEach(row => {
          row.style.display = (selected === '' || row.dataset.centre === selected) ? '' : 'none';
        });
      });
    });
}

// 🔁 Synchroniser en tâche de fond toutes les 15s si connecté
setInterval(synchroniserDonnees, 15000);

// 🔔 Détection online / offline
window.addEventListener('online', () => alert('✅ Connexion rétablie. Données synchronisées.'));
window.addEventListener('offline', () => alert('❌ Hors ligne. Vos données seront synchronisées plus tard.'));


