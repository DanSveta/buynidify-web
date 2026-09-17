// Picks a photo that actually matches the property type - a flat gets an
// apartment interior, a terraced house gets a street of terraces. Chosen
// deterministically from the id so a given listing always shows the same
// picture instead of reshuffling on every render.

const APARTMENT = [
  "photo-1600585154340-be6161a56a0c",
  "photo-1484154218962-a197022b5858",
  "photo-1564078516393-cf04bd966897",
  "photo-1600607687939-ce8a6c25118c",
];

const HOUSE = [
  "photo-1523217582562-09d0def993a6",
  "photo-1568605114967-8130f3a36994",
  "photo-1505843513577-22bb7d21e455",
  "photo-1783490244502-cd5f236e3780",
];

function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export function propertyImage(id: string, type: string, width = 600): string {
  const t = type.toLowerCase();
  const isFlat =
    t.includes("apartment") ||
    t.includes("flat") ||
    t.includes("studio") ||
    t.includes("condo") ||
    t.includes("maisonette");
  const pool = isFlat ? APARTMENT : HOUSE;
  const photo = pool[hash(id) % pool.length];
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&q=60`;
}
