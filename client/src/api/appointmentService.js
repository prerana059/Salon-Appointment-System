import api from "./axios";

export const fetchAdminAppointments = async () => {
  try {
    const response = await api.get("/admin/appointments");
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      const fallbackResponse = await api.get("/appointments");
      return fallbackResponse.data;
    }
    throw error;
  }
};

export const cancelAdminAppointment = async (appointmentId) => {
  const response = await api.put(`/appointments/cancel/${appointmentId}`);
  return response.data;
};

export const completeAdminAppointment = async (appointmentId) => {
  const response = await api.put(`/appointments/complete/${appointmentId}`);
  return response.data;
};

// Soft delete maps to cancel status until a dedicated endpoint exists.
export const softDeleteAdminAppointment = async (appointmentId) => {
  return cancelAdminAppointment(appointmentId);
};
