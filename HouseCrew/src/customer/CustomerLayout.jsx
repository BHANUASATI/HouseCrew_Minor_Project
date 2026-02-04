import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

export default function CustomerLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64 flex-1">
        <Topbar />
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}
