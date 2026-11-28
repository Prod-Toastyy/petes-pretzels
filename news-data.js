// news-data.js
// Headline content for the news popup. Loaded BEFORE news.js.
// Paste Gemma's output into the arrays below (keep one string per line).

// Random flavor headlines. Placeholder samples: replace with Gemma's list.
// Optional: use { text: "...", minContinent: 2 } to gate a headline to later areas.
const NEWS_RANDOM = [
  // General bakery nonsense
  "Pete declares dough 'emotionally ready' for the oven.",
  "Local baker claims yeast is just 'enthusiastic air.'",
  "Scientists find saltiness levels exceed historical norms.",
  "Town square filled with flour as Pete celebrates 'Grain Day.'",
  "Bakery atmosphere described as 'aggressively carb-heavy.'",
  "Flour shortage blamed on 'too much enthusiasm' from local bakers.",
  "Bread-related tensions rise over gluten-free debate.",
  "Pete introduces 'Passive-Aggressive Salt' for extra kick.",
  "Dough rising rate described as 'uncomfortably ambitious.'",
  "Baker claims yeast is 'the only thing keeping me sane.'",
  "Local woman claims pretzel gave her 'existential clarity.'",
  "Bakery floor declared a 'No-No-Running Zone' due to flour.",
  "Pete's oven reaches 'spiritual temperature' during peak hours.",
  "Flour-covered child hailed as 'Master of the Knead.'",
  "'Is it a pretzel or a hug?' - Bakery website remains undecided.",
  "Neighborhood observes 'Great Kneading.'",
  "Salt crystals found to have 'judgmental personalities.'",
  "Yeast colony voted 'Most Productive Resident' of the bakery.",
  "Pete declares flour a 'primary personality trait.'",
  "Local resident claims pretzel is 'actually a very long hug.'",
  "Baking competition ends in 'Mutual Carb Agreement.'",
  "Dough's rise trajectory compared to local stock market.",
  "Pete insists yeast is a 'team player.'",
  "Bakery scent declared a 'public service' by city council.",
  "Flour dusting ceremony becomes mandatory for all staff.",
  "'Too much salt' ruled a subjective culinary experience.",
  "Dough's texture described as 'confidently chewy.'",
  "Pete's secret ingredient revealed to be 'Optimism.'",
  "Bakery staff trained in 'Advanced Kneading Techniques.'",
  "Local man claims he can hear the dough whispering.",
  // Money, production and logistics
  "Pete declares warehouse capacity 'excessively spacious.'",
  "Factory automation replaces manual kneading with 'Mechanical Hugs.'",
  "Trucking fleet expands to include specialized pretzel-cradles.",
  "Production line achieves 'Uncanny Level of Consistency.'",
  "Logistic drone fleet learns to navigate through flour clouds.",
  "Production hub expands to accommodate 'Massive Dough Storage.'",
  "Factory workers call it 'The Great Knead of the Century.'",
  "Trucking schedule now includes 'Pretzel Nap Time.'",
  "Supply chain reaches 'Peak Bread-Logistics' status.",
  "Warehouse layout optimized for 'Rapid Pretzel Deployment.'",
  "Logistics fleet expands into high-altitude drone territory.",
  "Production line creates 'Perfectly Symmetric' carbs.",
  "Factory sensors detect 'High Levels of Baking Passion.'",
  "Warehouse expansion hailed as a 'Monument to Carbs.'",
  "Automated kneading robots praised for 'Soulful Motion.'",
  "Logistics hub establishes 'Priority Pretzel' lanes.",
  "Production scale allows for 'Pretzel-Based Diplomacy.'",
  "Trucking route optimized for 'Maximum Crust Crispness.'",
  "Factory drone fleet achieves 'Perfect Delivery Precision.'",
  "Supply chain manages 'Pretzel Avalanche' with ease.",
  "Production hub sets new record for 'Rhythmic Dough Folding.'",
  "Warehouse floor declared a 'Pretzel Sanctuary.'",
  "Logistic fleet pioneers 'Sub-Orbital Snack Transport.'",
  "Factory production 'Hits a Sweet Spot of Scalability.'",
  "Trucking fleet adds 'Express Salt' transport vehicles.",
  "Supply chain becomes a 'Symphony of Baked Goods.'",
  "Warehouse expansion provides room for 'Endless Dough.'",
  "Factory floor becomes the 'Heartbeat of the Empire.'",
  // North America (minContinent 0)
  { text: "Pretzel delivery drones mistaken for migratory birds.", minContinent: 0 },
  { text: "Pretzel shortage causes minor panic in local taco stand.", minContinent: 0 },
  { text: "North American pretzel belt now officially 'Infinite'.", minContinent: 0 },
  { text: "Pretzel truck takes scenic route to reach every cul-de-sac.", minContinent: 0 },
  { text: "Baker Pete spotted attempting to knead an entire mountain.", minContinent: 0 },
  { text: "Regional pretzel density reaches 'Heavy' status.", minContinent: 0 },
  // South America (minContinent 1)
  { text: "Pretzel logistics hub takes over local carnival.", minContinent: 1 },
  { text: "Local baker claims pretzel 'energy' is powering the dance.", minContinent: 1 },
  { text: "Pretzel delivery fleet navigates Amazonian jungle for snacks.", minContinent: 1 },
  { text: "Pretzel dough found to be highly aerodynamic in tropical winds.", minContinent: 1 },
  { text: "Pretzel-themed festival declared a cultural triumph.", minContinent: 1 },
  { text: "New pretzel variety launched to match local vibrant colors.", minContinent: 1 },
  // Europe (minContinent 2)
  { text: "Pretzel authenticity debated in village square for three days.", minContinent: 2 },
  { text: "Artisanal pretzel bakery takes over historic castle ruin.", minContinent: 2 },
  { text: "Pretzel shortage declared a 'Minor Tragedy' by local council.", minContinent: 2 },
  { text: "Pretzel-shaped monuments erected in honor of Pete's vision.", minContinent: 2 },
  { text: "Pretzel logistics network mirrors ancient trade routes.", minContinent: 2 },
  { text: "Pretzel dough's rise noted by local architects for inspiration.", minContinent: 2 },
  // Africa (minContinent 3)
  { text: "Pretzel distribution reaches remote savannah outposts.", minContinent: 3 },
  { text: "Pretzel-inspired oven designs take hold in regional hubs.", minContinent: 3 },
  { text: "Pretzel logistics team masters desert terrain for snack delivery.", minContinent: 3 },
  { text: "Pretzel dough considered a 'High-Carb Treasure'.", minContinent: 3 },
  { text: "Pretzel production centers celebrate local festival with salt.", minContinent: 3 },
  { text: "Pretzel supply chain pioneers new delivery method for plains.", minContinent: 3 },
  // Asia (minContinent 4)
  { text: "Pretzel delivery drones navigate neon-lit skyscrapers.", minContinent: 4 },
  { text: "Pretzel bakery competition reaches fever pitch in metro hubs.", minContinent: 4 },
  { text: "Pretzel dough rise compared to morning commute traffic.", minContinent: 4 },
  { text: "Pretzel distribution team navigates massive urban networks.", minContinent: 4 },
  { text: "Pretzel-inspired designs trend across social networks.", minContinent: 4 },
  { text: "Pete's pretzel empire expands into high-tech city centers.", minContinent: 4 },
  // Oceania (minContinent 5)
  { text: "Pretzel shipment arrives on surfboard for coastal deliveries.", minContinent: 5 },
  { text: "Pretzel dough endurance tested in extreme heat waves.", minContinent: 5 },
  { text: "Pretzel logistics hub establishes 'Island Hopping' route.", minContinent: 5 },
  { text: "Pretzel-themed beach party becomes local staple.", minContinent: 5 },
  { text: "Pretzel transport drones avoid local coastal waters.", minContinent: 5 },
  { text: "Pretzel bakery expansion sights tropical paradise.", minContinent: 5 },
  // Antarctica (minContinent 6)
  { text: "Pretzel shipment arrives via icebreaker for frozen snacks.", minContinent: 6 },
  { text: "Pretzel production reaches sub-zero efficiency records.", minContinent: 6 },
  { text: "Pretzel-shaped research base declared a 'Comfort Hub'.", minContinent: 6 },
  { text: "Pretzel dough resists freezing in extreme conditions.", minContinent: 6 },
  { text: "Pretzel logistics team pioneers arctic delivery methods.", minContinent: 6 },
  { text: "Pretzel-based survival kit distributed to research team.", minContinent: 6 },
];

// Milestone headlines. Each fires ONCE (tracked in GameState.newsSeen).
//   type "funds":     fires when GameState.funds >= at
//   type "pretzels":  fires when lifetime pretzels baked >= at
//   type "continent": fires on arriving at continent index `at`
// `id` must be unique and stable (it is the save key).
const NEWS_MILESTONES = [
  { id: "funds_1k",   type: "funds", at: 1000,        text: "Pete's Pretzels posts first four-figure profit. Pete celebrates with a pretzel." },
  { id: "funds_10k",  type: "funds", at: 10000,       text: "Local bakery now rich enough to afford a second oven mitt." },
  { id: "funds_100k", type: "funds", at: 100000,      text: "Analysts baffled as pretzel stand outperforms small nations." },
  { id: "funds_1m",   type: "funds", at: 1000000,     text: "Pretzel mogul crosses $1 million. Bank teller asks if he wants salt with that." },
  { id: "funds_10m",  type: "funds", at: 10000000,    text: "Stock market reacts to Pete's Pretzels earnings: 'Mmm, carbs.'" },
  { id: "funds_100m", type: "funds", at: 100000000,   text: "Economists admit the pretzel economy is, in fact, an economy." },
  { id: "funds_1b",   type: "funds", at: 1000000000,  text: "Pete is now a billionaire. His pretzel is still just a pretzel." },
  { id: "funds_10b",  type: "funds", at: 10000000000, text: "Global currency markets wobble. Pretzels blamed. Pretzels unbothered." },

  { id: "baked_100",   type: "pretzels", at: 100,         text: "100 pretzels baked. The neighbors have started to notice the smell." },
  { id: "baked_1k",    type: "pretzels", at: 1000,        text: "1,000 pretzels baked. Local carb levels reach historic highs." },
  { id: "baked_10k",   type: "pretzels", at: 10000,       text: "10,000 pretzels baked. Town council considers a pretzel zoning law." },
  { id: "baked_100k",  type: "pretzels", at: 100000,      text: "100,000 pretzels baked. Birds report being 'full, honestly'." },
  { id: "baked_1m",    type: "pretzels", at: 1000000,     text: "One million pretzels. Scientists confirm: that is a lot of pretzels." },
  { id: "baked_10m",   type: "pretzels", at: 10000000,    text: "10 million pretzels baked. Satellite photos show a faint golden-brown glow." },
  { id: "baked_100m",  type: "pretzels", at: 100000000,   text: "100 million pretzels. The Pretzel Council requests a bigger table." },
  { id: "baked_1b",    type: "pretzels", at: 1000000000,  text: "One billion pretzels baked. Mathematicians begin using them as a unit." },
  { id: "baked_10b",   type: "pretzels", at: 10000000000, text: "10 billion pretzels. Gravity now slightly favors the bakery." },

  { id: "cont_1", type: "continent", at: 1, text: "Pete's Pretzels lands in South America. Locals: 'Are those... knots?'" },
  { id: "cont_2", type: "continent", at: 2, text: "Europe welcomes the pretzel. Germany files a polite, firm objection." },
  { id: "cont_3", type: "continent", at: 3, text: "Pretzels reach Africa. Early reviews: crunchy, salty, 10/10 would twist." },
  { id: "cont_4", type: "continent", at: 4, text: "Asia gets the pretzel treatment. Ramen shops nervously take notes." },
  { id: "cont_5", type: "continent", at: 5, text: "Oceania expansion complete. Kangaroos seen carrying tiny pretzel bags." },
  { id: "cont_6", type: "continent", at: 6, text: "Antarctica now has pretzels. Penguins call it 'a salty miracle'." }
];

// Achievement headline overrides, keyed by achievement ID.
// If an ID is missing here, the achievement's own title is used as the headline.
const NEWS_ACHIEVEMENTS = {
  first_pretzel:        "Pete bakes his first pretzel. Critics: 'It's a start.'",
  scrape_the_barrel:    "Pete scrapes the bottom of the barrel. Barrel files complaint.",
  hundred_club:         "Ovens warm up. Neighbors warm up to the idea.",
  first_extruder:       "Dough now makes itself. Pete takes a long, well-earned nap.",
  hype_machine:         "Word on the street: pretzels. Street unavailable for comment.",
  fleet_commander:      "Pete's delivery fleet hits the road. Traffic: still bad.",
  ballistic_scientist:  "Dough ballistics lab opens. Insurance company stops answering calls.",
  gourmet_menu:         "Sweet and savory both on the menu. Pete refuses to pick a side.",
  cheese_connoisseur:   "Liquid gold flows. Cheese dip declared a public utility.",
  sky_delivery:         "Pretzel drones take flight. Airspace is now 40% carbs.",
  thousand_aire:        "Bakery bankroll hits four figures. Pete buys a fancier apron.",
  pretzel_tycoon:       "A pretzel empire rises. Its flag is, naturally, a knot.",
  pretzel_baron:        "Pete named Pretzel Baron. The title comes with a tiny crown.",
  pretzel_singularity:  "Pretzel Singularity reached. All roads now lead to dough.",
  millionaire_baker:    "Seven-figure baker spotted. Reportedly still smells like pretzels.",
  supply_magnate:       "Pete owns the whole supply chain. Salt is nervous.",
  golden_standard:      "Solid gold hardware installed. The oven has never looked smugger.",
  ten_million_club:     "Continental-scale production achieved. Continent not yet notified.",
  first_conquest:       "Beyond borders: Pete's pretzels cross into new territory.",
  golden_hoard_10:      "Gilded twist: Pete's golden pretzel stash reaches 10.",
  hundred_million_club: "Hundred-million twist reached. Pretzel math gets scary.",
  hundred_million_cash: "Pretzel hedge fund goes live. Strategy: 'buy salt, bake dough'.",
  four_continents:      "Pete rules four continents. Hemispheres begin to take sides.",
  golden_hoard_30:      "Sovereign of Salt crowned. The salt kingdom rejoices.",
  billion_pretzels:     "One billion knots tied. Shoelace industry demands a recount.",
  world_conqueror:      "World domination complete. Pete asks if anyone wants a pretzel.",
  ten_billion_cash:     "Decabillionaire baker confirmed. Wallet requires its own oven.",
  ten_billion_pretzels: "Galactic dough singularity. Astronomers file a very confused report."
};

// Tuning (ms). Used by news.js.
const NEWS_CONFIG = {
  randomMinMs: 150000,    // random headline no sooner than 2.5 min after the last popup
  randomMaxMs: 300000,    // ...and no later than 5 min
  cooldownMs: 45000,      // random headlines wait this long after any popup
  displayMs: 6500,        // how long a headline stays up
  maxQueue: 4             // drop extra random headlines if the queue is this deep
};
