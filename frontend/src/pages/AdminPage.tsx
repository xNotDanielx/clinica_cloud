import { useState } from "react";
import AdminLogin from "../components/admin/auth/AdminLogin";
import AppointmentsSection from "../components/admin/appointments/AppointmentsSection";
import CreateAppointmentModal from "../components/admin/appointments/CreateAppointmentModal";
import EditAppointmentModal from "../components/admin/appointments/EditAppointmentModal";
import PendingAppointmentsSection from "../components/admin/appointments/PendingAppointmentsSection";
import AdminHeader from "../components/admin/layout/AdminHeader";
import AdminHomeSection from "../components/admin/layout/AdminHomeSection";
import AdminSessionLoader from "../components/admin/layout/AdminSessionLoader";
import AdminSidebar from "../components/admin/layout/AdminSidebar";
import CreatePatientModal from "../components/admin/patients/CreatePatientModal";
import EditPatientModal from "../components/admin/patients/EditPatientModal";
import PatientsSection from "../components/admin/patients/PatientsSection";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { useAdminModalLock } from "../hooks/useAdminModalLock";
import { useAppointments } from "../hooks/useAppointments";
import { usePatients } from "../hooks/usePatients";
import type { TabKey } from "../types/admin";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("Inicio");

  const auth = useAdminAuth();
  const patients = usePatients(activeTab, auth.loggedIn);
  const appointments = useAppointments(activeTab, auth.loggedIn);

  const hasOpenModal =
    patients.isCreatePatientModalOpen ||
    patients.isEditPatientModalOpen ||
    appointments.isCreateAppointmentModalOpen ||
    appointments.isEditAppointmentModalOpen;

  useAdminModalLock(hasOpenModal, () => {
    patients.closeCreatePatientModal();
    patients.closeEditPatientModal();
    appointments.closeCreateAppointmentModal();
    appointments.closeEditAppointmentModal();
  });

  if (auth.checkingSession) {
    return <AdminSessionLoader />;
  }

  if (!auth.loggedIn) {
    return (
      <AdminLogin
        username={auth.username}
        password={auth.password}
        onUsernameChange={auth.setUsername}
        onPasswordChange={auth.setPassword}
        onSubmit={auth.handleLogin}
        onForgotPassword={() => {}}
      />
    );
  }

  const handleLogout = () => {
    auth.logout();
    setActiveTab("Inicio");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050816] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.22),transparent_30%),radial-gradient(circle_at_right,rgba(56,189,248,0.16),transparent_28%),linear-gradient(180deg,#050816_0%,#090b1a_100%)]" />
      <div className="fixed inset-0 -z-10 opacity-25 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
        <AdminHeader activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
          />

          <main className="space-y-6">
            {activeTab === "Inicio" && <AdminHomeSection />}

            {activeTab === "Pacientes" && (
              <PatientsSection
                patientQuery={patients.patientQuery}
                patients={patients.patients}
                onQueryChange={patients.setPatientQuery}
                onCreate={patients.openCreatePatientModal}
                onEdit={patients.openEditPatientModal}
                onDelete={patients.removePatient}
              />
            )}

            {activeTab === "Citas" && (
              <AppointmentsSection
                appointmentQuery={appointments.appointmentQuery}
                appointments={appointments.appointments}
                onQueryChange={appointments.setAppointmentQuery}
                onCreate={appointments.openCreateAppointmentModal}
                onEdit={appointments.openEditAppointmentModal}
                onDelete={appointments.removeAppointment}
              />
            )}

            {activeTab === "Autorizar Citas" && (
              <PendingAppointmentsSection
                authorizations={appointments.authorizations}
                onApprove={appointments.approve}
                onReject={appointments.reject}
              />
            )}
          </main>
        </div>
      </div>

      {patients.isCreatePatientModalOpen && (
        <CreatePatientModal
          form={patients.createPatientForm}
          error={patients.createPatientError}
          isSubmitting={patients.isCreatingPatient}
          onChange={patients.handleCreatePatientInputChange}
          onSubmit={patients.handleCreatePatient}
          onClose={patients.closeCreatePatientModal}
        />
      )}

      {patients.isEditPatientModalOpen && (
        <EditPatientModal
          patientId={patients.selectedPatientId}
          form={patients.editPatientForm}
          error={patients.editPatientError}
          isSubmitting={patients.isEditingPatient}
          onChange={patients.handleEditPatientInputChange}
          onSubmit={patients.handleEditPatient}
          onClose={patients.closeEditPatientModal}
        />
      )}

      {appointments.isCreateAppointmentModalOpen && (
        <CreateAppointmentModal
          form={appointments.createAppointmentForm}
          patients={patients.patients}
          procedures={appointments.procedures}
          error={appointments.createAppointmentError}
          isSubmitting={appointments.isCreatingAppointment}
          onChange={appointments.handleCreateAppointmentInputChange}
          onToggleProcedure={appointments.toggleCreateAppointmentProcedure}
          onSubmit={appointments.handleCreateAppointment}
          onClose={appointments.closeCreateAppointmentModal}
        />
      )}

      {appointments.isEditAppointmentModalOpen && (
        <EditAppointmentModal
          form={appointments.editAppointmentForm}
          patients={patients.patients}
          procedures={appointments.procedures}
          error={appointments.editAppointmentError}
          isSubmitting={appointments.isEditingAppointment}
          onChange={appointments.handleEditAppointmentInputChange}
          onToggleProcedure={appointments.toggleEditAppointmentProcedure}
          onSubmit={appointments.handleEditAppointment}
          onClose={appointments.closeEditAppointmentModal}
        />
      )}
    </div>
  );
}
