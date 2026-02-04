import CustomerLayout from "../CustomerLayout";
import StatCard from "../components/StatCard";
import QuickAction from "../components/QuickAction";
import ServiceTable from "../components/ServiceTable";
import { FaPlus, FaMapMarkedAlt, FaWallet } from "react-icons/fa";

export default function Dashboard() {
  return (
    <CustomerLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Requests" value="12" color="bg-indigo-600" />
        <StatCard title="Ongoing" value="2" color="bg-orange-500" />
        <StatCard title="Completed" value="8" color="bg-green-600" />
        <StatCard title="Pending" value="₹1200" color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <QuickAction icon={<FaPlus />} label="New Service" />
        <QuickAction icon={<FaMapMarkedAlt />} label="Track Service" />
        <QuickAction icon={<FaWallet />} label="Make Payment" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-4">Recent Services</h3>
        <ServiceTable />
      </div>
    </CustomerLayout>
  );
}
