import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { AIDeckGenerator } from "./pages/AIDeckGenerator";
import { DeckComparison } from "./pages/DeckComparison";
import { MyDecks } from "./pages/MyDecks";
import { Profile } from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "ai-deck-generator", Component: AIDeckGenerator },
      { path: "deck-comparison", Component: DeckComparison },
      { path: "my-decks", Component: MyDecks },
      { path: "profile", Component: Profile },
    ],
  },
]);
