 // Mock data for FMCG Retail Intelligence Dashboard
 // Based on the authoritative schemas provided
 
 // === ONLINE AVAILABILITY (OLA) Mock Data ===
 export const olaKPIs = {
   overallAvailability: { value: 87.3, trend: { value: 2.1, direction: "up" as const } },
   topPacksAvailability: { value: 91.2, trend: { value: 1.5, direction: "up" as const } },
   mustHaveAvailability: { value: 84.6, trend: { value: -0.8, direction: "down" as const } },
   newLaunchAvailability: { value: 72.4, trend: { value: 5.3, direction: "up" as const } },
   skusAtRisk: { value: 47, trend: { value: 12, direction: "down" as const } },
   totalPincodes: { value: 156, trend: { value: 8, direction: "up" as const } },
   avgPincodeAvailability: { value: 82.1, trend: { value: 1.8, direction: "up" as const } },
 };
 
 // Pincode-level availability data (based on OLA schema: Pincode, Location, Availability)
 export const olaPincodeData = [
   { pincode: "400001", location: "Mumbai - Fort", available: 142, total: 156, availability: 91, merchant: "Amazon" },
   { pincode: "400053", location: "Mumbai - Andheri", available: 138, total: 156, availability: 88, merchant: "Flipkart" },
   { pincode: "110001", location: "Delhi - Connaught Place", available: 134, total: 156, availability: 86, merchant: "BigBasket" },
   { pincode: "560001", location: "Bangalore - MG Road", available: 128, total: 156, availability: 82, merchant: "Blinkit" },
   { pincode: "500001", location: "Hyderabad - Secunderabad", available: 121, total: 156, availability: 78, merchant: "Amazon" },
   { pincode: "600001", location: "Chennai - George Town", available: 118, total: 156, availability: 76, merchant: "Flipkart" },
   { pincode: "411001", location: "Pune - Camp", available: 112, total: 156, availability: 72, merchant: "BigBasket" },
   { pincode: "380001", location: "Ahmedabad - Lal Darwaja", available: 98, total: 156, availability: 63, merchant: "Blinkit" },
   { pincode: "700001", location: "Kolkata - BBD Bagh", available: 89, total: 156, availability: 57, merchant: "Amazon" },
   { pincode: "302001", location: "Jaipur - MI Road", available: 78, total: 156, availability: 50, merchant: "Flipkart" },
 ];
 
 // SKU × Pincode availability patterns (based on OLA schema)
 export const olaSkuPincodeData = [
   {
     id: "1",
     ean: "8901030736124",
     basepack: "Dove Body Wash 250ml",
     salesCategory: "Personal Care",
     mustHave: true,
     topPack: true,
     newLaunch: false,
     pincodeAvailability: [
       { pincode: "400001", available: true, merchant: "Amazon", salePrice: 299, mrp: 350 },
       { pincode: "400053", available: true, merchant: "Flipkart", salePrice: 289, mrp: 350 },
       { pincode: "110001", available: false, merchant: "BigBasket", salePrice: null, mrp: 350 },
       { pincode: "560001", available: false, merchant: "Blinkit", salePrice: null, mrp: 350 },
     ],
     totalAvailable: 2,
     totalPincodes: 4,
     availabilityPct: 50,
   },
   {
     id: "2",
     ean: "8901030735929",
     basepack: "Surf Excel Matic 2kg",
     salesCategory: "Home Care",
     mustHave: true,
     topPack: true,
     newLaunch: false,
     pincodeAvailability: [
       { pincode: "400001", available: true, merchant: "Amazon", salePrice: 425, mrp: 480 },
       { pincode: "400053", available: true, merchant: "Flipkart", salePrice: 419, mrp: 480 },
       { pincode: "110001", available: true, merchant: "BigBasket", salePrice: 435, mrp: 480 },
       { pincode: "560001", available: false, merchant: "Blinkit", salePrice: null, mrp: 480 },
     ],
     totalAvailable: 3,
     totalPincodes: 4,
     availabilityPct: 75,
   },
   {
     id: "3",
     ean: "8901030736285",
     basepack: "Lipton Green Tea 100bags",
     salesCategory: "Beverages",
     mustHave: false,
     topPack: true,
     newLaunch: false,
     pincodeAvailability: [
       { pincode: "400001", available: true, merchant: "Amazon", salePrice: 320, mrp: 375 },
       { pincode: "400053", available: false, merchant: "Flipkart", salePrice: null, mrp: 375 },
       { pincode: "110001", available: true, merchant: "BigBasket", salePrice: 315, mrp: 375 },
       { pincode: "560001", available: true, merchant: "Blinkit", salePrice: 329, mrp: 375 },
     ],
     totalAvailable: 3,
     totalPincodes: 4,
     availabilityPct: 75,
   },
   {
     id: "4",
     ean: "8901030735417",
     basepack: "Pond's Talc 400g",
     salesCategory: "Personal Care",
     mustHave: false,
     topPack: false,
     newLaunch: true,
     pincodeAvailability: [
       { pincode: "400001", available: true, merchant: "Amazon", salePrice: 185, mrp: 210 },
       { pincode: "400053", available: true, merchant: "Flipkart", salePrice: 179, mrp: 210 },
       { pincode: "110001", available: true, merchant: "BigBasket", salePrice: 189, mrp: 210 },
       { pincode: "560001", available: true, merchant: "Blinkit", salePrice: 182, mrp: 210 },
     ],
     totalAvailable: 4,
     totalPincodes: 4,
     availabilityPct: 100,
   },
   {
     id: "5",
     ean: "8901030736551",
     basepack: "Knorr Soups Variety Pack",
     salesCategory: "Foods",
     mustHave: true,
     topPack: false,
     newLaunch: false,
     pincodeAvailability: [
       { pincode: "400001", available: false, merchant: "Amazon", salePrice: null, mrp: 245 },
       { pincode: "400053", available: true, merchant: "Flipkart", salePrice: 229, mrp: 245 },
       { pincode: "110001", available: false, merchant: "BigBasket", salePrice: null, mrp: 245 },
       { pincode: "560001", available: false, merchant: "Blinkit", salePrice: null, mrp: 245 },
     ],
     totalAvailable: 1,
     totalPincodes: 4,
     availabilityPct: 25,
   },
 ];
 
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
   {
     id: "6",
     rank: 6,
     title: "Closeup Toothpaste 150g",
     subtitle: "EAN: 8901030736789 • Personal Care",
     value: "61%",
     valueLabel: "Availability",
     status: "medium" as const,
     metadata: { Customer: "Amazon", Location: "Pune" },
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
 
// === SHARE OF SEARCH (SoS) Mock Data - Rank-Centric ===
export const sosKPIs = {
  avgSearchRank: { value: 4.2, trend: { value: 0.8, direction: "up" as const } },
  keywordsTracked: { value: 156, trend: { value: 12, direction: "up" as const } },
  keywordsInTop3: { value: 42, trend: { value: 5, direction: "up" as const } },
  keywordsInTop10: { value: 89, trend: { value: 8, direction: "up" as const } },
  keywordsBelowTop20: { value: 23, trend: { value: -4, direction: "down" as const } },
 };
 
// Rank distribution data - how keywords are distributed across rank buckets
export const sosRankDistribution = [
  { bucket: "Top 3", count: 42, pctOfTotal: 27 },
  { bucket: "4-10", count: 47, pctOfTotal: 30 },
  { bucket: "11-20", count: 44, pctOfTotal: 28 },
  { bucket: "Below 20", count: 23, pctOfTotal: 15 },
];

// Visibility by result type - presence counts, not shares
export const sosVisibilityByType = [
  { type: "Organic", keywordsPresent: 89, avgRank: 6.2, inTop10: 52 },
  { type: "Sponsored", keywordsPresent: 67, avgRank: 3.8, inTop10: 48 },
  { type: "Brand Sponsored", keywordsPresent: 43, avgRank: 2.1, inTop10: 38 },
];

// Keyword-level rank tracking
export const sosKeywordRankings = [
  { keyword: "shampoo for dry hair", rank: 1, resultType: "Organic", product: "Dove Shampoo 340ml", trend: "stable" as const },
  { keyword: "best detergent", rank: 2, resultType: "Brand Sponsored", product: "Surf Excel Easy Wash", trend: "up" as const },
  { keyword: "tea bags", rank: 3, resultType: "Organic", product: "Lipton Yellow Label", trend: "stable" as const },
  { keyword: "face wash for men", rank: 4, resultType: "Sponsored", product: "Pond's Face Wash", trend: "up" as const },
  { keyword: "dishwash liquid", rank: 5, resultType: "Brand Sponsored", product: "Vim Dishwash Gel", trend: "down" as const },
  { keyword: "body lotion", rank: 7, resultType: "Organic", product: "Vaseline Body Lotion", trend: "up" as const },
  { keyword: "hair oil", rank: 12, resultType: "Sponsored", product: "Clinic Plus Hair Oil", trend: "down" as const },
  { keyword: "instant noodles spicy", rank: 47, resultType: "Organic", product: "Maggi Hot Heads", trend: "down" as const },
  { keyword: "premium tea", rank: 38, resultType: "Organic", product: "Brooke Bond Red Label", trend: "down" as const },
  { keyword: "fabric softener", rank: 29, resultType: "Sponsored", product: "Comfort Fabric Conditioner", trend: "down" as const },
];
 
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
    title: "Rank drop: Instant Noodles keywords",
    description: "3 keywords dropped below position 20 in organic results this week.",
     timestamp: "3 hours ago",
   },
   {
     id: "2",
     type: "warning" as const,
    title: "Declining visibility in Sponsored",
    description: "12 keywords lost sponsored placement. Review bid strategy.",
     timestamp: "6 hours ago",
   },
   {
     id: "3",
     type: "info" as const,
    title: "Strong organic performance",
    description: "5 new keywords entered top 3 organic positions this week.",
     timestamp: "1 day ago",
   },
 ];