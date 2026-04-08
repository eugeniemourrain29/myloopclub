import Link from "next/link";
import { ArrowRight, MapPin, Calendar } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fffcf5] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Logo / Brand mark */}
          <div className="mb-8 inline-flex items-center gap-2 bg-[#0e59c3]/10 text-[#0e59c3] px-4 py-2 rounded-full text-sm font-medium tracking-wide uppercase">
            Loop Clubs Paris
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-[#0e59c3] mb-6 leading-none">
            myloopclub
          </h1>

          <p className="text-xl sm:text-2xl text-black/70 mb-4 font-medium">
            Échangez vos vêtements dans les meilleures friperies parisiennes.
          </p>

          <p className="text-base sm:text-lg text-black/50 mb-16 max-w-xl mx-auto">
            Rejoignez un Loop Club, apportez vos pièces, repartez avec de nouvelles
            trouvailles. Mode circulaire, zéro gaspillage.
          </p>

          {/* Two main CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* CTA 1 — Participate */}
            <Link
              href="/map"
              className="group flex flex-col items-start gap-4 bg-[#0e59c3] text-[#fffcf5] rounded-2xl p-8 hover:bg-[#0d4fad] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold mb-1">Je veux participer</div>
                <div className="text-sm text-white/70">
                  Trouve un Loop Club près de chez toi et inscris-toi
                </div>
              </div>
              <div className="mt-auto flex items-center gap-2 text-sm font-medium">
                Voir la carte
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* CTA 2 — Propose */}
            <Link
              href="/propose"
              className="group flex flex-col items-start gap-4 bg-black text-[#fffcf5] rounded-2xl p-8 hover:bg-black/80 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold mb-1">Je veux proposer un event</div>
                <div className="text-sm text-white/70">
                  Organise un Loop Club dans ta friperie ou ailleurs
                </div>
              </div>
              <div className="mt-auto flex items-center gap-2 text-sm font-medium">
                Créer un event
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-black/8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0e59c3] text-center mb-12">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Trouve un Loop Club",
                desc: "Explore la carte et trouve un événement dans une friperie parisienne.",
              },
              {
                step: "02",
                title: "Inscris-toi & apporte",
                desc: "Réserve ta place et apporte jusqu'à 5 vêtements propres en bon état.",
              },
              {
                step: "03",
                title: "Échange & gagne",
                desc: "Repart avec de nouvelles pièces et accumule des points selon la qualité de tes fibres.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col gap-3">
                <div className="text-5xl font-black text-[#0e59c3]/15 leading-none">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-black">{title}</h3>
                <p className="text-black/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-black/8 text-center text-sm text-black/40">
        © {new Date().getFullYear()} myloopclub — Mode circulaire à Paris
      </footer>
    </div>
  );
}
