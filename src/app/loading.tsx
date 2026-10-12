export default function Loading() {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center p-8">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-brand-electric/20 animate-ping"></div>
        <div className="w-10 h-10 rounded-full border-4 border-brand-electric border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-xs font-bold text-brand-navy/60 uppercase tracking-widest animate-pulse">
        Cargando...
      </p>
    </div>
  );
}
