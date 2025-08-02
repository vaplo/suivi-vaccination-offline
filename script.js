const BASE_URL = 'https://n8n-automation-server-waz-production.up.railway.app/webhook-test';

// ✅ Utilitaires
function estEnLigne() {
  return navigator.onLine;
}

function afficherMessage(id, texte, type = 'success') {
  const el = document.getElementById(id);
  if (el) {
    el.innerHTML = `<p class="${type}">${texte}</p>`;
  }
}

// ✅ Générer un ID unique enfant ou femme (ex: C123456)
function genererId(prefix) {
  const rand = Math.floor(100000 + Math.random() * 899999);
  return prefix + rand;
}

// ✅ Sauvegarde locale (offline)
function enregistrerLocalement(cle, data) {
  const existants = JSON.parse(localStorage.getItem(cle) || '[]');
  existants.push(data);
  localStorage.setItem(cle, JSON.stringify(existants));
}

// ✅ Synchronisation
def synchroniserDonnees() {
  if (!estEnLigne()) return;

  // Enfants
  const enfants = JSON.parse(localStorage.getItem('enfants_offline') || '[]');
  enfants.forEach((enfant, index) => {
    fetch(`${BASE_URL}/register-child`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enfant)
    })
    .then(() => {
      enfants.splice(index, 1);
      localStorage.setItem('enfants_offline', JSON.stringify(enfants));
    });
  });

  // Vaccins
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

// ✅ Formulaire enfant
const formEnfant = document.getElementById('form-enfant');
if (formEnfant) {
  formEnfant.addEventListener('submit', function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(formEnfant).entries());
    data.id_unique = genererId('C'); // ID enfant
    data.date_enregistrement = new Date().toISOString();

    if (!data.structure_sante) data.structure_sante = data.centre_sante || '';

    if (estEnLigne()) {
      fetch(`${BASE_URL}/register-child`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(() => {
        afficherMessage('message-form', '✅ Enregistrement réussi', 'success');
        formEnfant.reset();
      })
      .catch(() => {
        afficherMessage('message-form', '❌ Erreur réseau. Réessayez.', 'error');
      });
    } else {
      enregistrerLocalement('enfants_offline', data);
      afficherMessage('message-form', '📴 Mode hors-ligne – enfant sauvegardé', 'warning');
      formEnfant.reset();
    }
  });
}

// ✅ Formulaire grossesse
const formGrossesse = document.getElementById('form-grossesse');
if (formGrossesse) {
  formGrossesse.addEventListener('submit', function (e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(formGrossesse).entries());
    data.id_unique = genererId('M'); // ID mère
    data.date_enregistrement = new Date().toISOString();

    if (!data.structure_sante) data.structure_sante = data.centre_sante || '';

    if (estEnLigne()) {
      fetch(`${BASE_URL}/register-pregnancy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(() => {
        afficherMessage('message-form', '✅ Enregistrement réussi', 'success');
        formGrossesse.reset();
      })
      .catch(() => {
        afficherMessage('message-form', '❌ Erreur réseau. Réessayez.', 'error');
      });
    } else {
      enregistrerLocalement('grossesses_offline', data);
      afficherMessage('message-form', '📴 Mode hors-ligne – femme sauvegardée', 'warning');
      formGrossesse.reset();
    }
  });
}

// ✅ Affichage vaccins du jour
const vaccinsJourDiv = document.getElementById('vaccins-jour');
if (vaccinsJourDiv) {
  fetch(`${BASE_URL}/vaccins-prevus-aujourdhui`)
    .then(res => res.json())
    .then(vaccins => {
      vaccinsJourDiv.innerHTML = '';
      if (!vaccins.length) {
        vaccinsJourDiv.innerHTML = '<p>Aucun vaccin prévu aujourd’hui.</p>';
        return;
      }

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
            enregistrerLocalement('vaccins_offline', id);
            btn.parentElement.remove();
          }
        });
      });
    });
}

// ✅ Placeholder IA (future intégration pour génération de messages)
// function genererMessageIA(type, langue, donnees) {
//   return "Votre prochain rendez-vous est prévu le..."; // à remplacer par appel IA (ex: n8n → OpenAI)
// }


