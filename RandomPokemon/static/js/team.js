const POKEMON_TYPES = [
  'normal','fire','water','electric','grass','ice','fighting','poison','ground',
  'flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'
];

let statsRadarChart = null;
const reduceMotionQuery = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false };

function initTeamPage() {
  const synergySection = document.getElementById('teamSynergy');
  if (!synergySection) {
    return;
  }

  window.scrollToTop = function scrollToTop() {
    window.scrollTo({ top: 0, behavior: reduceMotionQuery.matches ? 'auto' : 'smooth' });
  };

  window.scrollToSynergy = function scrollToSynergy() {
    synergySection.scrollIntoView({ behavior: reduceMotionQuery.matches ? 'auto' : 'smooth', block: 'start' });
  };

  window.refreshTeamAnalysis = function refreshTeamAnalysis() {
    fetchTeamAnalysis();
  };

  setupSynergyTabs();
  hydrateSavedTeamsList();

  const initialAnalysisAttr = synergySection.getAttribute('data-initial-analysis');
  let initialData = null;
  if (initialAnalysisAttr) {
    try {
      initialData = JSON.parse(initialAnalysisAttr);
      if (!initialData || !initialData.team || !initialData.team.length) {
        initialData = null;
      }
    } catch (err) {
      initialData = null;
    }
  }

  if (initialData) {
    renderFullAnalysis(initialData, { updateGrid: false });
    const initialTeamSize = initialData && Array.isArray(initialData.team) ? initialData.team.length : 0;
    announceAnalysisStatus(`Loaded analysis for ${initialTeamSize} Pokémon`);
  } else {
    fetchTeamAnalysis();
  }

  if (typeof reduceMotionQuery.addEventListener === 'function') {
    reduceMotionQuery.addEventListener('change', handleMotionPreferenceChange);
  } else if (typeof reduceMotionQuery.addListener === 'function') {
    reduceMotionQuery.addListener(handleMotionPreferenceChange);
  }
}

document.addEventListener('DOMContentLoaded', initTeamPage);

function setupSynergyTabs() {
  const tabs = Array.from(document.querySelectorAll('.synergy-tab'));
  const panels = document.querySelectorAll('.synergy-panel');
  if (!tabs.length) return;

  const activateTab = (targetTab, focus = false) => {
    const target = targetTab.getAttribute('data-synergy-tab');
    tabs.forEach(tab => {
      const isActive = tab === targetTab;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
      if (isActive && focus) {
        tab.focus();
      }
    });
    panels.forEach(panel => {
      const isVisible = panel.getAttribute('data-panel') === target;
      panel.classList.toggle('active', isVisible);
      if (isVisible) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', 'hidden');
      }
    });
  };

  tabs.forEach((tab, index) => {
    tab.dataset.index = index.toString();
    tab.addEventListener('click', () => activateTab(tab, false));
    tab.addEventListener('keydown', event => {
      const currentIndex = parseInt(tab.dataset.index, 10);
      if (Number.isNaN(currentIndex)) {
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        activateTab(tabs[nextIndex], true);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        activateTab(tabs[prevIndex], true);
      } else if (event.key === 'Home') {
        event.preventDefault();
        activateTab(tabs[0], true);
      } else if (event.key === 'End') {
        event.preventDefault();
        activateTab(tabs[tabs.length - 1], true);
      }
    });
  });
}

function showSynergyLoading() {
  const summary = document.getElementById('synergySummaryCards');
  const panelIds = ['defensePanel', 'offensePanel', 'statsPanel', 'recommendationsPanel'];
  if (summary) {
    summary.innerHTML = '<div class="synergy-loading">Crunching numbers...</div>';
  }
  announceAnalysisStatus('Analyzing team data…');
  panelIds.forEach(id => {
    const panel = document.getElementById(id);
    if (panel) {
      panel.innerHTML = '<div class="synergy-loading">Loading...</div>';
    }
  });
}

function fetchTeamAnalysis(idsOverride = null) {
  const synergySection = document.getElementById('teamSynergy');
  if (!synergySection) return;
  const teamIds = idsOverride || synergySection.getAttribute('data-team-ids');
  if (!teamIds) {
    const summary = document.getElementById('synergySummaryCards');
    if (summary) summary.innerHTML = '<p class="synergy-error">No team IDs provided.</p>';
    return;
  }

  showSynergyLoading();
  const query = encodeURIComponent(teamIds);
  fetch(`/api/team-analysis?ids=${query}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Analysis failed (${response.status})`);
      }
      return response.json();
    })
    .then(data => {
      renderFullAnalysis(data, { updateGrid: true });
      const teamSize = data && Array.isArray(data.team) ? data.team.length : 0;
      announceAnalysisStatus(`Analysis updated for ${teamSize} Pokémon`);
    })
    .catch(err => {
      const summary = document.getElementById('synergySummaryCards');
      if (summary) {
        summary.innerHTML = `<p class="synergy-error">${err.message}. Try again.</p>`;
      }
      announceAnalysisStatus(`Analysis error: ${err.message}`);
    });
}

function renderFullAnalysis(analysis, options = { updateGrid: true }) {
  if (!analysis) return;
  const synergySection = document.getElementById('teamSynergy');
  if (synergySection && analysis.team) {
    const ids = analysis.team.map(p => p.id).join(',');
    synergySection.setAttribute('data-team-ids', ids);
  }

  if (options.updateGrid && analysis.team) {
    renderTeamGrid(analysis.team);
  }

  renderSummaryCards(analysis);
  renderDefensePanel(analysis.defensiveMatrix || []);
  renderOffensePanel(analysis.offensiveMatrix || []);
  renderStatsPanel(analysis.statSummary || {}, analysis.roles || []);
  renderRecommendationsPanel(analysis.recommendations || []);
}

function renderSummaryCards(analysis) {
  const summary = document.getElementById('synergySummaryCards');
  if (!summary) return;
  const totals = (analysis.defensiveMatrix || []).reduce(
    (acc, entry) => {
      acc.weak += entry.weak;
      acc.quadWeak += entry.quadWeak;
      acc.resist += entry.resist;
      acc.immune += entry.immune;
      return acc;
    },
    { weak: 0, quadWeak: 0, resist: 0, immune: 0 }
  );
  const avgStats = analysis.statSummary && analysis.statSummary.average ? analysis.statSummary.average : {};
  const roleCount = new Set((analysis.roles || []).map(role => role.role)).size;
  const synergyScore = analysis.synergyScore || { value: 0, breakdown: {} };
  summary.innerHTML = `
    <div class="summary-card highlight">
      <p class="summary-label">Synergy Score</p>
      <h3>${typeof synergyScore.value !== 'undefined' ? synergyScore.value : 0}</h3>
      <span class="summary-subtext">${Object.entries(synergyScore.breakdown || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(' · ')}</span>
    </div>
    <div class="summary-card">
      <p class="summary-label">Weaknesses</p>
      <h3>${totals.weak + totals.quadWeak}</h3>
      <span class="summary-subtext">${totals.quadWeak} quad · ${totals.resist} resists</span>
    </div>
    <div class="summary-card">
      <p class="summary-label">Avg BST</p>
      <h3>${analysis.statSummary && typeof analysis.statSummary.averageBST !== 'undefined' ? analysis.statSummary.averageBST : 0}</h3>
      <span class="summary-subtext">Avg Speed ${typeof avgStats['speed'] !== 'undefined' ? avgStats['speed'] : 0}</span>
    </div>
    <div class="summary-card">
      <p class="summary-label">Unique Roles</p>
      <h3>${roleCount}</h3>
      <span class="summary-subtext">${(analysis.roles || [])
        .map(role => role.role)
        .slice(0, 3)
        .join(', ')}</span>
    </div>
  `;
}

function renderDefensePanel(matrix) {
  const panel = document.getElementById('defensePanel');
  if (!panel) return;
  if (!matrix.length) {
    panel.innerHTML = '<p class="synergy-error">No defensive data available.</p>';
    return;
  }
  const rows = matrix
    .map(entry => {
      const total = entry.quadWeak + entry.weak + entry.neutral + entry.resist + entry.immune || 1;
      const quadPct = (entry.quadWeak / total) * 100;
      const weakPct = (entry.weak / total) * 100;
      const resistPct = (entry.resist / total) * 100;
      const immunePct = (entry.immune / total) * 100;
      const description = `${entry.type} defense profile: ${entry.quadWeak} quad weak, ${entry.weak} weak, ${entry.resist} resistances, ${entry.immune} immunities.`;
      return `
        <div class="defense-row">
          <div class="type-pill ${entry.type}">${entry.type.toUpperCase()}</div>
          <div class="stacked-bar" role="img" aria-label="${description}" title="${description}">
            <span style="width:${quadPct}%" class="quad">${entry.quadWeak ? `${entry.quadWeak}×` : ''}</span>
            <span style="width:${weakPct}%" class="weak">${entry.weak ? entry.weak : ''}</span>
            <span style="width:${resistPct}%" class="resist">${entry.resist ? entry.resist : ''}</span>
            <span style="width:${immunePct}%" class="immune">${entry.immune ? entry.immune : ''}</span>
          </div>
          <dl class="sr-only">
            <dt>Quad weakness</dt><dd>${entry.quadWeak}</dd>
            <dt>Weaknesses</dt><dd>${entry.weak}</dd>
            <dt>Resistances</dt><dd>${entry.resist}</dd>
            <dt>Immunities</dt><dd>${entry.immune}</dd>
          </dl>
        </div>
      `;
    })
    .join('');
  panel.innerHTML = `<div class="defense-table">${rows}</div>`;
}

function renderOffensePanel(matrix) {
  const panel = document.getElementById('offensePanel');
  if (!panel) return;
  if (!matrix.length) {
    panel.innerHTML = '<p class="synergy-error">No offensive data available.</p>';
    return;
  }
  const heatmap = {};
  matrix.forEach(entry => {
    entry.typeBreakdown.forEach(breakdown => {
      const key = `${breakdown.type}-${entry.target}`;
      heatmap[key] = breakdown;
    });
  });

  let table = `
    <div class="heatmap" tabindex="0">
      <table class="coverage-table">
        <caption>Offensive coverage by attacking and defending types</caption>
        <thead>
          <tr>
            <th scope="col">Attack vs Defend</th>
            ${POKEMON_TYPES.map(type => `<th scope="col">${type.slice(0, 3).toUpperCase()}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  POKEMON_TYPES.forEach(attack => {
    table += `<tr><th scope="row">${attack.slice(0, 3).toUpperCase()}</th>`;
    POKEMON_TYPES.forEach(target => {
      const key = `${attack}-${target}`;
      const cell = heatmap[key];
      const count = cell ? cell.count : 0;
      const pokemonList = cell ? cell.pokemon.join(', ') : 'None';
      const level = count === 0 ? 'zero' : count === 1 ? 'low' : count <= 3 ? 'medium' : 'high';
      const ariaLabel = `${attack} attacking ${target}: ${count} Pokémon${cell && cell.pokemon.length ? ` (${pokemonList})` : ''}`;
      table += `<td class="heat-cell heat-${level}" aria-label="${ariaLabel}" title="${pokemonList}">${count}</td>`;
    });
    table += '</tr>';
  });

  table += '</tbody></table></div>';
  panel.innerHTML = table;
}

function renderStatsPanel(statsSummary, roles) {
  const panel = document.getElementById('statsPanel');
  if (!panel) return;
  const averages = statsSummary.average || {};
  const labels = ['HP', 'ATK', 'DEF', 'SP.ATK', 'SP.DEF', 'SPD'];
  const dataPoints = [
    averages['hp'] || 0,
    averages['attack'] || 0,
    averages['defense'] || 0,
    averages['special-attack'] || 0,
    averages['special-defense'] || 0,
    averages['speed'] || 0,
  ];
  panel.innerHTML = `
    <div class="stats-layout">
      <div class="chart-wrapper">
        <figure>
          <canvas id="statsRadar" aria-label="Average base stats radar chart" role="img"></canvas>
          <figcaption>Average base stats across HP, Attack, Defense, Special Attack, Special Defense, and Speed.</figcaption>
        </figure>
      </div>
      <div class="roles-wrapper" role="list">
        ${(roles || [])
          .map(role => `<div class="role-chip" role="listitem"><strong>${role.role}</strong> <span>${role.name}</span></div>`)
          .join('') || '<p>No roles identified.</p>'}
      </div>
    </div>
    <div class="stats-text-summary">
      <h4 class="sr-only">Average stats summary</h4>
      <ul>
        ${labels
          .map((label, index) => `<li>${label}: ${Math.round(dataPoints[index])}</li>`)
          .join('')}
      </ul>
    </div>
  `;
  const canvas = document.getElementById('statsRadar');
  if (!canvas) return;
  if (statsRadarChart) {
    statsRadarChart.destroy();
  }
  statsRadarChart = new Chart(canvas, {
    type: 'radar',
    data: {
      labels,
      datasets: [
        {
          label: 'Average Stats',
          data: dataPoints,
          fill: true,
          backgroundColor: 'rgba(44,90,160,0.2)',
          borderColor: '#2C5AA0',
          pointBackgroundColor: '#ffcc00',
        },
      ],
    },
    options: {
      animations: reduceMotionQuery.matches ? false : { duration: 800 },
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 150,
          angleLines: { color: 'rgba(0,0,0,0.1)' },
          grid: { color: 'rgba(0,0,0,0.1)' },
          ticks: {
            showLabelBackdrop: false,
            stepSize: 30,
          },
        },
      },
      plugins: { legend: { display: false } },
    },
  });
}

function renderRecommendationsPanel(recommendations) {
  const panel = document.getElementById('recommendationsPanel');
  if (!panel) return;
  if (!recommendations.length) {
    panel.innerHTML = '<p class="synergy-success">Team looks great! No urgent recommendations.</p>';
    return;
  }
  panel.innerHTML = recommendations
    .map(rec => {
      const severityClass = `severity-${rec.severity}`;
      return `
        <div class="recommendation-card ${severityClass}">
          <p class="recommendation-severity">${rec.severity.toUpperCase()}</p>
          <p>${rec.message}</p>
          ${rec.type && rec.type !== 'roles' && rec.type !== 'stats'
            ? `<button class="chip" onclick="window.location.href='/team?preferred_type=${rec.type}'">Find ${rec.type.title()} support</button>`
            : ''}
        </div>
      `;
    })
    .join('');
}

function renderTeamGrid(team) {
  const grid = document.getElementById('teamGrid');
  if (!grid || !Array.isArray(team)) return;
  grid.innerHTML = '';
  team.forEach(pokemon => {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.dataset.pokemonId = pokemon.id;
    card.dataset.pokemonTypes = JSON.stringify(pokemon.types || []);
    card.addEventListener('click', () => {
      window.location.href = `/pokemon/${pokemon.id}`;
    });
    card.innerHTML = `
      <img src="${pokemon.image_url}" alt="${pokemon.name}" class="team-img">
      <h3>${pokemon.name} #${pokemon.id}</h3>
      <div class="team-types">
        ${(pokemon.types || []).map(type => `<span class="type ${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</span>`).join('')}
      </div>
      <div class="team-stats-summary">
        <span>HP: ${pokemon.stats && typeof pokemon.stats.hp !== 'undefined' ? pokemon.stats.hp : 'N/A'}</span>
        ${renderBestAttackSpan(pokemon.stats)}
        ${renderBestDefenseSpan(pokemon.stats)}
        <span>SPD: ${pokemon.stats && typeof pokemon.stats.speed !== 'undefined' ? pokemon.stats.speed : 'N/A'}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderBestAttackSpan(stats = {}) {
  const atk = stats['attack'] || 0;
  const spAtk = stats['special-attack'] || 0;
  const best = Math.max(atk, spAtk);
  if (!best) return '<span>ATK: N/A</span>';
  let label = '';
  if (atk !== spAtk) {
    label = atk > spAtk ? '(Ph)' : '(Sp)';
  }
  return `<span>ATK: ${best}${label}</span>`;
}

function renderBestDefenseSpan(stats = {}) {
  const def = stats['defense'] || 0;
  const spDef = stats['special-defense'] || 0;
  const best = Math.max(def, spDef);
  if (!best) return '<span>DEF: N/A</span>';
  let label = '';
  if (def !== spDef) {
    label = def > spDef ? '(Ph)' : '(Sp)';
  }
  return `<span>DEF: ${best}${label}</span>`;
}

function hydrateSavedTeamsList() {
  const container = document.getElementById('savedTeamsList');
  if (!container) return;
  container.innerHTML = '';
  const savedTeams = JSON.parse(localStorage.getItem('savedTeams') || '[]');
  savedTeams.forEach((team, index) => {
    const teamDiv = document.createElement('div');
    teamDiv.className = 'saved-team-item';
    teamDiv.innerHTML = `
      <h4>${team.name}</h4>
      <p>${team.pokemonIds.length} Pokémon</p>
      <p class="saved-team-date">${new Date(team.date).toLocaleDateString()}</p>
      <div class="saved-team-actions">
        <button class="reload-button" style="font-size:0.6rem;padding:5px 10px;" onclick="loadTeam(${index})">Load</button>
        <button class="reload-button" style="font-size:0.6rem;padding:5px 10px;" onclick="deleteTeam(${index})">Delete</button>
      </div>
    `;
    container.appendChild(teamDiv);
  });
}

// Expose team actions globally for inline handlers
window.saveCurrentTeam = function saveCurrentTeam() {
  const teamCards = document.querySelectorAll('#teamGrid .team-card');
  if (!teamCards.length) {
    showNotification('No team to save!');
    return;
  }
  const team = Array.from(teamCards)
    .map(card => parseInt(card.dataset.pokemonId, 10))
    .filter(Boolean);
  const savedTeams = JSON.parse(localStorage.getItem('savedTeams') || '[]');
  const teamName = prompt('Enter a name for this team:', `Team ${savedTeams.length + 1}`);
  if (teamName) {
    savedTeams.push({ name: teamName, pokemonIds: team, date: new Date().toISOString() });
    localStorage.setItem('savedTeams', JSON.stringify(savedTeams));
    hydrateSavedTeamsList();
    showNotification('Team saved!');
  }
};

window.loadSavedTeams = function loadSavedTeams() {
  const container = document.getElementById('savedTeamsContainer');
  if (!container) return;
  hydrateSavedTeamsList();
  container.style.display = container.style.display === 'block' ? 'none' : 'block';
};

window.loadTeam = function loadTeam(index) {
  const savedTeams = JSON.parse(localStorage.getItem('savedTeams') || '[]');
  const team = savedTeams[index];
  if (!team) {
    showNotification('Team not found.');
    return;
  }
  if (!team.pokemonIds || !team.pokemonIds.length) {
    showNotification('Saved team has no Pokémon.');
    return;
  }
  fetchTeamAnalysis(team.pokemonIds.join(','));
};

window.deleteTeam = function deleteTeam(index) {
  const savedTeams = JSON.parse(localStorage.getItem('savedTeams') || '[]');
  savedTeams.splice(index, 1);
  localStorage.setItem('savedTeams', JSON.stringify(savedTeams));
  hydrateSavedTeamsList();
  showNotification('Team deleted!');
};

window.shareTeam = function shareTeam() {
  const synergySection = document.getElementById('teamSynergy');
  const ids = synergySection ? synergySection.getAttribute('data-team-ids') : null;
  if (!ids) {
    showNotification('No team to share!');
    return;
  }
  const url = `${window.location.origin}/team?ids=${ids}`;
  copyToClipboard(url);
};

window.refreshTeamAnalysis = window.refreshTeamAnalysis || function noop() {};

function announceAnalysisStatus(message) {
  const region = document.getElementById('analysisStatus');
  if (region) {
    region.textContent = message;
  }
}

function handleMotionPreferenceChange() {
  if (statsRadarChart) {
    statsRadarChart.options.animations = reduceMotionQuery.matches ? false : { duration: 800 };
    statsRadarChart.update();
  }
}
