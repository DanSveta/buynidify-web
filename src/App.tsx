import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AppLayout from "./app/AppLayout";
import { RoleProvider } from "./app/context/RoleContext";
import { ThemeProvider } from "./app/context/ThemeContext";
import { FavoritesProvider } from "./app/context/FavoritesContext";
import { ListingsProvider } from "./app/context/ListingsContext";
import Overview from "./app/pages/Overview";
import MyProperties from "./app/pages/MyProperties";
import Marketplace from "./app/pages/Marketplace";
import Search from "./app/pages/Search";
import Shortlist from "./app/pages/Shortlist";
import Matches from "./app/pages/Matches";
import LocalServices from "./app/pages/LocalServices";
import Profile from "./app/pages/Profile";
import Verification from "./app/pages/Verification";
import PlatformListings from "./app/pages/PlatformListings";
import Pricing from "./app/pages/Pricing";
import HowItWorks from "./app/pages/HowItWorks";
import Relocate from "./app/pages/Relocate";
import B2B from "./app/pages/B2B";
import TenantDemand from "./app/pages/TenantDemand";
import Deals from "./app/pages/Deals";
import Premium from "./app/pages/Premium";
import Billing from "./app/pages/Billing";
import Support from "./app/pages/Support";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <RoleProvider>
      <FavoritesProvider>
      <ListingsProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="my-properties" element={<MyProperties />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="search" element={<Search />} />
            <Route path="shortlist" element={<Shortlist />} />
            <Route path="matches" element={<Matches />} />
            <Route path="local-services" element={<LocalServices />} />
            <Route path="profile" element={<Profile />} />
            <Route path="verification" element={<Verification />} />
            <Route path="platform-listings" element={<PlatformListings />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="how-it-works" element={<HowItWorks />} />
            <Route path="relocate" element={<Relocate />} />
            <Route path="b2b" element={<B2B />} />
            <Route path="tenant-demand" element={<TenantDemand />} />
            <Route path="deals" element={<Deals />} />
            <Route path="premium" element={<Premium />} />
            <Route path="billing" element={<Billing />} />
            <Route path="support" element={<Support />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ListingsProvider>
      </FavoritesProvider>
      </RoleProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
