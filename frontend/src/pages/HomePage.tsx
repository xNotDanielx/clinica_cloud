import AppointmentModal from "../components/public/AppointmentModal";
import ContactSection from "../components/public/ContactSection";
import GallerySection from "../components/public/GallerySection";
import HeroSection from "../components/public/HeroSection";
import ProceduresSection from "../components/public/ProceduresSection";
import PublicFooter from "../components/public/PublicFooter";
import PublicHeader from "../components/public/PublicHeader";
import SectionSeparator from "../components/public/SectionSeparator";
import WhatsAppButton from "../components/public/WhatsAppButton";
import { usePublicBooking } from "../hooks/usePublicBooking";

export default function HomePage() {
  const booking = usePublicBooking();

  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">
      <PublicHeader />

      <main className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 pt-28">
        <HeroSection onBook={booking.openModal} />

        <SectionSeparator />

        <ProceduresSection
          procedures={booking.procedures}
          selected={booking.selected}
          selectedProcedures={booking.selectedProcedures}
          blockedProcedure={booking.blockedProcedure}
          showLimitMessage={booking.showLimitMessage}
          onToggleProcedure={booking.toggleProcedure}
          onBook={booking.openModal}
        />

        <SectionSeparator glow="violet" />
        <GallerySection />
        <SectionSeparator />
        <ContactSection />
      </main>

      <PublicFooter />
      <WhatsAppButton />

      <AppointmentModal
        isOpen={booking.isModalOpen}
        isSubmitting={booking.isSubmitting}
        submitError={booking.submitError}
        form={booking.form}
        errors={booking.errors}
        catalogos={booking.catalogos}
        availableHours={booking.availableHours}
        procedures={booking.procedures}
        selected={booking.selected}
        blockedProcedure={booking.blockedProcedure}
        minDate={booking.minDate}
        onClose={booking.closeModal}
        onChange={booking.handleInputChange}
        onSubmit={booking.handleSubmit}
        onToggleProcedure={booking.toggleProcedure}
      />
    </div>
  );
}
