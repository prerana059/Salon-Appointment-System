import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import BookAppointment from "./pages/BookApponitment"
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import MyAppointments from "./pages/MyAppointments";
import AdminServices from "./pages/AdminServices";
import AdminAvailability from "./pages/AdminAvailability";
import AdminAppointments from "./pages/AdminAppointments";
import AdminCalendar from "./pages/AdminCalendar";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import NotificationPage from "./pages/NotificationPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/staff-dashboard" element={<StaffDashboard />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/admin/services" element ={<AdminServices/>}/>
        <Route path="/admin/availability" element={<AdminAvailability />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;