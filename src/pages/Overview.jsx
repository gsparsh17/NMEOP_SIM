import React, { useState, useEffect } from "react";
import {
  STATES,
  YEARS,
  SCENARIOS,
  importsProdConsData,
  importShareByCountry,
  scenarioComparisonRows,
  liveMarket,
  farmerRisk,
  supplyGapSummary,
  nmeoOpProgress,
  ffbPriceTrend,
  cpoPriceTrend,
  policyActions,
  stateWiseData,
  telanganaPriceData,
  getPriceData,
  getProductionData,
} from "../data/staticData";
import { getLiveMarketData, getAgriculturalWeatherAlerts, checkAPIStatus } from "../services/apiService";
import ImportsProdChart from "../components/charts/ImportsProdChart";
import PriceTrendChart from "../components/charts/PriceTrendChart";
import PalmOilPriceChart from "../components/charts/PalmOilPriceChart";
import { useNavigate } from "react-router-dom";

// NewsAPI.org Configuration
const NEWSAPI_KEY = "522b468b39d449b1b1a31de1e5b642e2";
const NEWSAPI_BASE_URL = "https://newsapi.org/v2";

// Fetch Malaysian news from NewsAPI
   // Update the NewsAPI fetching function to use search instead of country-specific headlines
const fetchMalaysianIndonesianNews = async () => {
  try {
    console.log("Fetching Malaysian and Indonesian news...");
    
    // Use search queries instead of country-specific endpoints
    // Search for palm oil related news in English from Southeast Asia sources
    const searchQueries = [
      'palm oil Malaysia',
      'palm oil Indonesia', 
      'CPO Malaysia',
      'CPO Indonesia',
      'Malaysia palm oil export',
      'Indonesia palm oil export',
      'ASEAN palm oil',
      'palm oil plantation',
      'crude palm oil price',
      'biodiesel Malaysia',
      'biodiesel Indonesia',
      'el niño palm oil',
      'drought palm oil',
      'palm oil trade',
      'palm oil tariff'
    ];
    
    // Try multiple search queries
    const allArticles = [];
    
    for (const query of searchQueries.slice(0, 5)) { // Limit to 5 queries to avoid rate limiting
      try {
        const searchResponse = await fetch(
          `${NEWSAPI_BASE_URL}/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWSAPI_KEY}`
        );
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.articles && searchData.articles.length > 0) {
            // Add country metadata based on content analysis
            const articlesWithCountry = searchData.articles.map(article => {
              const title = article.title?.toLowerCase() || '';
              const content = article.content?.toLowerCase() || '';
              const source = article.source?.name?.toLowerCase() || '';
              
              let country = 'Regional';
              let category = 'general';
              
              // Detect country from content
              if (title.includes('malaysia') || content.includes('malaysia') || 
                  title.includes('kuala lumpur') || source.includes('malaysia') ||
                  title.includes('ringgit') || title.includes('myr')) {
                country = 'Malaysia';
              } else if (title.includes('indonesia') || content.includes('indonesia') ||
                         title.includes('jakarta') || source.includes('indonesia') ||
                         title.includes('rupiah') || title.includes('idr')) {
                country = 'Indonesia';
              }
              
              // Detect category
              if (title.includes('price') || title.includes('market') || 
                  title.includes('trade') || title.includes('export') ||
                  title.includes('import') || title.includes('economy')) {
                category = 'business';
              } else if (title.includes('weather') || title.includes('climate') ||
                         title.includes('drought') || title.includes('el niño') ||
                         title.includes('rain') || title.includes('flood')) {
                category = 'weather';
              } else if (title.includes('policy') || title.includes('government') ||
                         title.includes('tariff') || title.includes('subsidy') ||
                         title.includes('regulation')) {
                category = 'policy';
              } else if (title.includes('environment') || title.includes('sustainable') ||
                         title.includes('forest') || title.includes('deforestation')) {
                category = 'environment';
              }
              
              return {
                ...article,
                country,
                category,
                searchQuery: query
              };
            });
            
            allArticles.push(...articlesWithCountry);
          }
        }
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.warn(`Error fetching news for query "${query}":`, error);
      }
    }
    
    console.log(`Total articles fetched: ${allArticles.length}`);
    
    if (allArticles.length === 0) {
      console.log("No articles found via search, using fallback news");
      return getFallbackNews();
    }
    
    // Remove duplicates based on title
    const uniqueArticles = allArticles.filter((article, index, self) =>
      index === self.findIndex(a => a.title === article.title)
    );
    
    console.log(`Unique articles: ${uniqueArticles.length}`);
    
    // Sort by relevance and date
    const sortedArticles = uniqueArticles.sort((a, b) => {
      const aTitle = a.title?.toLowerCase() || '';
      const bTitle = b.title?.toLowerCase() || '';
      
      let aScore = 0;
      let bScore = 0;
      
      // Score for palm oil mentions
      if (aTitle.includes('palm oil') || aTitle.includes('cpo')) aScore += 20;
      if (bTitle.includes('palm oil') || bTitle.includes('cpo')) bScore += 20;
      
      // Score for country specificity
      if (a.country === 'Malaysia') aScore += 10;
      if (b.country === 'Malaysia') bScore += 10;
      
      if (a.country === 'Indonesia') aScore += 10;
      if (b.country === 'Indonesia') bScore += 10;
      
      // Score for recency
      try {
        const aDate = new Date(a.publishedAt);
        const bDate = new Date(b.publishedAt);
        const now = new Date();
        
        const aHoursAgo = (now - aDate) / (1000 * 60 * 60);
        const bHoursAgo = (now - bDate) / (1000 * 60 * 60);
        
        // More recent articles get higher score
        if (aHoursAgo < 24) aScore += 15 - (aHoursAgo / 24) * 10;
        if (bHoursAgo < 24) bScore += 15 - (bHoursAgo / 24) * 10;
      } catch (e) {
        // Ignore date parsing errors
      }
      
      return bScore - aScore;
    });
    
    return sortedArticles.slice(0, 25);
    
  } catch (error) {
    console.error('Error fetching Malaysian and Indonesian news:', error);
    return getFallbackNews();
  }
};

// Fallback news data
const getFallbackNews = () => {
  return [
    {
      title: "Malaysian Palm Oil Exports Rise 15% in November",
      description: "Palm oil exports from Malaysia increased significantly amid global demand surge.",
      source: { name: "The Star Malaysia" },
      publishedAt: new Date().toISOString(),
      url: "#"
    },
    {
      title: "El Niño Weather Pattern May Impact Palm Oil Production",
      description: "Meteorological department warns of potential drought affecting plantations.",
      source: { name: "Bernama" },
      publishedAt: new Date().toISOString(),
      url: "#"
    },
    {
      title: "Malaysia-India Trade Relations Strengthen with New Palm Oil Agreement",
      description: "Bilateral trade agreement expected to boost palm oil exports to India.",
      source: { name: "Malay Mail" },
      publishedAt: new Date().toISOString(),
      url: "#"
    },
    {
      title: "CPO Futures Show Volatility Amid Global Market Uncertainty",
      description: "Crude palm oil prices fluctuate as markets react to economic indicators.",
      source: { name: "Business Times Malaysia" },
      publishedAt: new Date().toISOString(),
      url: "#"
    },
    {
      title: "Heavy Rains Disrupt Palm Oil Harvest in Sabah Region",
      description: "Plantation operations affected by unexpected rainfall patterns.",
      source: { name: "Free Malaysia Today" },
      publishedAt: new Date().toISOString(),
      url: "#"
    }
  ];
};

// Update your fetch function to call the new endpoint
const fetchPalmOilCommodityData = async () => {
  try {
    console.log("Fetching palm oil data from API...");
    const response = await fetch('http://localhost:5000/scrape/palm-oil/all');
    
    if (!response.ok) {
      console.error(`API responded with status: ${response.status}`);
      // Return fallback data
      return {
        status: "success",
        data: {
          daily_price: {
            price_myr: 4156.0,
            price_inr: 4156.0 * 21.92,
            change_myr: -4.0,
            change_percent: "-0.10%",
            currency: "MYR/T",
            exchange_rate: 21.92,
            unit: "metric ton",
            scraped_at: new Date().toISOString(),
            source: "https://tradingeconomics.com/commodity/palm-oil",
            source_currency: "MYR",
            target_currency: "INR",
            note: "Fallback data"
          },
          graph_data: [],
          summary_stats: {},
          timestamp: new Date().toISOString(),
          exchange_rate: 21.92
        },
        note: "Using fallback data due to API error"
      };
    }
    
    const data = await response.json();
    console.log("Palm oil data fetched successfully:", data);
    return data;
  } catch (error) {
    console.error('Error fetching palm oil data:', error);
    // Return fallback data
    return {
      status: "success",
      data: {
        daily_price: {
          price_myr: 4156.0,
          price_inr: 4156.0 * 21.92,
          change_myr: -4.0,
          change_percent: "-0.10%",
          currency: "MYR/T",
          exchange_rate: 21.92,
          unit: "metric ton",
          scraped_at: new Date().toISOString(),
          source: "https://tradingeconomics.com/commodity/palm-oil",
          source_currency: "MYR",
          target_currency: "INR",
          note: "Fallback data - network error"
        },
        graph_data: [],
        summary_stats: {},
        timestamp: new Date().toISOString(),
        exchange_rate: 21.92
      },
      note: "Using fallback data due to network error"
    };
  }
};

// Helper function to format INR currency
const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹ 0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Helper function to format MYR currency
const formatMYR = (amount) => {
  if (amount === undefined || amount === null) return 'MYR 0';
  
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Helper function to format USD currency
const formatUSD = (amount) => {
  if (!amount) return '$ 0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Helper function to format date
const formatMonthYear = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    month: 'long', 
    year: 'numeric' 
  });
};

// Helper function to format short date
const formatShortDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric',
    month: 'short'
  });
};

// Format news date
const formatNewsDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffHours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric',
    month: 'short'
  });
};

// Calculate percentage change
const getPercentageChange = (current, previous) => {
  if (!previous || previous === 0 || !current) return 0;
  return ((current - previous) / previous) * 100;
};

// Format percentage change
const formatPercentageChange = (percent) => {
  if (percent > 0) return `+${percent.toFixed(2)}%`;
  if (percent < 0) return `${percent.toFixed(2)}%`;
  return '0.00%';
};

// Get change statement
const getChangeStatement = (percent) => {
  if (percent > 5) return 'Significant Increase';
  if (percent > 2) return 'Moderate Increase';
  if (percent > 0) return 'Slight Increase';
  if (percent < -5) return 'Significant Decrease';
  if (percent < -2) return 'Moderate Decrease';
  if (percent < 0) return 'Slight Decrease';
  return 'Stable';
};

// Get alert level based on percentage change
const getAlertLevel = (percent) => {
  if (percent > 5) {
    return {
      level: 'CRITICAL',
      color: 'border-red-500',
      dotColor: 'bg-red-500',
      badgeColor: 'bg-red-100 text-red-800',
      pulse: true
    };
  } else if (percent > 2) {
    return {
      level: 'HIGH',
      color: 'border-orange-500',
      dotColor: 'bg-orange-500',
      badgeColor: 'bg-orange-100 text-orange-800',
      pulse: false
    };
  } else if (percent > 0) {
    return {
      level: 'MODERATE',
      color: 'border-amber-500',
      dotColor: 'bg-amber-500',
      badgeColor: 'bg-amber-100 text-amber-800',
      pulse: false
    };
  } else if (percent < -2) {
    return {
      level: 'OPPORTUNITY',
      color: 'border-green-500',
      dotColor: 'bg-green-500',
      badgeColor: 'bg-green-100 text-green-800',
      pulse: false
    };
  } else {
    return {
      level: 'STABLE',
      color: 'border-blue-500',
      dotColor: 'bg-blue-500',
      badgeColor: 'bg-blue-100 text-blue-800',
      pulse: false
    };
  }
};

// Generate market statement based on price change
const generateMarketStatement = (percentChange, currentPriceMYR, currentPriceINR) => {
  const formatPrice = (price, currency = 'MYR') => {
    if (!price) return 'N/A';
    
    switch (currency) {
      case 'INR':
        return formatINR(price);
      case 'MYR':
        return formatMYR(price);
      case 'USD':
      default:
        return formatUSD(price);
    }
  };
  
  const formattedCurrentPrice = formatPrice(currentPriceMYR, 'MYR');
  const formattedINRPrice = formatPrice(currentPriceINR, 'INR');
  const changeFormatted = formatPercentageChange(percentChange);
  
  if (percentChange > 5) {
    return `Global CPO prices surged ${changeFormatted} this month to ${formattedCurrentPrice} (${formattedINRPrice} in INR). Consider temporary duty adjustments to protect domestic consumers and review strategic reserve replenishment timing.`;
  } else if (percentChange > 2) {
    return `CPO prices increased ${changeFormatted} to ${formattedCurrentPrice}. Monitor import costs and review subsidy requirements for vulnerable consumer segments.`;
  } else if (percentChange > 0) {
    return `CPO prices edged up ${changeFormatted} to ${formattedCurrentPrice}. Market remains within stable range, continue monitoring global supply conditions.`;
  } else if (percentChange < -5) {
    return `CPO prices declined ${changeFormatted} to ${formattedCurrentPrice}. Opportunity to build strategic reserves at lower costs. Review import substitution strategy.`;
  } else if (percentChange < -2) {
    return `CPO prices decreased ${changeFormatted} to ${formattedCurrentPrice}. Favorable conditions for import cost reduction and consumer price relief.`;
  } else if (percentChange < 0) {
    return `CPO prices softened ${changeFormatted} to ${formattedCurrentPrice}. Mild downward pressure on import bills, maintain current policy settings.`;
  } else {
    return `CPO prices stable at ${formattedCurrentPrice}. Market equilibrium maintained, current policy settings appear appropriate.`;
  }
};

// News Marquee Component
const NewsMarquee = ({ articles, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-900 to-[#003366] text-white py-3 px-4 border-b border-blue-800">
        <div className="flex items-center justify-center gap-3">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">Loading Malaysian news updates...</span>
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-900 to-[#003366] text-white py-3 px-4 border-b border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <span className="text-sm">No Malaysian news available at the moment</span>
          </div>
          <button 
            onClick={onRefresh}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-900 to-[#003366] text-white py-3 border-b border-blue-800">
      <div className="flex items-center px-4 mb-2">
        <div className="flex items-center gap-2 mr-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <span className="text-sm font-bold">WORLD NEWS UPDATES</span>
          <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>LIVE</span>
          </div>
        </div>
        <div className="text-xs opacity-80">
          Business • Foreign Policy • Natural Calamity • Trade Updates
        </div>
        <button 
          onClick={onRefresh}
          className="ml-auto text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      
      <div className="relative overflow-hidden">
        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            animation: marquee 70s linear infinite;
          }
          .pause-on-hover:hover .animate-marquee {
            animation-play-state: paused;
          }
        `}</style>
        
        <div className="pause-on-hover">
          <div className="flex animate-marquee whitespace-nowrap">
            {articles.map((article, index) => {
              // Determine category color based on content
              const title = article.title?.toLowerCase() || '';
              let category = "General";
              let categoryColor = "bg-gray-600";
              
              if (title.includes('palm oil') || title.includes('cpo') || title.includes('export') || title.includes('trade')) {
                category = "Palm Oil";
                categoryColor = "bg-amber-600";
              } else if (title.includes('weather') || title.includes('flood') || title.includes('drought') || title.includes('climate')) {
                category = "Weather";
                categoryColor = "bg-blue-600";
              } else if (title.includes('policy') || title.includes('agreement') || title.includes('diplomacy')) {
                category = "Policy";
                categoryColor = "bg-green-600";
              } else if (title.includes('business') || title.includes('economy') || title.includes('market')) {
                category = "Business";
                categoryColor = "bg-purple-600";
              }
              
              return (
                <div key={index} className="inline-flex items-center mx-8">
                  <span className={`${categoryColor} text-xs px-2 py-0.5 rounded mr-3`}>
                    {category}
                  </span>
                  <a 
                    href={article.url || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm hover:text-blue-200 transition-colors mr-3"
                    title={article.description}
                  >
                    {article.title}
                  </a>
                  <span className="text-xs opacity-70 mr-3">
                    {article.source?.name || 'Unknown Source'}
                  </span>
                  <span className="text-xs opacity-60">
                    {formatNewsDate(article.publishedAt)}
                  </span>
                  <div className="mx-8 text-gray-400">•</div>
                </div>
              );
            })}
            
            {/* Duplicate for seamless loop */}
            {articles.map((article, index) => {
              const title = article.title?.toLowerCase() || '';
              let category = "General";
              let categoryColor = "bg-gray-600";
              
              if (title.includes('palm oil') || title.includes('cpo') || title.includes('export') || title.includes('trade')) {
                category = "Palm Oil";
                categoryColor = "bg-amber-600";
              } else if (title.includes('weather') || title.includes('flood') || title.includes('drought') || title.includes('climate')) {
                category = "Weather";
                categoryColor = "bg-blue-600";
              } else if (title.includes('policy') || title.includes('agreement') || title.includes('diplomacy')) {
                category = "Policy";
                categoryColor = "bg-green-600";
              } else if (title.includes('business') || title.includes('economy') || title.includes('market')) {
                category = "Business";
                categoryColor = "bg-purple-600";
              }
              
              return (
                <div key={`dup-${index}`} className="inline-flex items-center mx-8">
                  <span className={`${categoryColor} text-xs px-2 py-0.5 rounded mr-3`}>
                    {category}
                  </span>
                  <a 
                    href={article.url || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm hover:text-blue-200 transition-colors mr-3"
                    title={article.description}
                  >
                    {article.title}
                  </a>
                  <span className="text-xs opacity-70 mr-3">
                    {article.source?.name || 'Unknown Source'}
                  </span>
                  <span className="text-xs opacity-60">
                    {formatNewsDate(article.publishedAt)}
                  </span>
                  <div className="mx-8 text-gray-400">•</div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Gradient fade effect */}
        <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-blue-900 to-transparent"></div>
        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-blue-900 to-transparent"></div>
      </div>
    </div>
  );
};

export default function Overview() {
  const [selectedState, setSelectedState] = useState("All-India");
  const [timeRange, setTimeRange] = useState("2024-25");
  const [scenario, setScenario] = useState("Baseline");
  const [liveData, setLiveData] = useState(null);
  const [agriculturalAlerts, setAgriculturalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState(null);
  const [palmOilData, setPalmOilData] = useState(null);
  const [palmOilLoading, setPalmOilLoading] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [showMonthlyTable, setShowMonthlyTable] = useState(false);
  const [showAlertPopup, setShowAlertPopup] = useState(true);
  
  // News state
  const [malaysianNews, setMalaysianNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [lastNewsUpdate, setLastNewsUpdate] = useState(null);

  // Get current state data
  const currentStateData = stateWiseData[selectedState] || stateWiseData["All-India"];

  useEffect(() => {
    checkAPIs();
    loadPalmOilData();
    loadMalaysianNews();
    
    // Auto-refresh news every 5 minutes
    const newsInterval = setInterval(loadMalaysianNews, 5 * 60 * 1000);
    
    return () => {
      clearInterval(newsInterval);
    };
  }, []);

  const navigate = useNavigate();
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated || isAuthenticated !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  const loadPalmOilData = async () => {
    setPalmOilLoading(true);
    try {
      const data = await fetchPalmOilCommodityData();
      if (data && data.status === 'success') {
        setPalmOilData(data.data);
        if (data.data.graph_data) {
          setGraphData(data.data.graph_data);
        }
      }
    } catch (error) {
      console.error('Error loading palm oil data:', error);
    }
    setPalmOilLoading(false);
  };

  const loadMalaysianNews = async () => {
    setNewsLoading(true);
    try {
      const articles = await fetchMalaysianIndonesianNews();
      setMalaysianNews(articles);
      setLastNewsUpdate(new Date());
      
      // Log news statistics
      console.log(`Loaded ${articles.length} Malaysian news articles`);
      if (articles.length > 0) {
        const palmOilArticles = articles.filter(article => 
          article.title?.toLowerCase().includes('palm oil') || 
          article.title?.toLowerCase().includes('cpo')
        );
        console.log(`${palmOilArticles.length} articles specifically about palm oil`);
      }
    } catch (error) {
      console.error('Error loading Malaysian news:', error);
    }
    setNewsLoading(false);
  };

  const checkAPIs = () => {
    const status = checkAPIStatus();
    setApiStatus(status);
  };

  // Filter for critical agricultural alerts
  const criticalAlerts = agriculturalAlerts.filter(alert => 
    alert.alertLevel === 'high' || alert.alertLevel === 'medium'
  );

  // Get current FFB price based on selected state
  const getCurrentFFBPrice = () => {
    if (selectedState === "Telangana") {
      return 19681; // October 2025 price
    }
    return currentStateData.currentFFBPrice || liveMarket.currentFFBPrice;
  };

  // Get current CPO price based on selected state
  const getCurrentCPOPrice = () => {
    if (selectedState === "Telangana") {
      return 115715; // October 2025 price
    }
    return currentStateData.currentCPOPrice || liveMarket.currentCPOPrice;
  };

  // Format price for display - updated to handle different currencies
  const formatPrice = (price, currency = 'USD') => {
    if (!price) return 'N/A';
    
    switch (currency) {
      case 'INR':
        return formatINR(price);
      case 'MYR':
        return formatMYR(price);
      case 'USD':
      default:
        return formatUSD(price);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render monthly data table
  const renderMonthlyTable = () => {
    if (!graphData || graphData.length === 0) return null;

    const reversedData = [...graphData].reverse();

    return (
      <div className="max-h-96 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price (MYR)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price (INR)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month Change
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change %
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reversedData.map((monthData, index, array) => {
              const prevMonth = array[index + 1];
              const monthChange = prevMonth ? monthData.value_myr - prevMonth.value_myr : 0;
              const changePercent = prevMonth ? 
                ((monthData.value_myr - prevMonth.value_myr) / prevMonth.value_myr * 100) : 
                0;
              
              return (
                <tr key={monthData.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(monthData.date).toLocaleDateString('en-IN', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(monthData.date).toLocaleDateString('en-IN', { 
                        day: '2-digit',
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-800">
                      {formatPrice(monthData.value_myr, 'MYR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">
                      {formatPrice(monthData.value_inr, 'INR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      @ ₹{monthData.exchange_rate}/MYR
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      monthChange > 0 ? 'text-red-600' : 
                      monthChange < 0 ? 'text-green-600' : 
                      'text-gray-600'
                    }`}>
                      {monthChange > 0 ? '+' : ''}{formatPrice(monthChange, 'MYR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      changePercent > 0 ? 'bg-red-100 text-red-800' :
                      changePercent < 0 ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {changePercent > 0 ? '↗' : changePercent < 0 ? '↘' : '→'}
                      <span className="ml-1">
                        {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Summary footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-gray-600">
              Showing {graphData.length} months of data • Exchange rate: 1 MYR = ₹21.92
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-600">Highest:</span>
                <span className="ml-2 font-medium text-red-600">
                  {formatPrice(Math.max(...graphData.map(m => m.value_myr)), 'MYR')}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Lowest:</span>
                <span className="ml-2 font-medium text-green-600">
                  {formatPrice(Math.min(...graphData.map(m => m.value_myr)), 'MYR')}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Average:</span>
                <span className="ml-2 font-medium text-blue-600">
                  {formatPrice(
                    graphData.reduce((sum, m) => sum + m.value_myr, 0) / graphData.length, 
                    'MYR'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Malaysian News Marquee Strip */}
      <NewsMarquee 
        articles={malaysianNews} 
        isLoading={newsLoading} 
        onRefresh={loadMalaysianNews}
      />

      {/* Page Header */}
      <div className="mb-8 bg-white border-l-4 border-[#003366] shadow-md rounded-r-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#003366]">Policy Situation Room</h2>
                <div className="bg-[#003366] text-white px-3 py-1 rounded text-sm font-medium">
                  <span>DASHBOARD</span>
                </div>
              </div>
              <p className="text-gray-700 mt-1 border-l-3 border-[#0072bc] pl-3">
                Live monitoring of India's edible oil security with market alerts and Malaysian news intelligence
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
                  <img 
                    src="/assets/ut.png" 
                    alt="Ministry Logo" 
                    className="w-6 h-6"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold">Ministry of Agriculture & Farmers Welfare</span>
                    <span className="text-gray-500 mx-2">|</span>
                    <span className="text-gray-600">Government of India</span>
                  </span>
                </div>
                
                {/* News update indicator */}
                {lastNewsUpdate && (
                  <div className="inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-200 text-xs">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-blue-700">News updated: {formatNewsDate(lastNewsUpdate.toISOString())}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Palm Oil Commodity Data Section */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">LIVE PALM OIL COMMODITY DATA</h3>
                <p className="text-sm opacity-90">Global Market Intelligence • Trading Economics • MYR to INR Conversion</p>
              </div>
            </div>
            <button
              onClick={loadPalmOilData}
              disabled={palmOilLoading}
              className="bg-white text-[#00509e] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {palmOilLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          {palmOilLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <svg className="animate-spin h-12 w-12 text-[#00509e] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-gray-600">Fetching live palm oil commodity data...</p>
              </div>
            </div>
          ) : palmOilData ? (
            <>
              {/* Currency Price Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Malaysian Ringgit (MYR) Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-600 font-medium">CURRENT PRICE (MYR)</div>
                      <div className="text-3xl font-bold text-blue-800 mt-1">
                        {formatPrice(palmOilData.daily_price?.price_myr, 'MYR')}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Per Metric Ton</div>
                    </div>
                    <div className="bg-blue-100 text-blue-800 p-3 rounded-lg">
                      <div className="text-sm font-bold">MYR</div>
                      <div className="text-xs">Malaysia</div>
                    </div>
                  </div>
                  {palmOilData.daily_price?.change_myr !== undefined && (
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                      palmOilData.daily_price.change_myr > 0 
                        ? 'bg-green-100 text-green-800' 
                        : palmOilData.daily_price.change_myr < 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {palmOilData.daily_price.change_myr > 0 ? '+' : ''}{palmOilData.daily_price.change_myr} MYR
                      {palmOilData.daily_price?.change_percent && (
                        <span className="ml-2">({palmOilData.daily_price.change_percent})</span>
                      )}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    Bursa Malaysia Derivatives
                  </div>
                </div>

                {/* Indian Rupee (INR) Card */}
                <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-600 font-medium">CONVERTED PRICE (INR)</div>
                      <div className="text-3xl font-bold text-green-800 mt-1">
                        {formatPrice(palmOilData.daily_price?.price_inr, 'INR')}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Per Metric Ton</div>
                    </div>
                    <div className="bg-green-100 text-green-800 p-3 rounded-lg">
                      <div className="text-sm font-bold">INR</div>
                      <div className="text-xs">India</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Exchange Rate:</span>
                      <span className="font-medium">1 MYR = ₹21.92</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Based on current forex rate
                    </div>
                  </div>
                </div>
              </div>

              {/* Graph Data Section */}
              {palmOilData?.graph_data && palmOilData.graph_data.length > 0 && (
                <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">5-Year Price Trend (MYR & INR)</h4>
                      <p className="text-sm text-gray-600">Historical price movement with currency conversion</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Data points:</div>
                      <div className="text-lg font-bold text-[#003366]">{palmOilData.graph_data.length}</div>
                    </div>
                  </div>
                  
                  {/* Use the new chart component */}
                  <PalmOilPriceChart 
                    graphData={palmOilData.graph_data}
                    exchangeRate={21.92}
                  />
                  
                  {/* Monthly data table dropdown */}
                  <div className="mt-6">
                    <button
                      onClick={() => setShowMonthlyTable(!showMonthlyTable)}
                      className="flex items-center justify-between w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="font-medium text-gray-800">View Monthly Data Table</span>
                        <span className="text-xs text-gray-500 ml-2">({palmOilData.graph_data.length} months)</span>
                      </div>
                      <svg className={`w-5 h-5 text-gray-600 transition-transform ${showMonthlyTable ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showMonthlyTable && (
                      <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {renderMonthlyTable()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Data Source Info */}
              <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Data Source Information</div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Source:</span>
                        <a 
                          href={palmOilData.daily_price?.source} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Trading Economics - Palm Oil Commodity
                        </a>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">Currency:</span>
                        <span>Malaysian Ringgit (MYR) per metric ton</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Conversion:</span>
                        <span>1 MYR = ₹{21.92} (Fixed Rate)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700 mb-1">Last Updated</div>
                    <div className="text-sm text-gray-600">{formatTimestamp(palmOilData.timestamp)}</div>
                    {palmOilData.daily_price?.note && (
                      <div className="text-xs text-amber-600 mt-1">{palmOilData.daily_price.note}</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">No Palm Oil Data Available</h4>
              <p className="text-gray-600 mb-4">Click the refresh button to fetch live commodity data</p>
              <button
                onClick={loadPalmOilData}
                className="bg-[#1e5c2a] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#164523] transition-colors flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Fetch Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alert Strips */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">GLOBAL MARKET DATA STRIP</h3>
                <p className="text-sm opacity-90">Monthly Price Trends & Percentage Changes</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-90">Data from Trading Economics</div>
              <div className="text-xs opacity-75">Updated: {palmOilData?.timestamp ? formatTimestamp(palmOilData.timestamp) : 'N/A'}</div>
            </div>
          </div>
        </div>

        {palmOilLoading ? (
          <div className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1e5c2a]"></div>
              <span className="ml-3 text-gray-600">Loading market data...</span>
            </div>
          </div>
        ) : palmOilData?.graph_data?.length > 0 ? (
          <div className="p-6">
            {/* Current Month Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-gray-600 font-medium mb-1">CURRENT MONTH</div>
                <div className="text-sm font-bold text-[#003366]">
                  {formatMonthYear(palmOilData.graph_data[palmOilData.graph_data.length - 1]?.date)}
                </div>
                <div className="text-lg text-green-800 mt-1">
                  Latest: {formatPrice(palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr, 'MYR')}
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xs text-gray-600 font-medium mb-1">PREVIOUS MONTH</div>
                <div className="text-sm font-bold text-green-700">
                  {formatMonthYear(palmOilData.graph_data[palmOilData.graph_data.length - 2]?.date)}
                </div>
                <div className="text-lg text-gray-800 mt-1">
                  Price: {formatPrice(palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr, 'MYR')}
                </div>
              </div>
              
              <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-xs text-gray-600 font-medium mb-1">MONTH-ON-MONTH CHANGE</div>
                <div className={`text-sm font-bold ${
                  getPercentageChange(
                    palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                    palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                  ) > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatPercentageChange(
                    getPercentageChange(
                      palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                      palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                    )
                  )}
                </div>
                <div className="text-lg text-green-800 mt-1">
                  {getChangeStatement(
                    getPercentageChange(
                      palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                      palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Market Alert Statement */}
                  {/* Market Alert Popup in Top Right Corner */}
      {showAlertPopup && palmOilData?.graph_data?.length > 0 && !palmOilLoading && (
        <div className="fixed bottom-10 right-6 w-96 z-50 animate-slide-in">
          <div className={`border-l-4 ${
            getAlertLevel(
              getPercentageChange(
                palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
              )
            ).color
          } p-4 bg-white rounded-lg shadow-xl border border-gray-200 relative`}>
            {/* Close button */}
            <button
              onClick={() => setShowAlertPopup(false)}
              className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-900 transition-colors z-10"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  getAlertLevel(
                    getPercentageChange(
                      palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                      palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                    )
                  ).pulse ? 'animate-pulse' : ''
                } ${
                  getAlertLevel(
                    getPercentageChange(
                      palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                      palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                    )
                  ).dotColor
                }`}></div>
                <span className="font-bold text-gray-800 text-sm">GLOBAL MARKET ALERT</span>
              </div>
              <div className={`${
                getAlertLevel(
                  getPercentageChange(
                    palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                    palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                  )
                ).badgeColor
              } text-xs px-2 py-1 rounded-full font-medium`}>
                {getAlertLevel(
                  getPercentageChange(
                    palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                    palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                  )
                ).level}
              </div>
            </div>
            
            {/* Content */}
            <p className="text-gray-700 text-sm mb-3">
              {generateMarketStatement(
                getPercentageChange(
                  palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                  palmOilData.graph_data[palmOilData.graph_data.length - 2]?.value_myr
                ),
                palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_myr,
                palmOilData.graph_data[palmOilData.graph_data.length - 1]?.value_inr
              )}
            </p>
            
            {/* Progress bar for auto-dismiss */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
              <div 
                className="h-full bg-blue-500 transition-all duration-5000"
                style={{ width: '100%' }}
                onAnimationEnd={() => setShowAlertPopup(false)}
              >
                <style jsx>{`
                  @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                  }
                  .animate-progress {
                    animation: progress 20s linear forwards;
                  }
                `}</style>
                <div className="h-full bg-blue-500 animate-progress"></div>
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600">No monthly graph data available</p>
            <button
              onClick={loadPalmOilData}
              className="mt-3 bg-[#1e5c2a] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#164523] transition-colors"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="flex flex-wrap gap-4 items-center p-5">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">State/UT</label>
            <div className="relative">
              <select
                className="w-full rounded-xl border border-gray-300 text-sm focus:border-[#1e5c2a] focus:ring-[#1e5c2a] py-2 pl-3 pr-8 bg-white"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}>
                {STATES.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* State Overview Banner */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">
                {selectedState} - Oil Palm Overview
              </h3>
              <p className="text-sm opacity-90">
                National Mission on Edible Oils • Ministry of Agriculture & Farmers Welfare
              </p>
            </div>
            <div className="mt-3 md:mt-0 text-right">
              <div className="text-2xl font-bold">₹ 19,681/MT</div>
              <div className="text-sm opacity-90">Current FFB Price</div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 font-medium mb-1">Potential Area</div>
              <div className="text-lg font-bold text-gray-800">
                {currentStateData.potentialArea?.toLocaleString()} ha
              </div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 font-medium mb-1">Area Covered</div>
              <div className="text-lg font-bold text-gray-800">
                {currentStateData.areaCovered?.toLocaleString()} ha
              </div>
              <div className="text-xs text-green-600 mt-1">{currentStateData.coveragePercentage}% coverage</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 font-medium mb-1">Expansion Target (2021-2025)</div>
              <div className="text-lg font-bold text-gray-800">
                {currentStateData.totalExpansionTarget?.toLocaleString()} ha
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* State Production Data */}
      {selectedState !== "All-India" && currentStateData.productionData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedState} Production History
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Year</th>
                  <th className="px-4 py-2 text-right">FFB Production (MT)</th>
                  <th className="px-4 py-2 text-right">CPO Production (MT)</th>
                  <th className="px-4 py-2 text-right">Extraction Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(currentStateData.productionData).map(([year, data]) => (
                  <tr key={year} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{year}</td>
                    <td className="px-4 py-2 text-right">
                      {data.ffb ? data.ffb.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {data.cpo ? data.cpo.toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {data.ffb && data.cpo ? ((data.cpo / data.ffb) * 100).toFixed(1) + '%' : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <ChartCard 
          title="Supply-Demand Balance" 
          explanation="Shows how domestic production, imports, and consumption interact. Policy goal: reduce import dependency while ensuring adequate supply."
        >
          <ImportsProdChart data={importsProdConsData} />
        </ChartCard>

        <ChartCard 
          title="FFB & CPO Price Trends" 
          explanation="Monthly price movement of Fresh Fruit Bunches and Crude Palm Oil."
        >
          <PriceTrendChart ffbData={ffbPriceTrend} cpoData={cpoPriceTrend} selectedState={selectedState} />
        </ChartCard>
      </div>

    </div>
  );
}

// Helper Components
function ProgressBar({ label, current, target, unit, stateContribution, status }) {
  const percentage = (current / target) * 100;
  const getStatusColor = (percent) => {
    if (percent >= 80) return 'bg-green-500';
    if (percent >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusText = (percent) => {
    if (percent >= 80) return 'On Track';
    if (percent >= 60) return 'Moderate';
    return 'Behind';
  };

  const getStatusTextColor = (percent) => {
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="p-5 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <div className="font-bold text-gray-800 text-sm">{label}</div>
        <div className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusTextColor(percentage)} bg-white border`}>
          {getStatusText(percentage)}
        </div>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">Progress:</span>
        <span className="font-bold text-gray-800">{current} / {target} {unit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${getStatusColor(percentage)}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">
          {percentage.toFixed(0)}% of 2030 target
        </span>
        {stateContribution && status && status !== "All-India" && (
          <span className="text-green-600 font-medium">
            • {status}: {stateContribution.toFixed(1)}k ha
          </span>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, explanation, children, badge, badgeColor }) {
  const badgeClasses = {
    red: 'bg-red-100 text-red-800 border-red-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-gray-800 text-lg">{title}</h4>
        {badge && (
          <span className={`text-xs font-bold px-2 py-1 rounded border ${badgeClasses[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-4">{explanation}</p>
      {children}
    </div>
  );
}

function ActionMatrix({ actions, selectedState }) {
  const getStateSpecificActions = () => {
    return actions.map(action => {
      if (action.category === "Farmers" && selectedState !== "All-India") {
        return {
          ...action,
          indicator: `${selectedState} FFB Price: ₹${stateWiseData[selectedState]?.currentFFBPrice?.toLocaleString() || 'N/A'}/MT`
        };
      }
      return action;
    });
  };

  return (
    <div className="space-y-3">
      {getStateSpecificActions().map((action, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              action.risk.includes('🟢') ? 'bg-green-500' : 
              action.risk.includes('⚠️') ? 'bg-amber-500' : 'bg-red-500'
            }`}></div>
            <div>
              <div className="font-medium text-gray-800 text-sm">{action.category}</div>
              <div className="text-xs text-gray-600">{action.indicator}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-bold ${
              action.risk.includes('🟢') ? 'text-green-600' : 
              action.risk.includes('⚠️') ? 'text-amber-600' : 'text-red-600'
            }`}>
              {action.risk.replace('🟢', 'LOW').replace('⚠️', 'MEDIUM').replace('🔴', 'HIGH')}
            </div>
            <div className="text-xs text-gray-600 font-medium">{action.action}</div>
          </div>
        </div>
      ))}
    </div>
  );
}