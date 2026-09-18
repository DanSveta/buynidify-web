import { Link } from "react-router-dom";
import PlatformListings from "../app/pages/PlatformListings";
import PublicShell from "./PublicShell";

// Platform listings, open to anyone, with a site header instead of a portal
// sidebar. Same cards and the same actions - pressing one asks you to join.
export default function PublicListings() {
  return (
    <PublicShell active="listings">
      <PlatformListings />
      <p className="mt-10 text-center text-xs text-brand-muted">
        Looking for something specific?{" "}
        <Link to="/search" className="font-semibold text-brand-blue hover:underline">
          Search UK property →
        </Link>
      </p>
    </PublicShell>
  );
}
