import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import PublicSearch from "./pages/PublicSearch";
import PublicListings from "./pages/PublicListings";
import PublicMyProperties from "./pages/PublicMyProperties";
import Partners from "./pages/Partners";
import About from "./pages/About";
import PropertyPage from "./pages/PropertyPage";
import JourneyOptions from "./pages/JourneyOptions";
import AppLayout from "./app/AppLayout";
import { RoleProvider } from "./app/context/RoleContext";
import { ThemeProvider } from "./app/context/ThemeContext";
import { FavoritesProvider } from "./app/context/FavoritesContext";
import { ListingsProvider } from "./app/context/ListingsContext";
import { ProfileProvider } from "./app/context/ProfileContext";
import { AuthGateProvider } from "./app/context/AuthGateContext";
import Overview from "./app/pages/Overview";
import MyProperties from "./app/pages/MyProperties";
import Search from "./app/pages/Search";
import Shortlist from "./app/pages/Shortlist";
import Matches from "./app/pages/Matches";
import Profile from "./app/pages/Profile";
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
          {/* The service-company application page Andrew asked for - open
              to anyone, no account needed to apply. */}
          <Route path="/partners" element={<Partners />} />
          <Route path="/about" element={<About />} />
          {/* One property, one page, opened in a new tab from any card -
              everything about it in one place instead of scattered across
              a card, a modal and a My Properties row. Works whether you're
              signed in, signed out, browsing or the owner. */}
          <Route path="/property/:id" element={<PropertyPage />} />
          {/* Internal design-review page for the Choose Your Journey
              redesign - not linked in any nav, just a direct URL so Véta
              can compare the three directions side by side. */}
          <Route path="/journey-options" element={<JourneyOptions />} />
          {/* Browsing used to also live inside the gated dashboard at this
              path; it's now only here, in the public listings page, so a
              bookmark to the old portal URL still lands somewhere useful. */}
          <Route path="/app/platform-listings" element={<Navigate to="/listings" replace />} />

          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="my-properties" element={<MyProperties />} />
            <Route path="search" element={<Search />} />
            <Route path="shortlist" element={<Shortlist />} />
            <Route path="matches" element={<Matches />} />
            <Route path="profile" element={<Profile />} />
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
