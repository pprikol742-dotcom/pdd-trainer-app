export default function QuestionImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-black shadow-card">
      <img src={src} alt={alt} className="aspect-[4/3] w-full object-contain" loading="lazy" />
    </div>
  );
}
