import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import RequestService from "../pages/RequestService";
import TrackService from "../pages/TrackService";
import Payments from "../pages/Payments";
import Profile from "../pages/Profile";

export default function CustomerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="request" element={<RequestService />} />
      <Route path="track" element={<TrackService />} />
      <Route path="payments" element={<Payments />} />
      <Route path="profile" element={<Profile />} />
    </Routes>
  );
}
