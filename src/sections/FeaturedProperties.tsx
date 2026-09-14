import Button from "../components/Button";
import { BathIcon, BedIcon } from "../components/icons";
import { properties } from "../lib/content";

export default function FeaturedProperties() {
  return (
    <section id="properties" className="mx-auto max-w-[1440px] px-6 py-24 sm:px-10">
      <div className="mb-12 flex flex-col items-center text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-blue">
          Handpicked Listings
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
          Featured Properties &amp; Portfolios
        </h2>
        <p className="mt-3 max-w-xl text-brand-muted">
          Explore top-performing rental yields and gorgeous living spaces
          vetted by our real estate experts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {properties.map((property) => (
          <article
            key={property.id}
            className="group overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={property.image}
                alt={property.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-brand-blue px-3 py-1 text-xs font-bold text-brand-gold">
                {property.badge}
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-display text-xs font-semibold tracking-tight text-brand-ink">
                {property.name}
              </h3>
              <p className="mt-1 text-sm text-brand-muted">
                {property.location}
              </p>
              <div className="mt-3 flex items-center gap-3 text-sm text-brand-muted">
                <span className="inline-flex items-center gap-1">
                  <BedIcon className="h-4 w-4 text-brand-blue" />
                  {property.beds} Beds
                </span>
                <span className="inline-flex items-center gap-1">
                  <BathIcon className="h-4 w-4 text-brand-blue" />
                  {property.baths} Baths
                </span>
                <span className="rounded-md bg-brand-blue-light px-2 py-0.5 text-xs font-semibold text-brand-blue">
                  {property.yield}
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-brand-border pt-4">
                <div>
                  <p className="text-xs text-brand-muted">
                    {property.priceLabel}
                  </p>
                  <p className="font-display text-lg font-semibold tracking-tight text-brand-blue">
                    {property.price}
                  </p>
                </div>
                <Button variant="secondary" className="px-4 py-2 !text-xs">
                  View Details
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
