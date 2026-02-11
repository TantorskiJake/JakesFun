const POKEMON_TYPES = [
  'normal','fire','water','electric','grass','ice','fighting','poison','ground',
  'flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'
];

let statsRadarChart = null;
const reduceMotionQuery = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false };
const MAX_POKEMON_ID = 1025;
const slotSuggestionCache = new Map();
let slotSuggestionAbortController = null;

function formatTypeLabel(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatReadableList(items) {
  const filtered = (items || []).filter(Boolean);
  if (!filtered.length) return '';
  if (filtered.length === 1) return filtered[0];
  if (filtered.length === 2) return `${filtered[0]} and ${filtered[1]}`;
  return `${filtered.slice(0, -1).join(', ')}, and ${filtered[filtered.length - 1]}`;
}

function initTeamPage() {
  const synergySection = document.getElementById('teamSynergy');
  if (!synergySection) {
    return;
  }

  window.teamState = window.teamState || {
    currentTeam: [],
  };

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
  setupSlotControls();
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
    if (Array.isArray(initialData.team)) {
      window.teamState.currentTeam = initialData.team.map((pokemon, index) =>
        normalizePokemonForSlot(pokemon, index)
      );
    }
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

function fetchTeamAnalysis(idsOverride = null, options = { updateGrid: true }) {
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
      const shouldUpdateGrid = options && Object.prototype.hasOwnProperty.call(options, 'updateGrid')
        ? options.updateGrid
        : true;
      renderFullAnalysis(data, { updateGrid: shouldUpdateGrid });
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
  if (analysis.team) {
    syncTeamIdsAttribute(analysis.team);
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
  const defenseTotals = matrix.map(entry => ({
    type: entry.type,
    weakOverlap: entry.weak + entry.quadWeak,
    quadWeak: entry.quadWeak,
    resistTotal: entry.resist,
    immuneTotal: entry.immune,
  }));
  const topWeaknesses = defenseTotals
    .filter(item => item.weakOverlap > 0)
    .sort((a, b) => b.weakOverlap - a.weakOverlap)
    .slice(0, 3);
  const topResists = defenseTotals
    .filter(item => item.resistTotal > 0 || item.immuneTotal > 0)
    .sort((a, b) => b.resistTotal + b.immuneTotal - (a.resistTotal + a.immuneTotal))
    .slice(0, 3);
  const immunityHighlights = defenseTotals.filter(item => item.immuneTotal > 0).slice(0, 3);

  const weaknessText = topWeaknesses.length
    ? formatReadableList(
        topWeaknesses.map(item => {
          const quadNote = item.quadWeak ? `, ${item.quadWeak} ×4` : '';
          return `${formatTypeLabel(item.type)} (${item.weakOverlap} weak${quadNote})`;
        })
      )
    : 'No overlapping weaknesses detected.';
  const resistanceText = topResists.length
    ? formatReadableList(
        topResists.map(item => {
          const immuneNote = item.immuneTotal ? `, ${item.immuneTotal} immune` : '';
          return `${formatTypeLabel(item.type)} (${item.resistTotal} resist${item.resistTotal === 1 ? '' : 's'}${immuneNote})`;
        })
      )
    : 'Balanced resistances across the chart.';
  const immunityText = immunityHighlights.length
    ? formatReadableList(
        immunityHighlights.map(item => `${formatTypeLabel(item.type)} (${item.immuneTotal} immune)`)
      )
    : 'No natural immunities yet.';

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
  panel.innerHTML = `
    <div class="synergy-panel-summary">
      <h3>Quick takeaways</h3>
      <ul>
        <li><strong>Biggest threats:</strong> ${weaknessText}</li>
        <li><strong>Reliable resistances:</strong> ${resistanceText}</li>
        <li><strong>Free switch-ins:</strong> ${immunityText}</li>
      </ul>
    </div>
    <div class="defense-table">${rows}</div>
  `;
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
  const uncovered = matrix.filter(entry => entry.coverage === 0).map(entry => formatTypeLabel(entry.target));
  const singleAnswers = matrix
    .filter(entry => entry.coverage === 1)
    .slice(0, 3)
    .map(entry => {
      const attacker = entry.sources && entry.sources.length ? entry.sources[0] : '1 option';
      return `${formatTypeLabel(entry.target)} (only ${attacker})`;
    });
  const strongMatchups = matrix
    .filter(entry => entry.coverage > 1)
    .sort((a, b) => b.coverage - a.coverage)
    .slice(0, 3)
    .map(entry => {
      const previewSources = (entry.sources || []).slice(0, 2).join(', ');
      const more = entry.sources && entry.sources.length > 2 ? '…' : '';
      return `${formatTypeLabel(entry.target)} (${entry.coverage} answers${previewSources ? ` via ${previewSources}${more}` : ''})`;
    });

  const uncoveredText = uncovered.length
    ? formatReadableList(uncovered)
    : 'You can hit every type super effectively.';
  const singleAnswerText = singleAnswers.length
    ? formatReadableList(singleAnswers)
    : 'Multiple answers cover each remaining type.';
  const strongMatchupText = strongMatchups.length
    ? formatReadableList(strongMatchups)
    : 'Build out offenses to find reliable targets.';

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
  panel.innerHTML = `
    <div class="synergy-panel-summary">
      <h3>Quick takeaways</h3>
      <ul>
        <li><strong>Needs coverage:</strong> ${uncoveredText}</li>
        <li><strong>Single answers:</strong> ${singleAnswerText}</li>
        <li><strong>Confident matchups:</strong> ${strongMatchupText}</li>
      </ul>
    </div>
    ${table}
  `;
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
      const typeLabel = formatTypeLabel(rec.type);
      const showTypeChip = rec.type && rec.type !== 'roles' && rec.type !== 'stats';
      return `
        <div class="recommendation-card ${severityClass}">
          <p class="recommendation-severity">${rec.severity.toUpperCase()}</p>
          <p>${rec.message}</p>
          ${showTypeChip
            ? `<button class="chip" onclick="window.location.href='/team?preferred_type=${rec.type}'">Find ${typeLabel || 'type'} support</button>`
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

  const normalizedTeam = team
    .filter(Boolean)
    .map((pokemon, index) => normalizePokemonForSlot(pokemon, index));

  window.teamState.currentTeam = normalizedTeam;
  syncTeamIdsAttribute(normalizedTeam);

  for (let i = 0; i < normalizedTeam.length; i += 3) {
    const row = document.createElement('div');
    row.className = 'team-grid-six-row';
    const chunk = normalizedTeam.slice(i, i + 3);
    chunk.forEach(pokemon => {
      const card = createTeamCard(pokemon);
      row.appendChild(card);
    });
    grid.appendChild(row);
  }
}

function createTeamCard(pokemon) {
  const slotIndex = typeof pokemon.slotIndex === 'number' ? pokemon.slotIndex : 0;
  const card = document.createElement('div');
  card.className = 'team-card';
  card.dataset.pokemonId = pokemon.id;
  card.dataset.slotIndex = slotIndex;
  card.dataset.pokemonTypes = JSON.stringify(pokemon.types || []);
  const typesMarkup = (pokemon.types || [])
    .map(type => `<span class="type ${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</span>`)
    .join('');
  card.innerHTML = `
      <div class="team-card-toolbar">
        <button class="icon-button slot-control slot-reroll" type="button" data-slot-index="${slotIndex}" aria-label="Get a new random Pokémon for this slot">🎲</button>
        <div class="slot-edit-wrapper" data-slot-index="${slotIndex}">
          <button class="icon-button slot-control slot-edit-btn" type="button" data-slot-index="${slotIndex}" aria-label="Search for a specific Pokémon for this slot">✏️</button>
          <div class="slot-search-field" hidden aria-hidden="true">
          <input type="text" class="slot-search-input" data-slot-index="${slotIndex}" placeholder="Name or ID" autocomplete="off" aria-label="Search Pokémon for this slot" list="slot-suggestions-${slotIndex}">
          <datalist id="slot-suggestions-${slotIndex}"></datalist>
          <button class="icon-button slot-search-submit" type="button" data-slot-index="${slotIndex}" aria-label="Apply the selected Pokémon to this slot">✔️</button>
          <button class="icon-button slot-search-cancel" type="button" data-slot-index="${slotIndex}" aria-label="Cancel search">✕</button>
        </div>
      </div>
    </div>
      <a class="team-card-link" href="/pokemon/${pokemon.id}">
        <img src="${pokemon.image_url || ''}" alt="${pokemon.name}" class="team-img">
        <h3>${pokemon.name} #${pokemon.id}</h3>
        <div class="team-types">
          ${typesMarkup}
        </div>
        <div class="team-stats-summary">
          <span>HP: ${pokemon.stats && typeof pokemon.stats.hp !== 'undefined' ? pokemon.stats.hp : 'N/A'}</span>
          ${renderBestAttackSpan(pokemon.stats)}
          ${renderBestDefenseSpan(pokemon.stats)}
          <span>SPD: ${pokemon.stats && typeof pokemon.stats.speed !== 'undefined' ? pokemon.stats.speed : 'N/A'}</span>
        </div>
      </a>
    `;
  return card;
}

function updateSlotCard(slotIndex, pokemon) {
  const grid = document.getElementById('teamGrid');
  if (!grid) return;
  const existingCard = grid.querySelector(`.team-card[data-slot-index="${slotIndex}"]`);
  if (!existingCard) return;
  const replacement = createTeamCard(pokemon);
  existingCard.replaceWith(replacement);
}

function syncTeamIdsAttribute(teamList) {
  const synergySection = document.getElementById('teamSynergy');
  if (!synergySection || !Array.isArray(teamList)) return;
  const ids = teamList
    .map(pokemon => pokemon && pokemon.id)
    .filter(Boolean)
    .join(',');
  if (ids) {
    synergySection.setAttribute('data-team-ids', ids);
  }
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

function setupSlotControls() {
  const grid = document.getElementById('teamGrid');
  if (!grid) return;
  grid.addEventListener('click', handleTeamGridClick);
  grid.addEventListener('keydown', handleSlotKeydown);
  grid.addEventListener('input', handleSlotInput);
}

function handleTeamGridClick(event) {
  if (handleSlotControlInteraction(event)) {
    return;
  }
  if (!event.target.closest('.slot-edit-wrapper')) {
    closeAllSlotSearches();
  }
}

function handleSlotControlInteraction(event) {
  const rerollBtn = event.target.closest('.slot-reroll');
  if (rerollBtn) {
    event.preventDefault();
    event.stopPropagation();
    const slotIndex = parseInt(rerollBtn.dataset.slotIndex, 10);
    if (!Number.isNaN(slotIndex)) {
      rerollSlot(slotIndex);
    }
    return true;
  }

  const editBtn = event.target.closest('.slot-edit-btn');
  if (editBtn) {
    event.preventDefault();
    event.stopPropagation();
    const slotIndex = parseInt(editBtn.dataset.slotIndex, 10);
    if (!Number.isNaN(slotIndex)) {
      toggleSlotSearch(slotIndex, true);
    }
    return true;
  }

  const submitBtn = event.target.closest('.slot-search-submit');
  if (submitBtn) {
    event.preventDefault();
    event.stopPropagation();
    const slotIndex = parseInt(submitBtn.dataset.slotIndex, 10);
    if (!Number.isNaN(slotIndex)) {
      submitSlotSearch(slotIndex);
    }
    return true;
  }

  const cancelBtn = event.target.closest('.slot-search-cancel');
  if (cancelBtn) {
    event.preventDefault();
    event.stopPropagation();
    const slotIndex = parseInt(cancelBtn.dataset.slotIndex, 10);
    if (!Number.isNaN(slotIndex)) {
      toggleSlotSearch(slotIndex, false);
    }
    return true;
  }

  const searchField = event.target.closest('.slot-search-field');
  if (searchField) {
    event.stopPropagation();
    return true;
  }

  return false;
}

function handleSlotKeydown(event) {
  const slotInput = event.target.closest('.slot-search-input');
  if (!slotInput) {
    return;
  }
  const slotIndex = parseInt(slotInput.dataset.slotIndex, 10);
  if (Number.isNaN(slotIndex)) {
    return;
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    submitSlotSearch(slotIndex);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    toggleSlotSearch(slotIndex, false);
  }
}

function handleSlotInput(event) {
  const slotInput = event.target.closest('.slot-search-input');
  if (!slotInput) {
    return;
  }
  const value = slotInput.value.trim();
  const datalistId = slotInput.getAttribute('list');
  if (!datalistId) {
    return;
  }
  const datalist = document.getElementById(datalistId);
  if (!datalist) {
    return;
  }
  if (value.length < 2) {
    datalist.innerHTML = '';
    return;
  }
  fetchSlotSuggestions(value)
    .then(suggestions => {
      if (!Array.isArray(suggestions)) {
        datalist.innerHTML = '';
        return;
      }
      datalist.innerHTML = suggestions.map(name => `<option value="${name}">`).join('');
    })
    .catch(() => {
      datalist.innerHTML = '';
    });
}

function fetchSlotSuggestions(query) {
  const normalized = query.toLowerCase();
  if (slotSuggestionCache.has(normalized)) {
    return Promise.resolve(slotSuggestionCache.get(normalized));
  }
  if (slotSuggestionAbortController) {
    slotSuggestionAbortController.abort();
  }
  slotSuggestionAbortController = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const fetchOptions = slotSuggestionAbortController ? { signal: slotSuggestionAbortController.signal } : {};
  return fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`, fetchOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error('suggestions failed');
      }
      return response.json();
    })
    .then(data => {
      const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
      slotSuggestionCache.set(normalized, suggestions);
      return suggestions;
    })
    .catch(err => {
      if (err && err.name === 'AbortError') {
        return [];
      }
      return [];
    });
}

function toggleSlotSearch(slotIndex, show) {
  const wrapper = document.querySelector(`.slot-edit-wrapper[data-slot-index="${slotIndex}"]`);
  if (!wrapper) return;
  const field = wrapper.querySelector('.slot-search-field');
  const input = wrapper.querySelector('.slot-search-input');
  if (!field || !input) return;
  if (show) {
    closeAllSlotSearches(slotIndex);
    wrapper.classList.add('search-open');
    field.hidden = false;
    field.setAttribute('aria-hidden', 'false');
    input.focus();
  } else {
    wrapper.classList.remove('search-open');
    field.hidden = true;
    field.setAttribute('aria-hidden', 'true');
    input.value = '';
  }
}

function closeAllSlotSearches(exceptIndex = null) {
  document.querySelectorAll('.slot-edit-wrapper').forEach(wrapper => {
    const field = wrapper.querySelector('.slot-search-field');
    const input = wrapper.querySelector('.slot-search-input');
    if (!field || !input) return;
    const wrapperIndex = parseInt(wrapper.dataset.slotIndex, 10);
    if (exceptIndex !== null && wrapperIndex === exceptIndex) {
      return;
    }
    wrapper.classList.remove('search-open');
    field.hidden = true;
    field.setAttribute('aria-hidden', 'true');
    input.value = '';
  });
}

function getSlotInput(slotIndex) {
  return document.querySelector(`.slot-search-input[data-slot-index="${slotIndex}"]`);
}

function submitSlotSearch(slotIndex) {
  const input = getSlotInput(slotIndex);
  if (!input) return;
  const searchValue = input.value.trim();
  if (!searchValue) {
    showNotification('Please enter a Pokémon name or ID.');
    input.focus();
    return;
  }
  setSlotLoading(slotIndex, true);
  fetchPokemonByIdentifier(searchValue)
    .then(pokemon => {
      toggleSlotSearch(slotIndex, false);
      applyPokemonToSlot(slotIndex, pokemon);
      showNotification(`${pokemon.name} joined slot ${slotIndex + 1}!`);
    })
    .catch(err => {
      showNotification(err.message || 'Pokémon not found. Try another search.');
    })
    .finally(() => {
      setSlotLoading(slotIndex, false);
    });
}

function rerollSlot(slotIndex) {
  if (Number.isNaN(slotIndex)) return;
  setSlotLoading(slotIndex, true);
  fetchRandomPokemonData()
    .then(pokemon => {
      applyPokemonToSlot(slotIndex, pokemon);
      showNotification(`${pokemon.name} rolled into slot ${slotIndex + 1}!`);
    })
    .catch(err => {
      showNotification(err.message || 'Failed to fetch a random Pokémon.');
    })
    .finally(() => {
      setSlotLoading(slotIndex, false);
    });
}

function fetchPokemonByIdentifier(identifier) {
  const trimmed = String(identifier || '').trim();
  if (!trimmed) {
    return Promise.reject(new Error('Please enter a Pokémon name or ID.'));
  }
  const safeIdentifier = encodeURIComponent(trimmed.toLowerCase());
  return fetch(`/api/pokemon/${safeIdentifier}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Pokémon not found. Try another search.');
      }
      return response.json();
    });
}

function fetchRandomPokemonData() {
  const randomId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
  return fetchPokemonByIdentifier(randomId);
}

function applyPokemonToSlot(slotIndex, pokemon) {
  if (Number.isNaN(slotIndex) || !pokemon) {
    return;
  }
  const currentTeam = (window.teamState.currentTeam || []).slice();
  const normalized = normalizePokemonForSlot(pokemon, slotIndex);
  currentTeam[slotIndex] = normalized;
  window.teamState.currentTeam = currentTeam;
  syncTeamIdsAttribute(currentTeam);
  updateSlotCard(slotIndex, normalized);
  triggerTeamAnalysisFromState();
}

function triggerTeamAnalysisFromState() {
  const teamIds = (window.teamState.currentTeam || [])
    .map(pokemon => pokemon && pokemon.id)
    .filter(Boolean);
  if (!teamIds.length) return;
  fetchTeamAnalysis(teamIds.join(','), { updateGrid: false });
}

function setSlotLoading(slotIndex, isLoading) {
  const card = document.querySelector(`.team-card[data-slot-index="${slotIndex}"]`);
  if (!card) return;
  card.classList.toggle('is-loading', isLoading);
  const interactiveElements = card.querySelectorAll('button, input');
  interactiveElements.forEach(element => {
    element.disabled = isLoading;
  });
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

function normalizePokemonForSlot(pokemon, slotIndex) {
  if (!pokemon) return null;
  const normalized = { ...pokemon };
  const derivedIndex = typeof pokemon.slotIndex === 'number' ? pokemon.slotIndex : 0;
  normalized.slotIndex = typeof slotIndex === 'number' ? slotIndex : derivedIndex;
  normalized.types = Array.isArray(normalized.types) ? normalized.types : [];
  normalized.stats = normalizeStatsObject(normalized.stats);
  normalized.image_url = normalized.image_url || normalized.imageUrl || '';
  normalized.name = normalized.name || `#${normalized.id}`;
  return normalized;
}

function normalizeStatsObject(stats) {
  if (!stats) return {};
  if (Array.isArray(stats)) {
    return stats.reduce((acc, entry) => {
      if (entry && entry.stat && entry.stat.name) {
        acc[entry.stat.name] = entry.base_stat;
      }
      return acc;
    }, {});
  }
  return stats;
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
