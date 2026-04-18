import api from "./axios";

export const fetchNotifications = async () => {
  const response = await api.get("/notifications");
  return Array.isArray(response.data) ? response.data : [];
};

export const markNotificationRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.put("/notifications/read-all");
  return response.data;
};

