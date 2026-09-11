export default function ContactSection() {
  return (
    <section id="contacto" className="public-section">
      <div className="grid gap-6 lg:grid-cols-2 items-stretch">
        <div className="contact-card">
          <p className="section-kicker">Contacto</p>
          <h3 className="section-title">Contáctanos</h3>
          <div className="mt-8 space-y-6 text-slate-300 leading-8 text-lg md:text-xl">
            <p><span className="font-semibold text-white">Ubicación:</span> Santiago de Chile</p>
            <p>
              <span className="font-semibold text-white">Dirección:</span> Hernando De Aguirre 128, Consultorio 805,
              Edificio Copiapó, Providencia. Metro Tobalaba
            </p>
            <p><span className="font-semibold text-white">Correo:</span> contacto@clinicarenacer.com</p>
            <p><span className="font-semibold text-white">Teléfono:</span> +56 9 0000 0000</p>
          </div>
        </div>

        <div className="map-card">
          <iframe
            title="Ubicación Clínica Renacer"
            src="https://www.google.com/maps?q=Hernando%20De%20Aguirre%20128%20Consultorio%20805%20Edificio%20Copiap%C3%B3%20Providencia%20Metro%20Tobalaba%20Santiago%20de%20Chile&output=embed"
            className="h-[560px] w-full rounded-[1.3rem] border-0 grayscale-[0.1]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
