// Planexa — App.tsx
// Routes: / (landing) | /calendar | /clients | /analytics | /settings | /book/:slug

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CalendarPage from "./pages/Calendar";
import ClientsPage from "./pages/Clients";
import AnalyticsPage from "./pages/Analytics";
import SettingsPage from "./pages/Settings";
import BookingPage from "./pages/Booking";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/clients" component={ClientsPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/book/:slug" component={BookingPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                backgroundColor: '#1E293B',
                border: '1px solid #2D6A4F',
                color: 'white',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
