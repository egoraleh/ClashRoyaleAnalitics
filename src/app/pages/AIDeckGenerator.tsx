import { useState } from "react";
import { Sparkles, RefreshCw, Copy } from "lucide-react";

const cards = [
  { name: "Hog Rider", elixir: 4, type: "Troop" },
  { name: "Valkyrie", elixir: 4, type: "Troop" },
  { name: "Musketeer", elixir: 4, type: "Troop" },
  { name: "Cannon", elixir: 3, type: "Building" },
  { name: "Fireball", elixir: 4, type: "Spell" },
  { name: "Log", elixir: 2, type: "Spell" },
  { name: "Ice Spirit", elixir: 1, type: "Troop" },
  { name: "Skeletons", elixir: 1, type: "Troop" },
];

export function AIDeckGenerator() {
  const [playstyle, setPlaystyle] = useState("Cycle");
  const [avgElixir, setAvgElixir] = useState("2.5-3.5");

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4">
        <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
          <h2 className="mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
            AI Configuration
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block mb-3 text-muted-foreground">Playstyle</label>
              <div className="grid grid-cols-2 gap-2">
                {["Cycle", "Beatdown", "Control", "Siege"].map((style) => (
                  <button
                    key={style}
                    onClick={() => setPlaystyle(style)}
                    className={`px-4 py-3 rounded-lg border transition-all ${
                      playstyle === style
                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "border-border bg-background/50 hover:bg-background"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-3 text-muted-foreground">Average Elixir</label>
              <div className="space-y-2">
                {["2.0-2.5", "2.5-3.5", "3.5-4.5", "4.5+"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setAvgElixir(range)}
                    className={`w-full px-4 py-3 rounded-lg border transition-all text-left ${
                      avgElixir === range
                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "border-border bg-background/50 hover:bg-background"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-3 text-muted-foreground">Card Preferences</label>
              <div className="flex flex-wrap gap-2">
                {["Win Condition", "Tank", "Spell", "Building"].map((pref) => (
                  <button
                    key={pref}
                    className="px-3 py-2 rounded-lg border border-border bg-background/50 hover:bg-accent transition-colors text-sm"
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Deck
            </button>
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2>Generated Deck</h2>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg border border-border bg-background/50 hover:bg-background transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {cards.map((card, index) => (
              <div
                key={index}
                className="aspect-[3/4] rounded-lg bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-border/50 p-4 flex flex-col items-center justify-center hover:border-primary transition-all group cursor-pointer shadow-lg hover:shadow-primary/20"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-xl">{card.type === "Troop" ? "⚔️" : card.type === "Spell" ? "✨" : "🏰"}</span>
                </div>
                <div className="text-center mb-2">{card.name}</div>
                <div className="px-3 py-1 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6]/30">
                  <span className="text-[#c4b5fd]">{card.elixir}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Avg Elixir</div>
              <div className="text-xl">2.9</div>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
              <div className="text-xl text-[#10b981]">68%</div>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border/50">
              <div className="text-sm text-muted-foreground mb-1">Synergy Score</div>
              <div className="text-xl text-[#06b6d4]">A+</div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gradient-to-br from-[#6366f1]/10 to-[#8b5cf6]/10 border border-primary/20">
            <h3 className="mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
              AI Analysis
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              This fast-cycle deck excels at applying constant pressure with the Hog Rider as your primary win condition.
              Use Valkyrie and Musketeer for defense, then counter-push. Cannon pulls tanks, while Fireball and Log handle swarms.
              Ice Spirit and Skeletons cycle quickly and provide excellent value trades. Average elixir of 2.9 allows for rapid cycling
              and outcycling opponent's counters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
