import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import PublicSearch from "./pages/PublicSearch";
import PublicListings from "./pages/PublicListings";
import PublicMyProperties from "./pages/PublicMyProperties";
import AppLayout from "./app/AppLayout";
import { RoleProvider } from "./app/context/RoleContext";
import { ThemeProvider } from "./app/context/ThemeContext";
import { FavoritesProvider } from "./app/context/FavoritesContext";
import { ListingsProvider } from "./app/context/ListingsContext";
import { ProfileProvider } from "./app/context/ProfileContext";
import { AuthGateProvider } from "./app/context/AuthGateContext";
import Overview from "./app/pages/Overview";
import MyProperties from "./app/pages/MyProperties";
import Marketplace from "./app/pages/Marketplace";
import Search from "./app/pages/Search";
import Shortlist from "./app/pages/Shortlist";
import Matches from "./app/pages/Matches";
import Profile from "./app/pages/Profile";
import PlatformListings from "./app/pages/PlatformListings";
import Messages from "./app/pages/Messages";
import HowItWorks from "./app/pages/HowItWorks";
import Relocate from "./app/pages/Relocate";
import B2B from "./app/pages/B2B";
import TenantDemand from "./app/pages/TenantDemand";
import Deals from "./app/pages/Deals";
import Support from "./app/pages/Support";

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <RoleProvider>
      <ProfileProvider>
      <FavoritesProvider>
      <ListingsProvider>
      <AuthGateProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          {/* Open to everyone: no account, no dashboard. */}
          <Route path="/search" element={<PublicSearch />} />
          <Route path="/listings" element={<PublicListings />} />
          {/* Same page as the portal's, in the public chrome, so a property
              you added while signed out behaves identically. */}
          <Route path="/my-properties" element={<PublicMyProperties />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="my-properties" element={<MyProperties />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="search" element={<Search />} />
            <Route path="shortlist" element={<Shortlist />} />
            <Route path="matches" element={<Matches />} />
            <Route path="profile" element={<Profile />} />
            <Route path="platform-listings" element={<PlatformListings />} />
            <Route path="messages" element={<Messages />} />
            <Route path="how-it-works" element={<HowItWorks />} />
            <Route path="relocate" element={<Relocate />} />
            <Route path="b2b" element={<B2B />} />
            <Route path="tenant-demand" element={<TenantDemand />} />
            <Route path="deals" element={<Deals />} />
            <Route path="support" element={<Support />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthGateProvider>
      </ListingsProvider>
      </FavoritesProvider>
      </ProfileProvider>
      </RoleProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
