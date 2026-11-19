// views.js — renders the tracker list, trophy detail, roadmap and missables.
// All markup is built from the local data files; nothing is fetched at run
// time except data/trophies.json and data/roadmap.json, both under app/.
import { isEarned, countOf } from "./store.js";

export const KIND_LABELS = {
  all: "All",
  story: "Story",
  missable: "Missable",
  collectibles: "Collectibles",
  activities: "Activities",
  online: "Online",
  platinum: "Platinum",
  completion: "100%",
};

export function kindBadge(kind) {
  // The platinum trophy's grade badge already says Platinum, and a missable
  // trophy already carries the red Missable badge: showing the kind badge
  // too would print the same word twice.
  if (kind === "platinum" || kind === "missable") return "";
  return ' <span class="badge kind">' + escapeHtml(KIND_LABELS[kind] || kind) + "</span>";
}

export function gradeBadge(grade) {
  return '<span class="badge ' + grade.toLowerCase() + '">' + escapeHtml(grade) + "</span>";
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function spoilerHidden(trophy, progress) {
  return progress.spoiler && trophy.kind === "story" && !isEarned(progress, trophy.id);
}

export function trophyCard(trophy, progress) {
  const earned = isEarned(progress, trophy.id);
  const hidden = spoilerHidden(trophy, progress);
  const name = hidden ? "Hidden story trophy" : trophy.name;
  const desc = hidden
    ? "Complete the story to reveal this trophy. It stays hidden until you earn it."
    : trophy.description;
  const classes = ["trophy"];
  if (earned) classes.push("earned");
  if (trophy.missable) classes.push("missable-flag");
  let meta = gradeBadge(trophy.grade);
  if (trophy.hidden) meta += ' <span class="badge hidden-t">Hidden on PS</span>';
  if (trophy.missable) meta += ' <span class="badge missable">Missable</span>';
  meta += kindBadge(trophy.kind);
  let counter = "";
  if (trophy.count) {
    const n = countOf(progress, trophy.id);
    const pct = Math.min(100, Math.round((n / trophy.count) * 100));
    counter =
      '<div class="counter"><button type="button" data-dec="' + trophy.id + '" aria-label="Decrease count">−</button>' +
      '<span><strong>' + n + "</strong> / " + trophy.count + "</span>" +
      '<button type="button" data-inc="' + trophy.id + '" aria-label="Increase count">+</button>' +
      '<span class="count-bar"><span class="count-fill" style="width:' + pct + '%"></span></span></div>';
  }
  return (
    '<li class="' + classes.join(" ") + '">' +
    '<input type="checkbox" data-earn="' + trophy.id + '"' + (earned ? " checked" : "") + ' aria-label="Mark ' + escapeHtml(name) + ' as earned">' +
    '<div><h3 class="trophy-name"><a href="#/trophy/' + trophy.id + '">' + escapeHtml(name) + "</a></h3>" +
    '<p class="trophy-desc">' + escapeHtml(desc) + "</p>" +
    '<div class="trophy-meta">' + meta + "</div>" + counter + "</div>" +
    "<div></div></li>"
  );
}

export function renderTrophyList(view, trophies, progress, filters) {
  const shown = trophies.filter((t) => {
    if (filters.kind && filters.kind !== "all" && t.kind !== filters.kind) return false;
    if (filters.grade && t.grade !== filters.grade) return false;
    if (filters.earnedOnly && !isEarned(progress, t.id)) return false;
    if (filters.query) {
      const hay = (t.name + " " + t.description + " " + t.guide).toLowerCase();
      if (!hay.includes(filters.query.toLowerCase())) return false;
    }
    return true;
  });
  const earned = trophies.filter((t) => isEarned(progress, t.id)).length;
  let html = '<p class="count-line">Showing <strong>' + shown.length + " of " + trophies.length + "</strong> trophies";
  if (filters.kind === "online") html += " — GTA 6 has no online trophies: all 55 are single-player";
  html += ". Earned so far: <strong>" + earned + " / " + trophies.length + "</strong>.</p>";
  if (!shown.length) {
    html += '<p class="empty">No trophies match these filters. Try clearing the search or picking another kind.</p>';
  } else {
    html += '<ul class="trophy-list">' + shown.map((t) => trophyCard(t, progress)).join("") + "</ul>";
  }
  view.innerHTML = html;
}

export function renderTrophyDetail(view, trophy, progress) {
  const earned = isEarned(progress, trophy.id);
  const sources = trophy.sources
    .map((s) => '<li><a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' + escapeHtml(s.name) + "</a></li>")
    .join("");
  let warn = "";
  if (trophy.missable) {
    warn =
      '<div class="callout"><strong>Missable — read this first.</strong> ' +
      escapeHtml(
        "Lucia's balcony meditation in Chapter 1 counts toward this trophy and disappears after that chapter. " +
          "Do it in Chapter 1 and keep a Chapter 1 save until the trophy pops."
      ) + "</div>";
  }
  view.innerHTML =
    '<article class="detail"><a class="back" href="#/">&larr; Back to the tracker</a>' +
    "<h2>" + escapeHtml(trophy.name) + "</h2>" +
    '<p class="official">Official description (' + escapeHtml(trophy.grade) + "): &ldquo;" + escapeHtml(trophy.description) + "&rdquo;</p>" +
    '<div class="trophy-meta">' + gradeBadge(trophy.grade) +
    (trophy.hidden ? ' <span class="badge hidden-t">Hidden on PS</span>' : "") +
    (trophy.missable ? ' <span class="badge missable">Missable</span>' : "") +
    kindBadge(trophy.kind) +
    (trophy.count ? ' <span class="badge">Count: ' + trophy.count + "</span>" : "") +
    "</div>" +
    '<p><label class="toggle"><input type="checkbox" data-earn="' + trophy.id + '"' + (earned ? " checked" : "") + "> I have earned this trophy</label></p>" +
    warn +
    "<h3>How to earn it</h3><p>" + escapeHtml(trophy.guide) + "</p>" +
    "<h3>Sources</h3><ul class=\"sources\">" + sources + "</ul>" +
    "<p>Every guide on this page is written in our own words for this guide. A source is cited, never copied.</p></article>";
}

export function renderRoadmap(view, roadmap, trophies, progress) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  let html = "<h2>" + escapeHtml(roadmap.title) + "</h2><p>" + escapeHtml(roadmap.subtitle) + "</p>";
  html += '<div class="callout"><strong>Save warning.</strong> ' + escapeHtml(roadmap.saveWarning) + "</div>";
  for (const stage of roadmap.stages) {
    const done = stage.trophies.filter((id) => isEarned(progress, id)).length;
    html += '<section class="roadmap-stage"><h2>Stage ' + stage.n + " — " + escapeHtml(stage.title) + "</h2>";
    html += '<p class="when">' + escapeHtml(stage.when) + " · " + done + " / " + stage.trophies.length + " trophies in this stage earned</p><ul>";
    for (const note of stage.notes) html += "<li>" + escapeHtml(note) + "</li>";
    html += "</ul><div class=\"stage-trophies\">";
    for (const id of stage.trophies) {
      const t = byId.get(id);
      if (!t) continue;
      html += '<a href="#/trophy/' + t.id + '"' + (isEarned(progress, id) ? ' class="done"' : "") + ">" + escapeHtml(t.name) + "</a>";
    }
    html += "</div></section>";
  }
  view.innerHTML = html;
}

export function renderMissables(view, roadmap, trophies) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  let html = "<h2>Missables &amp; saves</h2>";
  html += "<p>Only one trophy can be missed outright — but two habits protect the whole list: a manual save at the start of every chapter, and never testing cheats on your trophy save.</p>";
  html += '<div class="callout"><strong>Save warning.</strong> ' + escapeHtml(roadmap.saveWarning) + "</div>";
  for (const m of roadmap.missables) {
    const t = byId.get(m.id);
    html += '<section class="roadmap-stage"><h2>' + escapeHtml(m.risk) + "</h2>";
    if (t) {
      html += '<p><a href="#/trophy/' + t.id + '">' + escapeHtml(t.name) + "</a> — " + escapeHtml(t.description) + "</p>";
    }
    html += "<p>" + escapeHtml(m.why) + "</p></section>";
  }
  html += '<p class="count-line">Sources: ' + roadmap.sources.map((s) => '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' + escapeHtml(s.name) + "</a>").join(" · ") + ".</p>";
  view.innerHTML = html;
}
