import Search from "../app/pages/Search";
import PublicShell from "./PublicShell";

// Search, open to everyone. Comes off the landing page's search bar with the
// filters already applied.
export default function PublicSearch() {
  return (
    <PublicShell active="search">
      <Search chrome="public" />
    </PublicShell>
  );
}
