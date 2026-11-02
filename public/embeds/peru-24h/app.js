const DAY = 1440;
const params = new URLSearchParams(location.search);
const record = params.has("record");
if (record) document.body.classList.add("record");

const STRINGS = {
  es: {
    title: "Un miércoles de buses interregionales y trenes en el Perú", buses: "buses en ruta", trains: "trenes en ruta", trainOne: "tren en ruta",
    play: "Play", pause: "Pausa", reset: "Vista inicial", fullscreen: "Pantalla completa", train: "tren",
    credits: "Buses: horarios de 8 operadores (11/11/2026) y autorizaciones de ruta del MTC. Trenes: PeruRail.",
    gestures: ["Usa Ctrl + rueda para hacer zoom", "Usa ⌘ + rueda para hacer zoom", "Usa dos dedos para mover el mapa"],
  },
  en: {
    title: "One Wednesday of intercity buses and trains in Peru", buses: "buses on the road", trains: "trains running", trainOne: "train running",
    play: "Play", pause: "Pause", reset: "Reset view", fullscreen: "Fullscreen", train: "train",
    credits: "Buses: timetables of 8 operators (11 Nov 2026) and MTC route permits. Trains: PeruRail.",
    gestures: ["Use Ctrl + scroll to zoom the map", "Use ⌘ + scroll to zoom the map", "Use two fingers to move the map"],
  },
  fr: {
    title: "Un mercredi de bus interrégionaux et de trains au Pérou", buses: "bus sur la route", trains: "trains en circulation", trainOne: "train en circulation",
    play: "Lecture", pause: "Pause", reset: "Vue initiale", fullscreen: "Plein écran", train: "train",
    credits: "Bus : horaires de 8 compagnies (11/11/2026) et autorisations de ligne du MTC. Trains : PeruRail.",
    gestures: ["Ctrl + molette pour zoomer", "⌘ + molette pour zoomer", "Deux doigts pour déplacer la carte"],
  },
  pt: {
    title: "Uma quarta-feira de ônibus interregionais e trens no Peru", buses: "ônibus na estrada", trains: "trens em circulação", trainOne: "trem em circulação",
    play: "Play", pause: "Pausar", reset: "Vista inicial", fullscreen: "Tela cheia", train: "trem",
    credits: "Ônibus: horários de 8 empresas (11/11/2026) e autorizações de linha do MTC. Trens: PeruRail.",
    gestures: ["Use Ctrl + roda para dar zoom", "Use ⌘ + roda para dar zoom", "Use dois dedos para mover o mapa"],
  },
};
const lang = STRINGS[params.get("lang")] ? params.get("lang") : "es";
const T = STRINGS[lang];
document.documentElement.lang = lang;
document.getElementById("title").textContent = T.title;
document.getElementById("lbus").textContent = T.buses;
document.getElementById("credits").textContent = T.credits;
for (const [id, key] of [["reset", "reset"], ["fullscreen", "fullscreen"]]) {
  const b = document.getElementById(id);
  b.title = T[key];
  b.setAttribute("aria-label", T[key]);
}

// Default framing: the central and southern corridors, from Trujillo down to Lake Titicaca.
// Portrait screens can't fit that box legibly, so they get the whole country instead.
const WIDE_BOUNDS = [[-82.77, -17.08], [-63.78, -7.76]];
const TALL_BOUNDS = [[-81.4, -18.4], [-68.6, -3.4]];
const homeBounds = () => (innerWidth / innerHeight >= 1.2 ? WIDE_BOUNDS : TALL_BOUNDS);
const HOME_PADDING = { top: 0, left: 0, right: 0, bottom: 52 };

// A typical day repeats: trips running past midnight also appear the morning before.
function wrap(trips) {
  const out = [];
  for (const t of trips) {
    out.push(t);
    if (t.ts[t.ts.length - 1] > DAY) out.push({ ...t, ts: t.ts.map(x => x - DAY) });
  }
  return out;
}

// Position of a trip at time `now`, interpolated between its timestamped path points.
function position(trip, now) {
  const ts = trip.ts;
  let lo = 0, hi = ts.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (ts[mid] <= now) lo = mid; else hi = mid; }
  const f = ts[hi] === ts[lo] ? 0 : (now - ts[lo]) / (ts[hi] - ts[lo]);
  const a = trip.path[lo], b = trip.path[hi];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

const hhmm = x => { x = ((Math.round(x) % DAY) + DAY) % DAY; return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`; };
const titleCase = s => s.toLowerCase().replace(/(^|[\s.])\S/g, c => c.toUpperCase());
const escapeHtml = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Shared road paths -> per-trip path + timestamps, time spread along the road by distance.
function expand({ routes, trips }) {
  const fractions = routes.map(path => {
    const acc = [0];
    for (let i = 1; i < path.length; i++) {
      const [x0, y0] = path[i - 1], [x1, y1] = path[i];
      acc.push(acc[i - 1] + Math.hypot((x1 - x0) * Math.cos(y0 * Math.PI / 180), y1 - y0));
    }
    const total = acc[acc.length - 1] || 1;
    return acc.map(d => d / total);
  });
  return trips.map(t => ({ ...t, path: routes[t.route], ts: fractions[t.route].map(f => t.dep + (t.end - t.dep) * f) }));
}

maplibregl.workerUrl = new URL("vendor/maplibre-gl-csp-worker.js", location.href).href;

Promise.all(["trips.json", "trains.json", "cities.json"].map(f => fetch(f).then(r => r.json()))).then(([busData, trains, places]) => {
  let buses = expand(busData);
  for (const b of buses) { b.fromName = places.names[b.from] || b.from; b.toName = places.names[b.to] || b.to; }
  for (const r of trains) { r.fromName = r.from; r.toName = r.to; }
  const cities = places.cities.filter(c => c.n >= 5);
  buses = wrap(buses);
  trains = wrap(trains);

  const map = new maplibregl.Map({
    container: "map",
    style: new URL("basemap-style.json", location.href).href,
    ...(record ? { center: [-75.6, -10.2], zoom: 5.45 } : { bounds: homeBounds(), fitBoundsOptions: { padding: HOME_PADDING } }),
    interactive: !record,
    // Inside a blog post, plain scrolling must keep scrolling the page.
    cooperativeGestures: params.has("embed"),
    locale: {
      "CooperativeGesturesHandler.WindowsHelpText": T.gestures[0],
      "CooperativeGesturesHandler.MacHelpText": T.gestures[1],
      "CooperativeGesturesHandler.MobileHelpText": T.gestures[2],
    },
    attributionControl: false,
    dragRotate: false,
    pitchWithRotate: false,
  });
  map.touchZoomRotate.disableRotation();
  if (!record) map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

  const overlay = new deck.MapboxOverlay({
    layers: [],
    getTooltip: ({ object: d }) => d && d.ts && {
      html: `<b>${escapeHtml(d.fromName)} → ${escapeHtml(d.toName)}</b><br>${d.train ? `PeruRail · ${T.train} ${d.train}` : escapeHtml(titleCase(d.op))}<br>${hhmm(d.ts[0])} → ${hhmm(d.ts[d.ts.length - 1])}`,
      style: { background: "#1c222c", color: "#e8e6e3", padding: "8px 10px" },
    },
  });
  map.addControl(overlay);

  let t = Number(params.get("t") || 0), playing = !params.has("paused"), last = performance.now(), visible = true;
  const speed = document.getElementById("speed"), scrub = document.getElementById("scrub"), play = document.getElementById("play");
  const showPlay = () => { play.textContent = playing ? T.pause : T.play; };
  showPlay();
  play.onclick = () => { playing = !playing; showPlay(); };
  scrub.oninput = () => { t = Number(scrub.value); };
  document.getElementById("reset").onclick = () => map.fitBounds(homeBounds(), { padding: HOME_PADDING, duration: 800 });
  const fs = document.getElementById("fullscreen");
  if (!document.fullscreenEnabled) fs.hidden = true;
  fs.onclick = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  // Stop animating while the widget is scrolled out of view.
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(document.getElementById("map"));
  // Frame-by-frame video rendering: resolves once the frame for time `x` has been drawn.
  window.setTime = x => new Promise(res => { t = x; map.once("idle", () => res()); map.triggerRepaint(); });
  map.once("idle", () => { window.ready = true; });

  const BUS = [255, 176, 0], TRAIN = [58, 209, 255];
  const active = (list, now) => list.filter(x => x.ts[0] <= now && now <= x.ts[x.ts.length - 1]);
  const trail = (id, data, color) => new deck.TripsLayer({
    id, data, getPath: d => d.path, getTimestamps: d => d.ts, getColor: [...color, 70],
    widthMinPixels: 1.5, trailLength: 25, currentTime: t, fadeTrail: true, capRounded: true, jointRounded: true,
  });
  const dots = (id, data, color, radius) => new deck.ScatterplotLayer({
    id, data, getPosition: d => position(d, t), getFillColor: color, radiusUnits: "pixels", getRadius: radius,
    stroked: true, getLineColor: [11, 14, 20, 200], lineWidthUnits: "pixels", getLineWidth: 0.6,
    pickable: !record, updateTriggers: { getPosition: t },
  });
  const labelSize = d => (d.n >= 100 ? 15 : d.n >= 25 ? 13 : 11) * (record ? 1.3 : 1);
  // Greedy declutter in screen space: busiest cities first, labels flip left near the right edge.
  function placeLabels() {
    const width = map.getContainer().clientWidth;
    // The HUD and control bar sit on top of the map: labels there would be unreadable.
    const placed = ["hud", "controls", "source"].map(id => document.getElementById(id).getBoundingClientRect())
      .filter(r => r.width && getComputedStyle(document.getElementById("controls")).display !== "none")
      .map(r => [r.left, r.top, r.right, r.bottom]);
    for (const c of cities) {
      const p = map.project(c.pos), s = labelSize(c), w = c.name.length * s * 0.62 + 8, h = s * 1.3;
      const left = p.x + w > width - 8;
      const box = [left ? p.x - w : p.x, p.y - h / 2, left ? p.x : p.x + w, p.y + h / 2];
      if (placed.some(b => box[0] < b[2] && b[0] < box[2] && box[1] < b[3] && b[1] < box[3])) continue;
      placed.push(box);
      c.left = left;
      c.shown = true;
    }
    return cities.filter(c => c.shown && !(c.shown = false));
  }
  let labels = [];
  const cityLayers = () => [
    new deck.ScatterplotLayer({
      id: "city-dots", data: cities, getPosition: d => d.pos, radiusUnits: "pixels", getRadius: 2.2, getFillColor: [232, 230, 227, 200],
    }),
    new deck.TextLayer({
      id: "city-names", data: labels, getPosition: d => d.pos, getText: d => d.name, getSize: labelSize,
      getColor: d => d.n >= 25 ? [232, 230, 227, 235] : [170, 175, 185, 210],
      getTextAnchor: d => d.left ? "end" : "start", getAlignmentBaseline: "center", getPixelOffset: d => [d.left ? -6 : 6, 0],
      fontFamily: "system-ui, sans-serif", fontWeight: 600, characterSet: "auto",
      fontSettings: { sdf: true }, outlineWidth: 3, outlineColor: [11, 14, 20, 255],
    }),
  ];
  let drawn = -1;
  const relabel = () => { labels = placeLabels(); drawn = -1; };
  map.on("moveend", relabel);
  map.once("load", relabel);

  function frame(now) {
    // In record mode one real second = 10 minutes, so a day lasts 2'24".
    const rate = record ? 10 : Number(speed.value);
    if (playing && visible) t = (t + rate * (now - last) / 1000) % DAY;
    last = now;
    if (t === drawn) return requestAnimationFrame(frame);
    drawn = t;
    scrub.value = Math.floor(t);
    document.getElementById("clock").textContent = hhmm(Math.floor(t));
    const onBus = active(buses, t), onTrain = active(trains, t);
    document.getElementById("nbus").textContent = onBus.length;
    document.getElementById("ntrain").textContent = onTrain.length;
    document.getElementById("ltrain").textContent = onTrain.length === 1 ? T.trainOne : T.trains;
    overlay.setProps({ layers: [
      trail("bus-trails", buses, BUS), trail("train-trails", trains, TRAIN), ...cityLayers(),
      dots("buses", onBus, BUS, record ? 3 : 2.6), dots("trains", onTrain, TRAIN, record ? 4.5 : 3.8),
    ] });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});
