/**
 * État de chargement affiché instantanément à chaque navigation (App Router).
 * Donne un retour immédiat au clic pendant que la page se rend côté serveur.
 */
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-56 rounded-xl bg-surface-2" />
      <div className="mt-3 h-4 w-80 max-w-full rounded-lg bg-surface-2/70" />
      <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-line bg-surface shadow-s" />
        ))}
      </div>
    </div>
  );
}
