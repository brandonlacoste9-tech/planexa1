// Planexa — App.tsx
// Routes: / (landing) | /calendar | /clients | /analytics | /settings | /book/:slug

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import PageLoader from "./components/PageLoader";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RouteSeo } from "./components/seo/RouteSeo";

const Home = lazy(() => import("./pages/Home"));
const CalendarPage = lazy(() => import("./pages/Calendar"));
const ClientsPage = lazy(() => import("./pages/Clients"));
const AnalyticsPage = lazy(() => import("./pages/Analytics"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const BookingPage = lazy(() => import("./pages/Booking"));
const PaymentsPage = lazy(() => import("./pages/Payments"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCanceled = lazy(() => import("./pages/PaymentCanceled"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <>
      <RouteSeo />
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/calendar" component={CalendarPage} />
          <Route path="/clients" component={ClientsPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/payments" component={PaymentsPage} />
          <Route path="/payment-success" component={PaymentSuccess} />
          <Route path="/payment-canceled" component={PaymentCanceled} />
          <Route path="/notification-settings" component={NotificationSettings} />
          <Route path="/book/:slug" component={BookingPage} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
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
