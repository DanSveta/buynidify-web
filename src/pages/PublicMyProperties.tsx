import PublicShell from "./PublicShell";
import MyProperties from "../app/pages/MyProperties";

// The same My Properties page the portal shows, in the public chrome.
//
// Browsing without an account still gives you properties: you paste a link,
// analyse it, and it's yours. Those need somewhere to live, and it has to be
// the same somewhere, with the same cards and the same actions, or the demo
// looks like two different products. Only the actions that commit you to
// something (publish, request to proceed) ask you to join, which the auth
// gate already handles inside the page.

export default function PublicMyProperties() {
  return (
    <PublicShell active="my-properties">
      <MyProperties />
    </PublicShell>
  );
}
