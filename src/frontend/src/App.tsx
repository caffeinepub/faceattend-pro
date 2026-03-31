import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import SplashScreen from "./components/SplashScreen";
import EmployeePortal from "./pages/EmployeePortal";
import LandingPage from "./pages/LandingPage";
import ManagerPanel from "./pages/ManagerPanel";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export type AppView = "landing" | "manager" | "employee";

export default function App() {
  const [view, setView] = useState<AppView>("landing");
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        ) : (
          <>
            {view === "landing" && <LandingPage onNavigate={setView} />}
            {view === "manager" && (
              <ManagerPanel onBack={() => setView("landing")} />
            )}
            {view === "employee" && (
              <EmployeePortal onBack={() => setView("landing")} />
            )}
          </>
        )}
      </AnimatePresence>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
