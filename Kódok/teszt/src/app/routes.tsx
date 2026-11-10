import { createBrowserRouter, useParams } from "react-router";
import { AppProvider } from "./AppContext";
import { AdminLayout, PassengerLayout } from "../components/layouts";
import {
  AdminDashboardPage,
  AdminStatisticsPage,
  AuditLogPage,
  FaresAdminPage,
  RoutesAdminPage,
  ScheduleAdminPage,
  StopsAdminPage,
  UsersAdminPage,
  VehiclesAdminPage,
} from "../pages/AdminArea";
import { DriverPage } from "../pages/DriverPage";
import { MobilePage } from "../pages/MobilePage";
import { ErrorState } from "../components/ui";
import {
  PassengerNotificationsPage,
  PassengerPassesPage,
  PassengerPurchasePage,
  PassengerSettingsPage,
  PassengerTicketsPage,
  PassengerTrackingPage,
} from "../pages/PassengerArea";
import {
  PublicHomePage,
  PublicLoginPage,
  PublicRegistrationPage,
  PublicSearchPage,
  PublicTripDetailsPage,
} from "../pages/PublicPages";

function WithProvider({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

function ErrorRoute() {
  const { code } = useParams();
  const parsed = Number(code);
  const allowed = [400, 401, 403, 404, 409, 422, 500];
  return (
    <ErrorState
      code={(allowed.includes(parsed) ? parsed : 404) as 400 | 401 | 403 | 404 | 409 | 422 | 500}
    />
  );
}

export const router = createBrowserRouter([
  {
    element: (
      <WithProvider>
        <PassengerLayout />
      </WithProvider>
    ),
    children: [
      { path: "/", Component: PublicHomePage },
      { path: "/kereses", Component: PublicSearchPage },
      { path: "/jarat/:id", Component: PublicTripDetailsPage },
      { path: "/jegyvasarlas/:id", Component: PassengerPurchasePage },
      { path: "/berletek", Component: PassengerPassesPage },
      { path: "/jegyeim", Component: PassengerTicketsPage },
      { path: "/ertesitesek", Component: PassengerNotificationsPage },
      { path: "/jaratkovetes/:id", Component: PassengerTrackingPage },
      { path: "/beallitasok", Component: PassengerSettingsPage },
      { path: "/hiba/:code", Component: ErrorRoute },
    ],
  },
  {
    path: "/belepes",
    element: (
      <WithProvider>
        <PublicLoginPage />
      </WithProvider>
    ),
  },
  {
    path: "/regisztracio",
    element: (
      <WithProvider>
        <PublicRegistrationPage />
      </WithProvider>
    ),
  },
  {
    path: "/mobile",
    element: (
      <WithProvider>
        <MobilePage />
      </WithProvider>
    ),
  },
  {
    path: "/driver",
    element: (
      <WithProvider>
        <DriverPage />
      </WithProvider>
    ),
  },
  {
    path: "/admin",
    element: (
      <WithProvider>
        <AdminLayout />
      </WithProvider>
    ),
    children: [
      { index: true, Component: AdminDashboardPage },
      { path: "megallok", Component: StopsAdminPage },
      { path: "utvonalak", Component: RoutesAdminPage },
      { path: "jarmuvek", Component: VehiclesAdminPage },
      { path: "menetrend", Component: ScheduleAdminPage },
      { path: "dijszabas", Component: FaresAdminPage },
      { path: "felhasznalok", Component: UsersAdminPage },
      { path: "statisztika", Component: AdminStatisticsPage },
      { path: "naplo", Component: AuditLogPage },
    ],
  },
  {
    path: "*",
    element: (
      <WithProvider>
        <ErrorState code={404} />
      </WithProvider>
    ),
  },
]);
