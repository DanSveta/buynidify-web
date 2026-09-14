import Button from "../components/Button";

export default function CTASection() {
  return (
    <section className="bg-brand-ink py-20">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Start Your Property Journey Today
        </h2>
        <p className="max-w-xl text-white/70">
          Join Buynidify to explore secure fractional investments, book
          high-end residential renting spaces, or host your property
          securely with digital ledger tools.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button as="a" href="#properties" variant="secondary">
            Explore Properties
          </Button>
          <Button as="a" href="#relocate" variant="outline-white">
            Consult Experts
          </Button>
        </div>
      </div>
    </section>
  );
}
