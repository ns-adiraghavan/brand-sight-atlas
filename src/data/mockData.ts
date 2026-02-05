 // Mock data for FMCG Retail Intelligence Dashboard
 // Based on the authoritative schemas provided
 
 // === ONLINE AVAILABILITY (OLA) Mock Data ===
 export const olaKPIs = {
   overallAvailability: { value: 87.3, trend: { value: 2.1, direction: "up" as const } },
   topPacksAvailability: { value: 91.2, trend: { value: 1.5, direction: "up" as const } },
   mustHaveAvailability: { value: 84.6, trend: { value: -0.8, direction: "down" as const } },
   newLaunchAvailability: { value: 72.4, trend: { value: 5.3, direction: "up" as const } },
   skusAtRisk: { value: 47, trend: { value: 12, direction: "down" as const } },
 };
 
 export const olaHeatmapData: Record<string, Record<string, { value: number; level: "excellent" | "good" | "moderate" | "poor" | "critical" }>> = {
   "Personal Care": {
     "Amazon": { value: 94, level: "excellent" },
     "Flipkart": { value: 88, level: "good" },
     "BigBasket": { value: 76, level: "moderate" },
     "Blinkit": { value: 82, level: "good" },
   },
   "Home Care": {
     "Amazon": { value: 91, level: "excellent" },
     "Flipkart": { value: 85, level: "good" },
     "BigBasket": { value: 69, level: "poor" },
     "Blinkit": { value: 78, level: "moderate" },
   },
   "Foods": {
     "Amazon": { value: 82, level: "good" },
     "Flipkart": { value: 74, level: "moderate" },
     "BigBasket": { value: 91, level: "excellent" },
     "Blinkit": { value: 88, level: "good" },
   },
   "Beverages": {
     "Amazon": { value: 78, level: "moderate" },
     "Flipkart": { value: 65, level: "poor" },
     "BigBasket": { value: 84, level: "good" },
     "Blinkit": { value: 92, level: "excellent" },
   },
   "Health & Beauty": {
     "Amazon": { value: 56, level: "critical" },
     "Flipkart": { value: 62, level: "poor" },
     "BigBasket": { value: 71, level: "moderate" },
     "Blinkit": { value: 68, level: "poor" },
   },
 };
 
 export const olaLowAvailabilitySKUs = [
   {
     id: "1",
     rank: 1,
     title: "Dove Body Wash 250ml",
     subtitle: "EAN: 8901030736124 • Personal Care",
     value: "23%",
     valueLabel: "Availability",
     status: "critical" as const,
     metadata: { Customer: "BigBasket", Location: "Mumbai" },
   },
   {
     id: "2",
     rank: 2,
     title: "Surf Excel Matic 2kg",
     subtitle: "EAN: 8901030735929 • Home Care",
     value: "31%",
     valueLabel: "Availability",
     status: "critical" as const,
     metadata: { Customer: "Flipkart", Location: "Delhi" },
   },
   {
     id: "3",
     rank: 3,
     title: "Lipton Green Tea 100bags",
     subtitle: "EAN: 8901030736285 • Beverages",
     value: "45%",
     valueLabel: "Availability",
     status: "high" as const,
     metadata: { Customer: "Amazon", Location: "Bangalore" },
   },
   {
     id: "4",
     rank: 4,
     title: "Pond's Talc 400g",
     subtitle: "EAN: 8901030735417 • Personal Care",
     value: "52%",
     valueLabel: "Availability",
     status: "high" as const,
     metadata: { Customer: "Blinkit", Location: "Hyderabad" },
   },
   {
     id: "5",
     rank: 5,
     title: "Knorr Soups Variety Pack",
     subtitle: "EAN: 8901030736551 • Foods",
     value: "58%",
     valueLabel: "Availability",
     status: "medium" as const,
     metadata: { Customer: "BigBasket", Location: "Chennai" },
   },
 ];
 
 export const olaInsights = [
   {
     id: "1",
     type: "alert" as const,
     title: "Critical stockout: Dove Body Wash",
     description: "Availability dropped below 25% across 3 merchants in the last 24 hours.",
     timestamp: "2 hours ago",
   },
   {
     id: "2",
     type: "warning" as const,
     title: "Must-Have SKUs declining",
     description: "Must-Have availability down 0.8% WoW. 12 SKUs below threshold.",
     timestamp: "4 hours ago",
   },
   {
     id: "3",
     type: "info" as const,
     title: "New Launch performance",
     description: "New launches showing strong availability growth at +5.3% WoW.",
     timestamp: "1 day ago",
   },
 ];
 
 // === SHARE OF SEARCH (SoS) Mock Data ===
 export const sosKPIs = {
   brandShare: { value: 34.2, trend: { value: 3.4, direction: "up" as const } },
   organicShare: { value: 28.7, trend: { value: 1.2, direction: "up" as const } },
   sponsoredShare: { value: 41.5, trend: { value: -2.1, direction: "down" as const } },
   avgSearchRank: { value: 4.2, trend: { value: 0.8, direction: "up" as const } },
   keywordsTracked: { value: 156, trend: { value: 12, direction: "up" as const } },
 };
 
 export const sosHeatmapData: Record<string, Record<string, { value: number; level: "excellent" | "good" | "moderate" | "poor" | "critical" }>> = {
   "Shampoo": {
     "Brand Sponsored": { value: 42, level: "excellent" },
     "Sponsored": { value: 28, level: "good" },
     "Organic": { value: 18, level: "moderate" },
   },
   "Body Wash": {
     "Brand Sponsored": { value: 38, level: "good" },
     "Sponsored": { value: 31, level: "good" },
     "Organic": { value: 24, level: "good" },
   },
   "Detergent": {
     "Brand Sponsored": { value: 35, level: "good" },
     "Sponsored": { value: 22, level: "moderate" },
     "Organic": { value: 31, level: "good" },
   },
   "Tea": {
     "Brand Sponsored": { value: 28, level: "good" },
     "Sponsored": { value: 19, level: "moderate" },
     "Organic": { value: 38, level: "good" },
   },
   "Instant Noodles": {
     "Brand Sponsored": { value: 15, level: "poor" },
     "Sponsored": { value: 12, level: "poor" },
     "Organic": { value: 8, level: "critical" },
   },
 };
 
 export const sosTopPerformers = [
   {
     id: "1",
     rank: 1,
     title: "Dove Shampoo 340ml",
     subtitle: "Keyword: 'shampoo for dry hair' • Organic",
     value: "#1",
     valueLabel: "Search Rank",
     status: "low" as const,
   },
   {
     id: "2",
     rank: 2,
     title: "Surf Excel Easy Wash",
     subtitle: "Keyword: 'best detergent' • Brand Sponsored",
     value: "#2",
     valueLabel: "Search Rank",
     status: "low" as const,
   },
   {
     id: "3",
     rank: 3,
     title: "Lipton Yellow Label",
     subtitle: "Keyword: 'tea bags' • Organic",
     value: "#3",
     valueLabel: "Search Rank",
     status: "low" as const,
   },
   {
     id: "4",
     rank: 4,
     title: "Pond's Face Wash",
     subtitle: "Keyword: 'face wash for men' • Sponsored",
     value: "#4",
     valueLabel: "Search Rank",
     status: "medium" as const,
   },
   {
     id: "5",
     rank: 5,
     title: "Vim Dishwash Gel",
     subtitle: "Keyword: 'dishwash liquid' • Brand Sponsored",
     value: "#5",
     valueLabel: "Search Rank",
     status: "medium" as const,
   },
 ];
 
 export const sosBottomPerformers = [
   {
     id: "1",
     rank: 1,
     title: "Maggi Hot Heads",
     subtitle: "Keyword: 'instant noodles spicy' • Organic",
     value: "#47",
     valueLabel: "Search Rank",
     status: "critical" as const,
   },
   {
     id: "2",
     rank: 2,
     title: "Brooke Bond Red Label",
     subtitle: "Keyword: 'premium tea' • Organic",
     value: "#38",
     valueLabel: "Search Rank",
     status: "critical" as const,
   },
   {
     id: "3",
     rank: 3,
     title: "Comfort Fabric Conditioner",
     subtitle: "Keyword: 'fabric softener' • Sponsored",
     value: "#29",
     valueLabel: "Search Rank",
     status: "high" as const,
   },
   {
     id: "4",
     rank: 4,
     title: "Lakme Lipstick",
     subtitle: "Keyword: 'matte lipstick' • Brand Sponsored",
     value: "#24",
     valueLabel: "Search Rank",
     status: "high" as const,
   },
   {
     id: "5",
     rank: 5,
     title: "TRESemme Conditioner",
     subtitle: "Keyword: 'hair conditioner' • Organic",
     value: "#19",
     valueLabel: "Search Rank",
     status: "medium" as const,
   },
 ];
 
 export const sosInsights = [
   {
     id: "1",
     type: "alert" as const,
     title: "Lost #1 position: Instant Noodles",
     description: "Competition has taken top organic positions for key instant noodles keywords.",
     timestamp: "3 hours ago",
   },
   {
     id: "2",
     type: "warning" as const,
     title: "Sponsored share declining",
     description: "Sponsored visibility down 2.1% WoW. Consider bid optimization.",
     timestamp: "6 hours ago",
   },
   {
     id: "3",
     type: "info" as const,
     title: "Brand share improving",
     description: "Overall brand share up 3.4% driven by organic gains in Personal Care.",
     timestamp: "1 day ago",
   },
 ];