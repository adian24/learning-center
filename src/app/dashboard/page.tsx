import Dashboard from "@/views/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Peserta | E-Learning",
  description: "Your personal dashboard",
  keywords: ["dashboard", "e-learning", "peserta"],
};

export default async function DashboardPage() {
  return <Dashboard />;
}
