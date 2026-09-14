// Single source of truth for the property-type taxonomy, shared between the
// app's Search page and the marketing landing page (hero search bar +
// "Explore Property Niches"), so all three show the exact same 7 categories
// with the exact same icons. This is the same set verified live against
// Rightmove/Zoopla/OnTheMarket's own For Sale filter panels for Search.tsx -
// see the comments there for the verification notes.
import {
  AnyTypeIcon,
  DetachedIcon,
  SemiDetachedIcon,
  TerracedIcon,
  BungalowIcon,
  FlatIcon,
  LandIcon,
  ParkHomeIcon,
} from "../components/icons";

export type PortalPropertyType =
  | "Any"
  | "detached"
  | "semi-detached"
  | "terraced"
  | "bungalow"
  | "flat"
  | "land"
  | "park-home";

export const portalPropertyTypeOptions: { value: PortalPropertyType; label: string; Icon: typeof DetachedIcon }[] = [
  { value: "Any", label: "Any type", Icon: AnyTypeIcon },
  { value: "detached", label: "Detached", Icon: DetachedIcon },
  { value: "semi-detached", label: "Semi-detached", Icon: SemiDetachedIcon },
  { value: "terraced", label: "Terraced", Icon: TerracedIcon },
  { value: "bungalow", label: "Bungalow", Icon: BungalowIcon },
  { value: "flat", label: "Flat / Apartment", Icon: FlatIcon },
  { value: "land", label: "Land / Farm", Icon: LandIcon },
  { value: "park-home", label: "Park home", Icon: ParkHomeIcon },
];

// Same 7, without the "Any" catch-all - for showcase/grid contexts like
// "Explore Property Niches" where every tile should be a real category.
export const realPropertyTypeOptions = portalPropertyTypeOptions.filter((o) => o.value !== "Any");
