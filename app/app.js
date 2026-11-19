// app.js — boots the GTA 6 trophy guide: loads the local data files, routes
// the hash (tracker, roadmap, missables, one trophy), and wires the toolbar.
import {
  loadProgress,
  saveProgress,
  setEarned,
  setCount,
  countOf,
  isEarned,
  earnedTotal,
  serializeProgress,
  parseImportedProgress,
  exportFileName,
} from "./store.js";
import {
  KIND_LABELS,
  renderTrophyList,
  renderTrophyDetail,
  renderRoadmap,
  renderMissables,
} from "./views.js";

const view = document.getElementById("view");
const toolbar = document.getElementById("toolbar");
const searchInput = document.getElementById("search");
const kindChips = document.getElementById("kind-chips");
const gradeSelect = document.getElementById("grade");
const spoilerToggle = document.getElementById("spoiler-toggle");
const earnedOnlyToggle = document.getElementById("earned-only");
const shareNote = document.getElementById("share-note");

let trophies = [];
let roadmap = null;
let progress = loadProgress();
let sharedOverride = null;
let filters = { kind: "all", grade: "", query: "", earnedOnly: false };

function activeProgress() {
  return sharedOverride || progress;
}

function parseHash() {
  const raw = location.hash.replace(/^#/, "");
  const [pathPart, queryPart] = raw.split("?");
  const params = new URLSearchParams(queryPart || "");
  const parts = pathPart.split("/").filter(Boolean);
  return { parts, params };
}

function route() {
  const { parts, params } = parseHash();
  const section = parts[0] || "";
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", (tab.dataset.route || "") === section);
  });
  toolbar.style.display = section === "" || section === "trophy" ? "" : "none";
  if (params.get("spoiler") === "on" || params.get("spoiler") === "off") {
    progress.spoiler = params.get("spoiler") === "on";
    spoilerToggle.checked = progress.spoiler;
    saveProgress(progress);
  }
  if (params.get("kind") && KIND_LABELS[params.get("kind")]) {
    filters.kind = params.get("kind");
    buildKindChips();
  }
  if (params.get("earned")) {
    const ids = params.get("earned").split(",").filter((id) => trophies.some((t) => t.id === id));
    if (ids.length) {
      sharedOverride = JSON.parse(JSON.stringify(progress));
      sharedOverride.earned = {};
      for (const id of ids) sharedOverride.earned[id] = true;
      shareNote.hidden = false;
      shareNote.innerHTML =
        "Viewing shared progress (" + ids.length + " trophies) — it is shown in memory only. " +
        '<button type="button" id="keep-shared">Keep this progress</button>';
      const keep = document.getElementById("keep-shared");
      if (keep) {
        keep.addEventListener("click", () => {
          progress = sharedOverride;
          sharedOverride = null;
          saveProgress(progress);
          shareNote.hidden = true;
          render();
        });
      }
    }
  }
  if (section === "roadmap") renderRoadmap(view, roadmap, trophies, activeProgress());
  else if (section === "missables") renderMissables(view, roadmap, trophies);
  else if (section === "trophy" && parts[1]) {
    const trophy = trophies.find((t) => t.id === parts[1]);
    if (trophy) renderTrophyDetail(view, trophy, activeProgress());
    else renderTrophyList(view, trophies, activeProgress(), filters);
  } else {
    renderTrophyList(view, trophies, activeProgress(), filters);
  }
  updateProgressBar();
}

function updateProgressBar() {
  const total = trophies.length;
  const earned = earnedTotal(activeProgress(), trophies);
  const pct = total ? Math.round((earned / total) * 100) : 0;
  const fill = document.getElementById("progress-fill");
  const text = document.getElementById("progress-text");
  if (fill) fill.style.width = pct + "%";
  if (text) {
    text.textContent =
      earned + " of " + total + " trophies earned (" + pct + "%) — " +
      (earned === total ? "Platinum: Vice Got a Price! is yours." : (total - earned) + " to go until the Platinum.");
  }
}

function buildKindChips() {
  const kinds = ["all", "story", "missable", "collectibles", "activities", "online", "platinum", "completion"];
  kindChips.innerHTML = kinds
    .map(
      (k) =>
        '<button type="button" class="chip' + (filters.kind === k ? " active" : "") + '" data-kind="' + k + '">' +
        KIND_LABELS[k] +
        "</button>"
    )
    .join("");
}

function render() {
  route();
}

async function loadData() {
  const [trophyRes, roadmapRes] = await Promise.all([
    fetch("data/trophies.json"),
    fetch("data/roadmap.json"),
  ]);
  if (!trophyRes.ok || !roadmapRes.ok) throw new Error("could not load local data");
  const trophyDoc = await trophyRes.json();
  trophies = trophyDoc.trophies;
  roadmap = await roadmapRes.json();
}

function wireToolbar() {
  buildKindChips();
  kindChips.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-kind]");
    if (!chip) return;
    filters.kind = chip.dataset.kind;
    buildKindChips();
    render();
  });
  searchInput.addEventListener("input", () => {
    filters.query = searchInput.value.trim();
    render();
  });
  gradeSelect.addEventListener("change", () => {
    filters.grade = gradeSelect.value;
    render();
  });
  spoilerToggle.checked = progress.spoiler;
  spoilerToggle.addEventListener("change", () => {
    progress.spoiler = spoilerToggle.checked;
    saveProgress(progress);
    render();
  });
  earnedOnlyToggle.addEventListener("change", () => {
    filters.earnedOnly = earnedOnlyToggle.checked;
    render();
  });
  document.getElementById("export-btn").addEventListener("click", () => {
    const blob = new Blob([serializeProgress(activeProgress())], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFileName();
    a.click();
    URL.revokeObjectURL(url);
  });
  const importFile = document.getElementById("import-file");
  document.getElementById("import-btn").addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", async () => {
    const file = importFile.files && importFile.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      progress = parseImportedProgress(text, new Set(trophies.map((t) => t.id)));
      sharedOverride = null;
      shareNote.hidden = true;
      spoilerToggle.checked = progress.spoiler;
      saveProgress(progress);
      render();
    } catch (err) {
      view.innerHTML = '<p class="empty">That file is not a progress export from this guide. Nothing was changed.</p>';
    }
    importFile.value = "";
  });
  document.getElementById("reset-btn").addEventListener("click", () => {
    if (window.confirm("Reset all earned trophies and counts?")) {
      const spoiler = progress.spoiler;
      progress = { earned: {}, counts: {}, spoiler, version: 1 };
      sharedOverride = null;
      shareNote.hidden = true;
      saveProgress(progress);
      render();
    }
  });
  view.addEventListener("change", (event) => {
    const box = event.target.closest("[data-earn]");
    if (!box) return;
    const target = activeProgress();
    setEarned(target, box.dataset.earn, box.checked);
    if (sharedOverride) saveProgress(progress);
    render();
  });
  view.addEventListener("click", (event) => {
    const inc = event.target.closest("[data-inc]");
    const dec = event.target.closest("[data-dec]");
    const btn = inc || dec;
    if (!btn) return;
    const trophyId = inc ? inc.dataset.inc : dec.dataset.dec;
    const trophy = trophies.find((t) => t.id === trophyId);
    if (!trophy || !trophy.count) return;
    const target = activeProgress();
    const next = countOf(target, trophy.id) + (inc ? 1 : -1);
    setCount(target, trophy.id, next, trophy.count);
    render();
  });
}

async function main() {
  wireToolbar();
  try {
    await loadData();
  } catch (err) {
    view.innerHTML = '<p class="empty">The trophy data could not be loaded. Serve the app/ folder over HTTP and reload.</p>';
    return;
  }
  window.addEventListener("hashchange", render);
  render();
}

main();
