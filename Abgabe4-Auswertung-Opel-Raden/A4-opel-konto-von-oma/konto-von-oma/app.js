"use strict";

let rows = [];            // {datum:'YYYY-MM-DD', text, kat, betrag}
let currentFile = "";
let nameMode = false;     // false = "Alle", true = "Name selbst eingeben"
let sortKey = "datum";
let sortDir = -1;         // -1 = neueste zuerst

const $ = (id) => document.getElementById(id);
const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = (iso) => iso.split("-").reverse().join(".");

/* ---------- CSV einlesen ---------- */

function parseCSV(text, delim) {
  const out = [];
  let row = [], cell = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else inQ = false;
      } else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === delim) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      out.push(row); row = [];
    } else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); out.push(row); }
  return out;
}

function parseAmount(s) {
  s = String(s).replace(/[€\s]/g, "");
  if (!s) return NaN;
  const lc = s.lastIndexOf(","), ld = s.lastIndexOf(".");
  if (lc > -1 && ld > -1) {
    s = lc > ld ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lc > -1) s = s.replace(",", ".");
  return parseFloat(s);
}

function parseDate(s) {
  s = String(s).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (m) {
    const y = m[3].length === 2 ? "20" + m[3] : m[3];
    return `${y}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  }
  return null;
}

function loadCSV(text) {
  text = text.replace(/^\uFEFF/, "");
  const firstLines = text.split(/\r?\n/).filter((l) => l.replace(/[,;\s]/g, "") !== "").slice(0, 3).join("\n");
  const delim = (firstLines.match(/;/g) || []).length > (firstLines.match(/,/g) || []).length ? ";" : ",";

  const all = parseCSV(text, delim).filter((r) => r.some((c) => c.trim() !== ""));
  if (!all.length) throw new Error("Die Datei ist leer.");

  // Kopfzeile = erste Zeile mit "datum" bzw. "betrag"
  let hi = all.findIndex((r) => r.some((c) => /datum|date/i.test(c)) && r.some((c) => /betrag|amount/i.test(c)));
  if (hi < 0) hi = 0;
  const head = all[hi].map((h) => h.trim().toLowerCase());
  const idx = (re) => head.findIndex((h) => re.test(h));
  const iD = idx(/datum|date/), iT = idx(/text|beschreib|verwendung|empf/), iK = idx(/kategor/), iB = idx(/betrag|amount/);
  const iN = idx(/transaktion|transaction|trans.*(nr|id)|^id$/);
  if (iD < 0 || iB < 0) throw new Error("Spalten 'Datum' und 'Betrag' nicht gefunden.");

  const res = [];
  let skipped = 0;
  for (const r of all.slice(hi + 1)) {
    const datum = parseDate(r[iD] || "");
    const betrag = parseAmount(r[iB] || "");
    if (!datum || isNaN(betrag)) { skipped++; continue; }
    res.push({
      datum,
      text: (iT >= 0 ? r[iT] : "").trim(),
      kat: (iK >= 0 ? r[iK] : "").trim(),
      betrag,
      tnr: (iN >= 0 ? r[iN] || "" : "").trim(),
    });
  }
  return { res, skipped };
}

/* ---------- Abfrage ---------- */

function filtered() {
  const q = nameMode ? $("fText").value.trim().toLowerCase() : "";
  const kat = $("fKat").value, art = $("fArt").value;
  const von = $("fVon").value, bis = $("fBis").value;
  const list = rows.filter((r) =>
    (!q || r.text.toLowerCase().includes(q) || r.tnr.toLowerCase().includes(q)) &&
    (!kat || r.kat === kat) &&
    (art !== "aus" || r.betrag < 0) &&
    (art !== "ein" || r.betrag > 0) &&
    (!von || r.datum >= von) &&
    (!bis || r.datum <= bis)
  );
  const get = { datum: (r) => r.datum, text: (r) => r.text.toLowerCase(), kat: (r) => r.kat.toLowerCase(), betrag: (r) => r.betrag, tnr: (r) => r.tnr }[sortKey];
  list.sort((a, b) => (get(a) > get(b) ? 1 : get(a) < get(b) ? -1 : 0) * sortDir);
  return list;
}

function rowHTML(r) {
  return `<tr><td>${fmtDate(r.datum)}</td><td>${esc(r.text)}</td><td>${esc(r.kat)}</td>` +
    `<td class="num ${r.betrag < 0 ? "neg" : "pos"}">${eur.format(r.betrag)}</td>` +
    `<td class="tnr">${esc(r.tnr)}</td></tr>`;
}

function tableHTML(list, withFoot) {
  const sum = list.reduce((s, r) => s + r.betrag, 0);
  const body = list.map(rowHTML).join("") || `<tr><td colspan="5">Keine Treffer.</td></tr>`;
  const foot = withFoot ? `<tfoot><tr><td colspan="3">Summe (${list.length} Einträge)</td><td class="num">${eur.format(sum)}</td><td></td></tr></tfoot>` : "";
  return `<table><thead><tr><th>Datum</th><th>Buchungstext</th><th>Kategorie</th><th class="num">Betrag</th><th>Transaktionsnr.</th></tr></thead><tbody>${body}</tbody>${foot}</table>`;
}

function render() {
  const list = filtered();
  const inc = list.filter((r) => r.betrag > 0).reduce((s, r) => s + r.betrag, 0);
  const out = list.filter((r) => r.betrag < 0).reduce((s, r) => s + r.betrag, 0);
  $("sCount").textContent = list.length;
  $("sSum").textContent = eur.format(inc + out);
  $("sIn").textContent = eur.format(inc);
  $("sOut").textContent = eur.format(out);
  $("tbl").querySelector("tbody").innerHTML = list.map(rowHTML).join("") || `<tr><td colspan="5">Keine Treffer.</td></tr>`;
}

function openPopup() {
  const list = filtered();
  const q = nameMode ? $("fText").value.trim() : "";
  const kat = $("fKat").value;
  const titel = [q && `„${q}"`, kat, $("fVon").value && `ab ${fmtDate($("fVon").value)}`, $("fBis").value && `bis ${fmtDate($("fBis").value)}`]
    .filter(Boolean).join(" · ");
  $("popTitle").textContent = "Auflistung" + (titel ? ": " + titel : " (alle Einträge)");
  $("popBody").innerHTML = tableHTML(list, true);
  $("popup").showModal();
}

// Alle Zeilen der geladenen CSV, unabhängig von den Filtern (nach Datum aufsteigend)
function openAll() {
  const list = [...rows].sort((a, b) => (a.datum > b.datum ? 1 : a.datum < b.datum ? -1 : 0));
  $("popTitle").textContent = "Komplette CSV" + (currentFile ? ": " + currentFile : "") + ` (${list.length} Einträge)`;
  $("popBody").innerHTML = rows.length ? tableHTML(list, true) : "<p>Bitte zuerst eine CSV laden.</p>";
  $("popup").showModal();
}

function fillCategories() {
  const cats = [...new Set(rows.map((r) => r.kat).filter(Boolean))].sort((a, b) => a.localeCompare(b, "de"));
  $("fKat").innerHTML = `<option value="">Alle</option>` + cats.map((c) => `<option>${esc(c)}</option>`).join("");
}

/* ---------- Events ---------- */

$("csvFile").addEventListener("change", async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const { res, skipped } = loadCSV(await f.text());
    rows = res;
    currentFile = f.name;
    fillCategories();
    $("status").textContent = `${f.name}: ${rows.length} Einträge geladen` + (skipped ? ` (${skipped} Zeilen übersprungen)` : "");
    render();
  } catch (err) {
    $("status").textContent = "Fehler: " + err.message;
  }
});

["fText", "fKat", "fArt", "fVon", "fBis"].forEach((id) => $(id).addEventListener("input", render));
const DEFAULT_VON = "2026-04-01", DEFAULT_BIS = "2026-09-30";
function resetFilters() {
  ["fText", "fKat", "fArt"].forEach((id) => ($(id).value = ""));
  setMode(false);
  $("fVon").value = DEFAULT_VON;   // Voreinstellung 01.04.2026
  $("fBis").value = DEFAULT_BIS;   // bis 30.09.2026
}
$("fReset").addEventListener("click", () => { resetFilters(); render(); });
$("openPopup").addEventListener("click", openPopup);
$("openAll").addEventListener("click", openAll);
$("closePopup").addEventListener("click", () => $("popup").close());
$("popup").addEventListener("click", (e) => { if (e.target === $("popup")) $("popup").close(); });

document.querySelectorAll("th[data-sort]").forEach((th) =>
  th.addEventListener("click", () => {
    const k = th.dataset.sort;
    sortDir = sortKey === k ? -sortDir : 1;
    sortKey = k;
    render();
  })
);

// Auswahl: "Alle" oder "Name selbst eingeben"
function setMode(name) {
  nameMode = name;
  $("modeAll").classList.toggle("active", !name);
  $("modeName").classList.toggle("active", name);
  $("nameWrap").hidden = !name;
  if (name) $("fText").focus();
}
$("modeAll").addEventListener("click", () => { $("fText").value = ""; setMode(false); render(); });
$("modeName").addEventListener("click", () => { setMode(true); render(); });

resetFilters();
render();
