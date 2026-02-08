import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import MyServices from "../pages/MyServices";
import Bookings from "../pages/Bookings";
import Earnings from "../pages/Earnings";
import Reviews from "../pages/Reviews";
import Profile from "../pages/Profile";

export default function ServiceProviderRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="my-services" element={<MyServices />} />
      <Route path="bookings" element={<Bookings />} />
      <Route path="earnings" element={<Earnings />} />
      <Route path="reviews" element={<Reviews />} />
      <Route path="profile" element={<Profile />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
}
