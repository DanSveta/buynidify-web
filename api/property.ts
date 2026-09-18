// Reads the facts off a pasted property listing.
//
// This has to run on a server: a browser can't fetch rightmove.co.uk directly
// (cross-origin), and we don't want the portal seeing every visitor's IP.
// Deployed on Vercel this is a serverless function; in `npm run dev` the same
// handler is mounted by the Vite plugin in vite.config.ts.
//
// What it takes, and what it deliberately doesn't:
//   - Facts only: address, price, bedrooms, bathrooms, property type. Facts
//     aren't copyrightable.
//   - The listing's own share image, by URL. We reference it, we don't copy
//     it onto our servers.
//   - NOT the agent's description text, which is their copyright.
// Every result keeps the source URL so the card links back to the portal.

export type ScrapedProperty = {
  ok: boolean;
  source: "rightmove" | "zoopla" | "onthemarket" | "generic" | "none";
  url: string;
  address?: string;
  city?: string;
  postcode?: string;
  price?: number;
  beds?: number;
  baths?: number;
  type?: string;
  imageUrl?: string;
  /** The agent marketing it, straight from the listing. */
  agent?: string;
  /** Set when we couldn't reach or read the page, so the UI can say so. */
  error?: string;
  /** True when the portal refused us, rather than the page being unreadable. */
  blocked?: boolean;
  /** Debug only: what the fallback reader did. */
  readerDiagnostic?: string;
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const digits = value.replace(/[^0-9]/g, "");
    if (digits) return Number(digits);
  }
  return undefined;
}

/** "12 Mill Road, Headingley, Leeds LS6 3AA" -> city + postcode. */
function splitAddress(address?: string) {
  if (!address) return {};
  const postcode = address.match(
    /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i
  )?.[0];
  const withoutPostcode = postcode ? address.replace(postcode, "").trim() : address;
  const parts = withoutPostcode
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  // The town is usually the last comma-separated part.
  const city = parts.length > 1 ? parts[parts.length - 1] : undefined;
  return { city, postcode: postcode?.toUpperCase().replace(/\s+/g, " ") };
}

/** Rightmove now renders as a React stream, so the old embedded JSON object
 *  is gone. Its share tags are better anyway: one sentence with every fact in
 *  a fixed order.
 *
 *  "1 bedroom apartment for sale in Embankment Exchange, M3 for £180,000.
 *   Marketed by RW Invest, Liverpool"
 */
function parseRightmove(html: string): Partial<ScrapedProperty> {
  const description = meta(html, "og:description") ?? meta(html, "description") ?? "";
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? "";
  const text = description || title;
  if (!text) return {};

  const beds = toNumber(text.match(/^(\d+)\s+bed/i)?.[1]);
  const type = text.match(/^\d+\s+bedroom\s+(.+?)\s+(?:for sale|to rent)/i)?.[1]
    ?? text.match(/^(studio|land|farm)\b/i)?.[1];
  const price = toNumber(text.match(/for\s+£([\d,]+)/i)?.[1]);

  // Everything between "for sale in" and " for £" is the address, and
  // Rightmove always ends it with the outcode.
  const addressBlock = text.match(/(?:for sale|to rent)\s+in\s+([\s\S]+?)\s+for\s+£/i)?.[1]?.trim();
  const outcode = addressBlock?.match(/,\s*([A-Z]{1,2}\d[A-Z\d]?)\s*$/i)?.[1];
  const address = outcode
    ? addressBlock?.replace(/,\s*[A-Z]{1,2}\d[A-Z\d]?\s*$/i, "").trim()
    : addressBlock;

  const agent = text.match(/Marketed by\s+(.+?)\.?$/i)?.[1];

  return {
    address,
    postcode: outcode?.toUpperCase(),
    price,
    beds,
    type: type ? type.charAt(0).toUpperCase() + type.slice(1) : undefined,
    imageUrl: meta(html, "og:image"),
    agent,
  };
}

/** Zoopla is a Next.js app, so the page ships its data as __NEXT_DATA__. */
function parseZoopla(html: string): Partial<ScrapedProperty> {
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) return {};
  let data: any;
  try {
    data = JSON.parse(match[1]);
  } catch {
    return {};
  }
  // Zoopla moves this around between releases, so search rather than assume.
  const stack: any[] = [data];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== "object") continue;
    if (node.listingId && (node.pricing || node.price) && node.address) {
      return {
        address:
          typeof node.address === "string" ? node.address : node.address?.displayAddress,
        price: toNumber(node.pricing?.value ?? node.pricing?.label ?? node.price),
        beds: toNumber(node.counts?.numBedrooms ?? node.bedrooms),
        baths: toNumber(node.counts?.numBathrooms ?? node.bathrooms),
        type: node.propertyType,
        imageUrl: node.imageUri ?? node.images?.[0]?.url,
      };
    }
    for (const value of Object.values(node)) {
      if (value && typeof value === "object") stack.push(value);
    }
  }
  return {};
}

/** Share tags, which every portal publishes so links look right when shared.
 *  Quotes vary between single and double, hence the loose pattern. */
function meta(html: string, property: string): string | undefined {
  return (
    html.match(
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
        "i"
      )
    )?.[1] ??
    html.match(
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
        "i"
      )
    )?.[1]
  );
}

/** OnTheMarket puts the whole thing in its title:
 *  "Maurice Avenue, Stirling, FK7 2 bed apartment - £125,000"
 *  and names the agent in the description:
 *  "Halliday Homes present this 2 bedroom apartment in Maurice Avenue..." */
function parseOnTheMarket(html: string): Partial<ScrapedProperty> {
  const title = meta(html, "og:title") ?? "";
  const description = meta(html, "og:description") ?? meta(html, "description") ?? "";
  if (!title) return {};

  const price = toNumber(title.match(/£([\d,]+)/)?.[1]);
  const beds = toNumber(title.match(/(\d+)\s*bed\b/i)?.[1]);
  const type = title.match(/\d+\s*bed\s+([a-z\- ]+?)\s*(?:-|$)/i)?.[1]?.trim();

  // The address is everything before the "N bed ..." part.
  const addressBlock = title.split(/\s+\d+\s*bed\b/i)[0]?.trim();
  const outcode = addressBlock?.match(/,\s*([A-Z]{1,2}\d[A-Z\d]?)\s*$/i)?.[1];
  const address = outcode
    ? addressBlock.replace(/,\s*[A-Z]{1,2}\d[A-Z\d]?\s*$/i, "").trim()
    : addressBlock;

  const agent = description.match(/^(.+?)\s+present[s]?\s+this/i)?.[1];

  return {
    address,
    postcode: outcode?.toUpperCase(),
    price,
    beds,
    type: type ? type.charAt(0).toUpperCase() + type.slice(1) : undefined,
    imageUrl: meta(html, "og:image"),
    agent,
  };
}

/** The reader hands back plain text, and puts the whole summary on its first
 *  line:
 *  "Beacon Tower, Spectrum Way, London SW18, 2 bed flat for sale, £644,000 - Zoopla"
 *  Used only for portals that refuse a direct read. */
function parseReaderText(text: string): Partial<ScrapedProperty> {
  const line = text.match(/^Title:\s*(.+)$/m)?.[1]?.replace(/\s*-\s*(Zoopla|Rightmove|OnTheMarket)\s*$/i, "").trim();
  if (!line) return {};

  const price = toNumber(line.match(/£([\d,]+)/)?.[1]);
  const beds = toNumber(line.match(/(\d+)\s*bed\b/i)?.[1]);
  const type = line.match(/\d+\s*bed\s+([a-z\- ]+?)\s+(?:for sale|to rent)/i)?.[1]?.trim();

  // Address is everything before the ", N bed ..." part.
  const addressBlock = line.split(/,\s*\d+\s*bed\b/i)[0]?.trim();
  const outcode = addressBlock?.match(/,?\s*([A-Z]{1,2}\d[A-Z\d]?)\s*$/)?.[1];
  const address = outcode
    ? addressBlock.replace(/,?\s*[A-Z]{1,2}\d[A-Z\d]?\s*$/, "").trim()
    : addressBlock;

  // Bathrooms sit in the body next to the bed count.
  const baths = toNumber(text.match(/(\d+)\s*bath\b/i)?.[1]);
  // First real photo in the page, whichever CDN the portal uses.
  const imageUrl = text.match(
    /https:\/\/[^\s)"']*(?:zoocdn|rightmove|onthemarket|akamaized|cloudfront)[^\s)"']*\.(?:jpe?g|png|webp)/i
  )?.[0] ?? text.match(/https:\/\/[^\s)"']+\.(?:jpe?g|png|webp)/i)?.[0];

  return {
    address,
    postcode: outcode?.toUpperCase(),
    price,
    beds,
    baths,
    type: type ? type.charAt(0).toUpperCase() + type.slice(1) : undefined,
    imageUrl,
  };
}

/** Works on any portal, including ones we haven't written a parser for. */
function parseGeneric(html: string): Partial<ScrapedProperty> {
  const title = meta(html, "og:title") ?? html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const description = meta(html, "og:description") ?? meta(html, "description");
  const haystack = `${title ?? ""} ${description ?? ""}`;

  return {
    address: title?.replace(/\s*\|.*$/, "").trim(),
    price: toNumber(haystack.match(/£\s?[\d,]{4,}/)?.[0]),
    beds: toNumber(haystack.match(/(\d+)\s*(?:bed|bedroom)/i)?.[1]),
    baths: toNumber(haystack.match(/(\d+)\s*(?:bath|bathroom)/i)?.[1]),
    type: haystack.match(
      /\b(detached house|semi-detached house|terraced house|end of terrace|townhouse|bungalow|maisonette|apartment|flat|studio)\b/i
    )?.[0],
    imageUrl: meta(html, "og:image"),
  };
}

export async function scrapeProperty(url: string, debug = false): Promise<ScrapedProperty> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, source: "none", url, error: "That isn't a valid URL." };
  }

  const host = parsed.hostname.replace(/^www\./, "");
  const source: ScrapedProperty["source"] = host.includes("rightmove")
    ? "rightmove"
    : host.includes("zoopla")
      ? "zoopla"
      : host.includes("onthemarket")
        ? "onthemarket"
        : "generic";

  // Zoopla sits behind bot protection that refuses a plain server request.
  // r.jina.ai is a public reader that fetches the page and hands back its
  // text; we only use it when the portal has already turned us away.
  let readerDiagnostic = "not attempted";
  async function readThroughReader(): Promise<string | null> {
    try {
      // No custom headers: the reader rejects requests that announce
      // themselves as a scripted browser.
      const response = await fetch(`https://r.jina.ai/${parsed.toString()}`);
      const text = response.ok ? await response.text() : "";
      readerDiagnostic = `status=${response.status} len=${text.length}`;
      if (!response.ok) return null;
      return text.length > 500 ? text : null;
    } catch (e) {
      readerDiagnostic = `threw ${(e as Error).message}`;
      return null;
    }
  }

  let html = "";
  // Set instead of `html` when the portal refused us and the reader stepped in.
  let readerText = "";
  try {
    // Some portals check more than the user agent: they look for the whole
    // set of headers a real Chrome sends, and reject anything that looks like
    // a bare script.
    const response = await fetch(parsed.toString(), {
      headers: {
        "user-agent": UA,
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "en-GB,en;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "sec-ch-ua": '"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
      redirect: "follow",
    });
    if (!response.ok) {
      const viaReader = response.status === 403 || response.status === 429
        ? await readThroughReader()
        : null;
      if (viaReader) {
        readerText = viaReader;
      } else
      return {
        ok: false,
        source,
        url,
        error:
          response.status === 403 || response.status === 429
            ? `${host.split(".")[0]} blocks automated reads, so we can't fetch this one. Add the details yourself, or paste the same property from Rightmove or OnTheMarket.`
            : `The portal returned ${response.status}.`,
        readerDiagnostic,
        blocked: response.status === 403 || response.status === 429,
      };
    } else {
      html = await response.text();
    }
  } catch (e) {
    return {
      ok: false,
      source,
      url,
      error: `Couldn't reach the listing (${(e as Error).message}).`,
    };
  }

  if (debug) {
    return {
      ok: false,
      source,
      url,
      error: JSON.stringify({
        length: html.length,
        markers: [
          "PAGE_MODEL",
          "__NEXT_DATA__",
          "application/ld+json",
          "__PRELOADED_STATE__",
          "propertyData",
          "displayAddress",
        ].filter((m) => html.includes(m)),
        title: html.match(/<title>([^<]+)<\/title>/i)?.[1],
        metas: [...html.matchAll(/<meta[^>]*>/g)]
          .map((m) => m[0])
          .filter((m) => /og:|twitter:|name="description"/.test(m))
          .slice(0, 10),
        h1: html.match(/<h1[^>]*>([\s\S]{0,120}?)<\/h1>/i)?.[1],
      }),
    };
  }

  // The reader path returns text, not markup, so it has its own parser.
  if (readerText) {
    const fromReader = parseReaderText(readerText);
    const { city: readerCity } = splitAddress(fromReader.address);
    let city = readerCity;
    if (!city && fromReader.postcode) {
      try {
        const lookup = await fetch(
          `https://api.postcodes.io/outcodes/${encodeURIComponent(fromReader.postcode)}`
        );
        if (lookup.ok) {
          const json: any = await lookup.json();
          city = json?.result?.admin_district?.[0] ?? json?.result?.region;
        }
      } catch {
        // Not worth failing the import over.
      }
    }
    const readable = Boolean(fromReader.address && fromReader.price);
    return {
      ok: readable,
      source,
      url,
      ...fromReader,
      city,
      error: readable ? undefined : "Couldn't read the property details from that page.",
    };
  }

  const specific =
    source === "onthemarket"
      ? parseOnTheMarket(html)
      : source === "zoopla"
        ? { ...parseZoopla(html), ...parseRightmove(html) }
        : parseRightmove(html);

  // Fall back field by field, so a partial specific parse still wins where it
  // has a value and the generic tags fill the gaps.
  const generic = parseGeneric(html);
  const merged: Partial<ScrapedProperty> = {
    address: specific.address ?? generic.address,
    price: specific.price ?? generic.price,
    beds: specific.beds ?? generic.beds,
    baths: specific.baths ?? generic.baths,
    type: specific.type ?? generic.type,
    imageUrl: specific.imageUrl ?? generic.imageUrl,
    postcode: specific.postcode,
    agent: specific.agent,
  };

  let { city, postcode } = splitAddress(merged.address);

  // postcodes.io is free, public and needs no key. It turns "M3" into
  // "Manchester", which is the one fact the listing itself doesn't spell out.
  const outcode = merged.postcode ?? postcode;
  if (!city && outcode) {
    try {
      const lookup = await fetch(
        `https://api.postcodes.io/outcodes/${encodeURIComponent(outcode.split(" ")[0])}`
      );
      if (lookup.ok) {
        const json: any = await lookup.json();
        city = json?.result?.admin_district?.[0] ?? json?.result?.region;
      }
    } catch {
      // Not worth failing the import over.
    }
  }

  const ok = Boolean(merged.address && merged.price);
  return {
    ok,
    source,
    url,
    ...merged,
    city,
    postcode: merged.postcode ?? postcode,
    error: ok ? undefined : "Couldn't read the property details from that page.",
  };
}

/** Vercel serverless entry point. */
export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url).searchParams.get("url");
  if (!url) {
    return new Response(JSON.stringify({ ok: false, error: "Missing url parameter." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const result = await scrapeProperty(url, new URL(request.url).searchParams.has("debug"));
  return new Response(JSON.stringify(result), {
    headers: {
      "content-type": "application/json",
      // Same listing pasted twice in a session shouldn't hit the portal twice.
      "cache-control": "public, max-age=600",
    },
  });
}
