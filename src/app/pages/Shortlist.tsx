import { Link } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { useFavorites } from "../context/FavoritesContext";
import { properties } from "../data/mockData";
import PropertyCard from "../components/PropertyCard";

export default function Shortlist() {
  const { role } = useRole();
  const { favoriteIds } = useFavorites();
  const isTenant = role === "tenant";

  const saved = properties.filter((p) => favoriteIds.has(p.id));

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-brand-ink">
        {isTenant ? "Saved Homes" : "Shortlist"}
      </h1>
      <p className="mt-1 text-brand-muted">
        {isTenant
          ? "Homes you've saved to compare later. Tap the heart on any listing to add it here."
          : "Properties you're tracking. Tap the heart on any listing to add it here."}
      </p>

      {saved.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-brand-border p-10 text-center text-sm text-brand-muted">
          Nothing saved yet.{" "}
          <Link to="/app/search" className="font-semibold text-brand-blue hover:underline">
            Start browsing
          </Link>
          .
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              asRent={isTenant}
              showFavorite
            />
          ))}
        </div>
      )}
    </div>
  );
}
