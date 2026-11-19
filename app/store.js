// store.js — saved progress for the GTA 6 trophy tracker.
// Everything lives in localStorage under one key; export writes a file,
// import reads one back. No network, no cookies, no accounts.
export const STORAGE_KEY = "gta6-trophy-guide-v1";

export function emptyProgress() {
  return { earned: {}, counts: {}, spoiler: true, version: 1 };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyProgress();
    return {
      earned: parsed.earned && typeof parsed.earned === "object" ? parsed.earned : {},
      counts: parsed.counts && typeof parsed.counts === "object" ? parsed.counts : {},
      spoiler: parsed.spoiler !== false,
      version: 1,
    };
  } catch (err) {
    return emptyProgress();
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    // Storage full or unavailable (private mode): progress stays in memory.
  }
}

export function isEarned(progress, id) {
  return progress.earned[id] === true;
}

export function setEarned(progress, id, value) {
  if (value) progress.earned[id] = true;
  else delete progress.earned[id];
  saveProgress(progress);
}

export function countOf(progress, id) {
  const n = Number(progress.counts[id]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function setCount(progress, id, value, target) {
  const n = Math.max(0, Math.min(target || 0, Math.floor(Number(value) || 0)));
  if (n > 0) progress.counts[id] = n;
  else delete progress.counts[id];
  if (target && n >= target) progress.earned[id] = true;
  saveProgress(progress);
}

export function earnedTotal(progress, trophies) {
  return trophies.filter((t) => isEarned(progress, t.id)).length;
}

export function exportFileName() {
  const stamp = new Date().toISOString().slice(0, 10);
  return "gta6-trophies-progress-" + stamp + ".json";
}

export function serializeProgress(progress) {
  return JSON.stringify({ app: "gta6-trophy-guide", version: 1, exportedAt: new Date().toISOString(), progress }, null, 2);
}

export function parseImportedProgress(text, knownIds) {
  const data = JSON.parse(text);
  const raw = data && data.progress ? data.progress : data;
  if (!raw || typeof raw !== "object") throw new Error("not a progress file");
  const out = emptyProgress();
  if (raw.earned) {
    for (const id of Object.keys(raw.earned)) {
      if (knownIds.has(id) && raw.earned[id]) out.earned[id] = true;
    }
  }
  if (raw.counts) {
    for (const id of Object.keys(raw.counts)) {
      const n = Math.floor(Number(raw.counts[id]));
      if (knownIds.has(id) && Number.isFinite(n) && n > 0) out.counts[id] = n;
    }
  }
  if (typeof raw.spoiler === "boolean") out.spoiler = raw.spoiler;
  return out;
}
