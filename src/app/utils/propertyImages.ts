// Picks a photo that actually matches the property type - a flat gets an
// apartment interior, a terraced house gets a street of terraces. Chosen
// deterministically from the id so a given listing always shows the same
// picture instead of reshuffling on every render.

const APARTMENT = [
  "photo-1600585154340-be6161a56a0c",
  "photo-1484154218962-a197022b5858",
  "photo-1564078516393-cf04bd966897",
  "photo-1600607687939-ce8a6c25118c",
  "photo-1502672260266-1c1ef2d93688",
  "photo-1522708323590-d24dbb6b0267",
  "photo-1512917774080-9991f1c4c750",
  "photo-1493809842364-78817add7ffb",
  "photo-1560185893-a55cbc8c57e8",
  "photo-1493663284031-b7e3aefcae8e",
];

const HOUSE = [
  "photo-1523217582562-09d0def993a6",
  "photo-1568605114967-8130f3a36994",
  "photo-1505843513577-22bb7d21e455",
  "photo-1783490244502-cd5f236e3780",
  "photo-1560448204-e02f11c3d0e2",
  "photo-1570129477492-45c003edd2be",
  "photo-1600585154340-be6161a56a0c",
  "photo-1449844908441-8829872d2607",
  "photo-1600607687644-c7531e489ece",
  "photo-1524230572899-a752b3835840",
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
