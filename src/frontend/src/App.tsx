import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import EmployeePortal from "./pages/EmployeePortal";
import LandingPage from "./pages/LandingPage";
import ManagerPanel from "./pages/ManagerPanel";

const queryClient = new QueryClient();

type View = "landing" | "employee" | "manager";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}

function AppInner() {
  const [view, setView] = useState<View>("landing");

  if (view === "employee") {
    return <EmployeePortal onBack={() => setView("landing")} />;
  }
  if (view === "manager") {
    return <ManagerPanel onBack={() => setView("landing")} />;
  }
  return (
    <LandingPage
      onEmployee={() => setView("employee")}
      onManager={() => setView("manager")}
    />
  );
}
