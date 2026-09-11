import { GALLERY_PAIRS } from "../../constants/public";

export default function GallerySection() {
  return (
    <section id="galeria" className="public-section">
      <div className="mb-10 text-center">
        <p className="section-kicker">Galería</p>
        <h3 className="section-title">Antes y después</h3>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {GALLERY_PAIRS.map((pair) => (
          <div
            key={pair.before}
            className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="gallery-card">
                <img src={pair.beforeImage} alt={pair.before} className="h-full w-full object-cover" />
                <div className="gallery-label">ANTES</div>
              </div>
              <div className="gallery-card">
                <img src={pair.afterImage} alt={pair.after} className="h-full w-full object-cover" />
                <div className="gallery-label">DESPUÉS</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
