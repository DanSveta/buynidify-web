// Illustrated avatars for the fictional people on the platform, instead of
// initials everywhere. Real stranger's-face stock photos (randomuser.me)
// read as unsettling in a small circle - a wall of real people you've never
// met staring out of a UI. DiceBear's "avataaars" set swung too far the
// other way (cartoonish, kid-app energy) for a property platform, so this
// uses "notionists" instead - the same minimal, illustrated-professional
// style Notion uses for its own avatars. Still no real faces, but it reads
// as an adult product rather than a kids' app. Hotlinkable, no key,
// deterministic per seed.
//
// Every named person in the mock data gets a fixed gender here (a made-up
// person still has one, for casting a face). Names not listed here
// (companies, or a persona renamed to something not in this table) simply
// get no avatar and fall back to the initials circle everywhere that's
// already how it's built.

const GENDER: Record<string, "man" | "woman"> = {
  // The two demo personas ("you"), matching RoleContext's defaults.
  "Alex Morgan": "man",
  "Sam Carter": "woman",
  // Tenants (profiles.ts TENANTS, reused by ListingsContext's fakeTenants).
  "James Okafor": "man",
  "Maya Kaur": "woman",
  "Adam Reid": "man",
  "Daniel Pereira": "man",
  "Sofia Lindqvist": "woman",
  "Chloe Bennett": "woman",
  "Tom Nguyen": "man",
  "Elena Wright": "woman",
  // Investors (profiles.ts INVESTORS). Corporate entries are deliberately
  // absent - a company gets the initials mark, not a face.
  "Harpreet Singh": "man",
  "Claire Mensah": "woman",
  "Oliver Grant": "man",
  "Priya Raman": "woman",
  // The example running tenancy (data/exampleDeal.ts).
  "Marcus Webb": "man",
  "Priya Chandra": "woman",
};

// A handful of pleasant, varied backdrop colours so faces aren't all sat on
// the same tile.
const BACKGROUNDS = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf", "c7f0d8"];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** A cartoon avatar URL for a known person, or undefined for a
 *  company/unknown name - callers already fall back to the initials circle
 *  in that case. Seeded on the name plus gender, so the same person always
 *  gets the same face, and DiceBear picks the illustration itself. */
export function avatarFor(name: string): string | undefined {
  const gender = GENDER[name];
  if (!gender) return undefined;
  const h = hash(name);
  const background = BACKGROUNDS[h % BACKGROUNDS.length];
  const params = new URLSearchParams({
    seed: `${name}-${gender}`,
    backgroundType: "solid",
    backgroundColor: background,
    radius: "50",
  });
  return `https://api.dicebear.com/9.x/notionists/svg?${params.toString()}`;
}
