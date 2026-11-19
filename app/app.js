// Leonida Legend Tracker — GTA 6 trophy guide and checklist.
// Loads only its own data file (app/data/trophies.json), saves progress in
// localStorage, and makes no network request at run time.
const DATA_URL = 'data/trophies.json';
const STORAGE_KEY = 'gta6-trophy-guide-v1';

const ROADMAP_STAGES = [
  {
    title: 'Stage 1 — Play the story (Chapters 1–5)',
    meta: 'About 60 hours. Unmissable story trophies.',
    text: 'Finish every chapter and the final mission. Meditate at Lucia’s balcony spot in Chapter 1 before the chapter ends — it is the one missable. Keep a manual save at the start of every chapter.',
    trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 48],
  },
  {
    title: 'Stage 2 — Stranger strands',
    meta: '8 strands. Do them between chapters, not all at the end.',
    text: 'Complete the stranger mission strands for Andy, Kenton, Billy, Randy, Tyrone and Bret, plus three more strangers, to reach 8 strands in total.',
    trophyIds: [22, 23, 24, 26, 27, 29, 25],
  },
  {
    title: 'Stage 3 — Explore Leonida and collect',
    meta: 'Do this while travelling — one trip advances three trophies.',
    text: 'Explore every region, WAiNK It at 100 locations, discover 100 vehicles, complete 3 card sets, and clear every meditation spot as you find it.',
    trophyIds: [42, 31, 35, 30, 28],
  },
  {
    title: 'Stage 4 — Activities and challenges',
    meta: 'Repeatable: a failed run costs nothing but time.',
    text: '250 stunts, 20 different race wins, a Top Fun drone win at every location, gold in all 42 Shooting Range challenges, one arcade game, and beating Cal at fishing — plus trying every activity type once.',
    trophyIds: [15, 19, 18, 17, 21, 20, 16],
  },
  {
    title: 'Stage 5 — Partner play and world moments',
    meta: 'Free-roam trophies, best done with your partner beside you.',
    text: 'Lose a 4-star wanted level with your partner, rob 3 shops back-to-back without losing the heat, 5 takedowns in one Combat Focus, 50 challenges, the VCIA departure, the Rhino, the cocktail on Ocean Beach, the bowling alley, the showroom smash and the melee drive-by.',
    trophyIds: [33, 34, 36, 32, 37, 38, 44, 46, 45, 51, 47, 49, 50],
  },
  {
    title: 'Stage 6 — Robberies and money',
    meta: 'Rob, launder, spend, buy. The loop feeds itself.',
    text: 'Rob 5 bank vaults, an armored truck and one illegal operation per gang, rob a jewelry store undetected, launder $250,000 in Marked Bills, spend $100,000 in shops, buy all the garages and register 10 vehicles to Scooter Bros.',
    trophyIds: [40, 41, 43, 39, 52, 53, 54, 55],
  },
  {
    title: 'Stage 7 — 100% completion, then the Platinum',
    meta: 'The last two trophies. Check the in-game completion list.',
    text: 'Reach 100% completion in the game’s own checklist — it is separate from the trophies — and the Platinum pops once every other trophy is earned.',
    trophyIds: [14, 1],
  },
];

let trophies = [];
let earned = new Set();
let currentFilter = 'all';
let searchText = '';
let hideSpoilers = true;
let earnedOnly = false;

const listEl = document.getElementById('trophyList');
const emptyEl = document.getElementById('emptyMsg');
const hintEl = document.getElementById('filterHint');
const detailPanel = document.getElementById('detailPanel');
const detailBody = document.getElementById('detailBody');

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.earned)) earned = new Set(saved.earned.filter((n) => Number.isInteger(n)));
    if (typeof saved.hideSpoilers === 'boolean') hideSpoilers = saved.hideSpoilers;
  } catch (err) {
    earned = new Set();
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b), hideSpoilers }));
  } catch (err) {
    // Private mode or full storage: the checklist still works for this visit.
  }
}

function trophyById(id) {
  return trophies.find((t) => t.id === id);
}

function isStoryHidden(t) {
  return hideSpoilers && t.hidden && t.kind === 'story' && !earned.has(t.id);
}

function spoilerLabel(t) {
  return 'Hidden story trophy — tick it when earned to reveal its name.';
}

function filteredTrophies() {
  const q = searchText.trim().toLowerCase();
  return trophies.filter((t) => {
    if (earnedOnly && !earned.has(t.id)) return false;
    if (currentFilter === 'story' && t.kind !== 'story') return false;
    if (currentFilter === 'missable' && !t.missable) return false;
    if (currentFilter === 'collectibles' && !t.filters.includes('collectibles')) return false;
    if (currentFilter === 'activities' && !t.filters.includes('activities')) return false;
    if (currentFilter === 'online') return false;
    if (q) {
      const hay = [t.name, t.description, t.guide, t.kind].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function gradeCountsText() {
  const counts = { Platinum: 0, Gold: 0, Silver: 0, Bronze: 0 };
  for (const t of trophies) if (earned.has(t.id)) counts[t.grade] += 1;
  return `Earned: ${counts.Platinum} Platinum · ${counts.Gold} Gold · ${counts.Silver} Silver · ${counts.Bronze} Bronze`;
}

function updateProgress() {
  const n = earned.size;
  const total = trophies.length || 55;
  document.getElementById('progressText').textContent = `${n} / ${total} earned`;
  document.getElementById('progressPct').textContent = `${Math.round((n / total) * 100)}%`;
  document.getElementById('progressFill').style.width = `${(n / total) * 100}%`;
  document.getElementById('gradeCounts').textContent = gradeCountsText();
}

function renderRoadmap() {
  const stagesEl = document.getElementById('stages');
  stagesEl.innerHTML = '';
  for (const stage of ROADMAP_STAGES) {
    const li = document.createElement('li');
    const names = stage.trophyIds.map((id) => trophyById(id).name).join(' · ');
    const done = stage.trophyIds.filter((id) => earned.has(id)).length;
    li.innerHTML = '';
    const title = document.createElement('strong');
    title.textContent = `${stage.title} — ${done}/${stage.trophyIds.length} earned`;
    const meta = document.createElement('div');
    meta.className = 'stage-meta';
    meta.textContent = stage.meta;
    const text = document.createElement('p');
    text.className = 'stage-trophies';
    text.textContent = stage.text;
    const namesEl = document.createElement('p');
    namesEl.className = 'stage-trophies';
    namesEl.textContent = names;
    li.append(title, meta, text, namesEl);
    stagesEl.appendChild(li);
  }
}

function renderChecklist() {
  const rows = filteredTrophies();
  listEl.innerHTML = '';
  emptyEl.hidden = rows.length > 0;
  const shown = rows.length;
  const total = trophies.length;
  if (currentFilter === 'online') {
    hintEl.textContent = 'GTA 6 has no online trophies at launch — all 55 are single-player and offline.';
  } else if (searchText.trim()) {
    hintEl.textContent = `Showing ${shown} of ${total} trophies matching “${searchText.trim()}”.`;
  } else if (currentFilter === 'all') {
    hintEl.textContent = `Showing all ${total} trophies. Click a row for its guide and sources.`;
  } else {
    hintEl.textContent = `Showing ${shown} of ${total} trophies (${currentFilter}).`;
  }
  for (const t of rows) {
    const li = document.createElement('li');
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'trophy-row' + (earned.has(t.id) ? ' earned' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${isStoryHidden(t) ? 'hidden story trophy' : t.name} as earned`);
    box.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleEarned(t.id, box.checked);
    });
    const body = document.createElement('span');
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = isStoryHidden(t) ? '??? — hidden story trophy' : t.name;
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.style.display = 'block';
    desc.textContent = isStoryHidden(t) ? spoilerLabel(t) : t.description;
    const tags = document.createElement('span');
    tags.className = 'trophy-tags';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = t.kind;
    tags.appendChild(kindTag);
    if (t.count) {
      const countTag = document.createElement('span');
      countTag.className = 'tag';
      countTag.textContent = `× ${t.count.toLocaleString('en-US')}`;
      tags.appendChild(countTag);
    }
    if (t.missable) {
      const missTag = document.createElement('span');
      missTag.className = 'tag missable';
      missTag.textContent = 'MISSABLE';
      tags.appendChild(missTag);
    }
    if (t.hidden && !earned.has(t.id)) {
      const hidTag = document.createElement('span');
      hidTag.className = 'tag spoiler';
      hidTag.textContent = 'Hidden on PlayStation';
      tags.appendChild(hidTag);
    }
    body.append(name, desc, tags);
    const grade = document.createElement('span');
    grade.className = `grade ${t.grade}`;
    grade.textContent = t.grade;
    row.append(box, body, grade);
    row.addEventListener('click', () => openGuide(t));
    li.appendChild(row);
    listEl.appendChild(li);
  }
}

function renderAll() {
  updateProgress();
  renderRoadmap();
  renderChecklist();
}

function toggleEarned(id, on) {
  if (on) earned.add(id);
  else earned.delete(id);
  saveProgress();
  renderAll();
}

function openGuide(t) {
  detailBody.innerHTML = '';
  const title = document.createElement('h2');
  title.textContent = isStoryHidden(t) ? 'Hidden story trophy' : t.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = isStoryHidden(t)
    ? 'This story trophy stays hidden until you earn it. Tick it above to reveal its name and description.'
    : `Official: “${t.description}” — ${t.grade}${t.hidden ? ' · Hidden on PlayStation' : ''}${t.missable ? ' · Missable' : ''}`;
  const guideHeading = document.createElement('h3');
  guideHeading.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.textContent = isStoryHidden(t) ? spoilerLabel(t) : t.guide;
  const sourcesHeading = document.createElement('h3');
  sourcesHeading.textContent = 'Sources';
  const sourcesIntro = document.createElement('p');
  sourcesIntro.textContent = 'Each fact above comes from these sources. The guide is written in my own words — a source is cited, never copied.';
  const list = document.createElement('ul');
  for (const s of t.sources) {
    const li = document.createElement('li');
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = s.name;
      li.appendChild(a);
    } else {
      li.textContent = s.name;
    }
    list.appendChild(li);
  }
  const earnedBtn = document.createElement('button');
  earnedBtn.type = 'button';
  earnedBtn.textContent = earned.has(t.id) ? 'Mark as not earned' : 'Mark as earned';
  earnedBtn.addEventListener('click', () => {
    toggleEarned(t.id, !earned.has(t.id));
    openGuide(t);
  });
  detailBody.append(title, official, guideHeading, guide, sourcesHeading, sourcesIntro, list, earnedBtn);
  detailPanel.hidden = false;
  history.replaceState(null, '', `#guide-${t.id}`);
}

function closeGuide() {
  detailPanel.hidden = true;
  history.replaceState(null, '', location.pathname + location.search);
}

function exportProgress() {
  const payload = {
    app: 'gta6-trophy-guide',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    hideSpoilers,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (!Array.isArray(data.earned)) throw new Error('no earned list');
      const valid = new Set(trophies.map((t) => t.id));
      earned = new Set(data.earned.filter((n) => valid.has(n)));
      if (typeof data.hideSpoilers === 'boolean') {
        hideSpoilers = data.hideSpoilers;
        document.getElementById('spoilerToggle').checked = hideSpoilers;
      }
      saveProgress();
      renderAll();
      hintEl.textContent = `Imported progress: ${earned.size} trophies earned.`;
    } catch (err) {
      hintEl.textContent = 'That file is not a progress export from this guide — nothing was imported.';
    }
  };
  reader.readAsText(file);
}

async function loadTrophies() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`could not load ${DATA_URL}`);
  const data = await response.json();
  trophies = data.trophies;
}

function bindControls() {
  document.getElementById('filters').addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-filter]');
    if (!btn) return;
    currentFilter = btn.dataset.filter;
    for (const chip of document.querySelectorAll('#filters .chip')) {
      chip.classList.toggle('active', chip === btn);
    }
    renderChecklist();
  });
  document.getElementById('searchInput').addEventListener('input', (event) => {
    searchText = event.target.value;
    renderChecklist();
  });
  document.getElementById('spoilerToggle').addEventListener('change', (event) => {
    hideSpoilers = event.target.checked;
    saveProgress();
    renderAll();
  });
  document.getElementById('earnedOnlyToggle').addEventListener('change', (event) => {
    earnedOnly = event.target.checked;
    renderChecklist();
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) importProgress(file);
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (window.confirm('Reset all earned trophies? Your saved progress will be cleared.')) {
      earned = new Set();
      saveProgress();
      renderAll();
    }
  });
  document.getElementById('detailClose').addEventListener('click', closeGuide);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeGuide();
  });
}

function openFromHash() {
  const filterMatch = location.hash.match(/^#filter-(all|story|missable|collectibles|activities|online)$/);
  if (filterMatch) {
    currentFilter = filterMatch[1];
    for (const chip of document.querySelectorAll('#filters .chip')) {
      chip.classList.toggle('active', chip.dataset.filter === currentFilter);
    }
    renderChecklist();
    return;
  }
  const match = location.hash.match(/^#guide-(\d+)$/);
  if (match) {
    const t = trophyById(Number(match[1]));
    if (t) openGuide(t);
    return;
  }
  if (location.hash === '#roadmap') {
    const el = document.getElementById('roadmap');
    const jumpToRoadmap = () => {
      el.scrollIntoView({ block: 'start' });
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
    };
    jumpToRoadmap();
    // Re-assert after layout settles: the checklist renders below the
    // roadmap, and a late layout shift must not leave the view half-empty.
    setTimeout(jumpToRoadmap, 150);
  }
  if (location.hash === '#spoilers-on') {
    hideSpoilers = true;
    document.getElementById('spoilerToggle').checked = true;
  }
}

async function initTracker() {
  loadProgress();
  document.getElementById('spoilerToggle').checked = hideSpoilers;
  bindControls();
  await loadTrophies();
  renderAll();
  openFromHash();
}

initTracker().catch((err) => {
  listEl.innerHTML = '';
  emptyEl.hidden = false;
  emptyEl.textContent = 'The trophy data could not be loaded. Serve the app/ folder with a static server and reload.';
});
