import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DataResources() {
  const dataResources = [
    {
      id: 1,
      name: "FFB Price Fixation Proceedings",
      source: "Director of Horticulture, Telangana",
      description: "Official proceedings for FFB price fixation in Telangana (October 2025)",
      link: "/data/FFB Price Fixation @ October, 2025.pdf",
      category: "Legal Documents",
      frequency: "Annual",
      format: "PDF"
    },
    {
      id: 2,
      name: "FFB Price History (5 Years)",
      source: "Telangana Horticulture Department",
      description: "FFB price data for the last 5 years",
      link: "/data/FFBS for last 5 years.docx",
      category: "Price Data",
      frequency: "Annual",
      format: "Word"
    },
    {
      id: 3,
      name: "State & Year wise Production and Area Expansion",
      source: "Ministry of Agriculture",
      description: "Brief on NMEO-OP roles and responsibilities",
      link: "/data/BriefNMEOOPRoI_05052022_637873535509820380_OilPalm_RoI_Brief.pdf",
      category: "Policy Documents",
      frequency: "Static",
      format: "PDF"
    },
    {
      id: 4,
      name: "Telangana Oil Palm Act, 1993",
      source: "Government of Telangana",
      description: "The Telangana Oil Palm (Regulation of Production and Processing) Act, 1993",
      link: "/data/Act 3 of 1993.pdf",
      category: "Legal Framework",
      frequency: "Static",
      format: "PDF"
    },
    {
      id: 5,
      name: "NMEO-OP Guidelines",
      source: "Ministry of Agriculture",
      description: "Operational Guidelines of National Mission on Edible Oils-Oil Palm",
      link: "/data/240527163655OPMCULGUIDTEL.pdf",
      category: "Policy Documents",
      frequency: "Static",
      format: "PDF"
    },
    {
      id: 6,
      name: "Palm Oil Retail Price Dataset",
      source: "Compiled Market Data",
      description: "Daily retail price data for Palm Oil Packed across India",
      link: "/data/daily_retail_price_PalmOilPacked-upto_apr_2015.csv",
      category: "Market Data",
      frequency: "Daily",
      format: "CSV"
    },
    {
      id: 7,
      name: "UPAG Website",
      source: "upag.gov.in",
      description: "Official website for area and productivity data",
      link: "https://upag.gov.in/area-productivity",
      category: "Government Portal",
      frequency: "Real-time",
      format: "Web API"
    },
    {
      id: 8,
      name: "Palm Oil Press Release",
      source: "Press Information Bureau",
      description: "Government press releases and announcements on palm oil",
      link: "https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=1780271",
      category: "News & Updates",
      frequency: "Daily",
      format: "Web"
    },
    {
      id: 9,
      name: "AGMARKNET Portal",
      source: "Ministry of Agriculture",
      description: "Primary source for agricultural marketing data and prices",
      link: "https://agmarknet.gov.in/home",
      category: "Market Intelligence",
      frequency: "Daily",
      format: "Web/API"
    },
    {
      id: 10,
      name: "Open Government Data Portal",
      source: "data.gov.in",
      description: "Open government datasets related to palm oil and agriculture",
      link: "https://www.data.gov.in/search?title=Palm%20Oil&type=resources&sortby=_score",
      category: "Open Data",
      frequency: "Monthly",
      format: "CSV/JSON"
    },
    {
      id: 11,
      name: "FFB Prices Database",
      source: "AGMARKNET",
      description: "Fresh Fruit Bunches price data from markets across India",
      link: "https://agmarknet.gov.in/home",
      category: "Price Data",
      frequency: "Daily",
      format: "CSV"
    },
    {
      id: 12,
      name: "Telangana Palm Oil Portal",
      source: "Telangana Government",
      description: "Official portal for Telangana palm oil farmers and industry",
      link: "https://opm.telangana.gov.in/common/loginpage.tshcoilpalm",
      category: "State Portal",
      frequency: "Real-time",
      format: "Web"
    },
    {
      id: 13,
      name: "Retail Price Reports",
      source: "FCA Infoweb",
      description: "Daily retail prices and weekly market reports",
      link: "https://fcainfoweb.nic.in/Reports/DB/Dailyprices.aspx",
      category: "Price Data",
      frequency: "Daily",
      format: "Web/Excel"
    },
    {
      id: 14,
      name: "Import Duty & Tariffs",
      source: "Customs Department",
      description: "Palm oil import duties, custom duties, tariffs and taxes",
      link: "https://share.google/IzrAwJh6ILG941a2D",
      category: "Trade Data",
      frequency: "On-change",
      format: "Excel"
    },
    {
      id: 15,
      name: "Refined Palm Oil ICRA Report",
      source: "Government Reports",
      description: "Refined Palm Oil data for January 2020",
      link: "/data/Refined Palm Oil-T-1-January 2020.pdf",
      category: "Market Data",
      frequency: "Monthly",
      format: "PDF"
    },
    {
      id: 16,
      name: "Combined Export Dataset",
      source: "Compiled Export Data",
      description: "Comprehensive dataset combining multiple export sources",
      link: "https://docs.google.com/spreadsheets/d/1A1jB_eFA4UX2WQk9QdcDz6AhzUEma3tOBlFTEdrO11Y/edit?usp=sharing",
      category: "Trade Data",
      frequency: "Monthly",
      format: "Excel"
    },
    {
      id: 17,
      name: "CACP Report - Oil Palm",
      source: "Commission for Agricultural Costs and Prices",
      description: "Oil Palm pricing analysis for growth, efficiency & equity",
      link: "/data/CACP_Report_-_Oil_Palm.pdf",
      category: "Research Reports",
      frequency: "Static",
      format: "PDF"
    },
    {
      id: 18,
      name: "Global Palm Oil Prices API",
      source: "Trading Economics",
      description: "Real-time global palm oil commodity prices in MYR and USD",
      link: "https://tradingeconomics.com/commodity/palm-oil",
      category: "Global Market Data",
      frequency: "Real-time",
      format: "API"
    },
    {
      id: 19,
      name: "Oil Palm Area Expansion and Production",
      source: "Internal Documentation",
      description: "Data visualization",
      link: "/data/WhatsApp Image 2025-11-28 at 13.58.40_10119497.jpg",
      category: "Visualization",
      frequency: "Static",
      format: "Image"
    },
    {
      id: 20,
      name: "Recent FFB Prices Graph/Chart",
      source: "Internal Documentation",
      description: "Data visualization",
      link: "/data/WhatsApp Image 2025-11-30 at 19.28.52_1039a4a5.jpg",
      category: "Visualization",
      frequency: "Static",
      format: "Image"
    }
  ];

  const categories = [
    "All",
    "Documentation",
    "Market Data",
    "Price Data",
    "Policy Documents",
    "Trade Data",
    "Legal Framework",
    "Research Reports",
    "Open Data"
  ];

  const navigate = useNavigate();
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('access_token');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredResources = selectedCategory === "All" 
    ? dataResources 
    : dataResources.filter(resource => resource.category === selectedCategory);

  const handleOpenResource = (resource) => {
  if (resource.link.startsWith('/data/')) {
    window.open(resource.link, '_blank', 'noopener,noreferrer');
  } else if (resource.link.startsWith('http')) {
    window.open(resource.link, '_blank', 'noopener,noreferrer');
  }
};

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Page Header */}
      <div className="mb-8 bg-white border-l-4 border-[#003366] shadow-md rounded-r-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-[#003366]">Data Resources Repository</h2>
                <div className="bg-[#003366] text-white px-3 py-1 rounded text-sm font-medium">
                  <span>REFERENCE LIBRARY</span>
                </div>
              </div>
              
              <p className="text-gray-700 mt-1 border-l-3 border-[#0072bc] pl-3">
                Comprehensive collection of all data sources, documents, and references used in the Oil Palm Policy Analysis Project
              </p>
              
              <div className="mt-3 inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded border border-gray-200">
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
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-[#0072bc] to-[#00509e] text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Data Resources Overview</h3>
              <p className="text-sm opacity-90">Complete inventory of project data sources</p>
            </div>
            <div className="bg-white/20 px-3 py-1.5 rounded text-sm">
              {dataResources.length} TOTAL RESOURCES
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-[#003366]">{dataResources.length}</div>
              <div className="text-sm text-gray-600">Total Resources</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {dataResources.filter(r => r.link.startsWith('/data/')).length}
              </div>
              <div className="text-sm text-gray-600">Local Files</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-700">
                {dataResources.filter(r => r.link.startsWith('http')).length}
              </div>
              <div className="text-sm text-gray-600">External Links</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">
                {new Set(dataResources.map(r => r.category)).size}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">Filter by Category</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#003366] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Data Resources Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Format
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{resource.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{resource.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{resource.source}</div>
                        <div className="text-xs text-gray-500">{resource.frequency}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          resource.category === 'Market Data' ? 'bg-blue-100 text-blue-800' :
                          resource.category === 'Price Data' ? 'bg-green-100 text-green-800' :
                          resource.category === 'Policy Documents' ? 'bg-purple-100 text-purple-800' :
                          resource.category === 'Trade Data' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {resource.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{resource.format}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleOpenResource(resource)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                            resource.link.startsWith('/data/')
                              ? 'bg-[#1e5c2a] text-white hover:bg-[#164523]'
                              : 'bg-[#003366] text-white hover:bg-[#002244]'
                          }`}
                        >
                          {resource.link.startsWith('/data/') ? (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Open Link
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {filteredResources.length} of {dataResources.length} resources
                  {selectedCategory !== 'All' && ` in "${selectedCategory}" category`}
                </div>
                <div className="text-sm text-gray-600">
                  Last updated: {new Date().toLocaleDateString('en-IN', { 
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">ℹ</div>
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">Local File Access</p>
                  <p className="text-xs text-blue-700">
                    Files stored in the /data/ directory can be downloaded directly. These include PDF documents, 
                    Excel datasets, and compiled reports used for analysis.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">⚠</div>
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">External Links</p>
                  <p className="text-xs text-amber-700">
                    External links will open in a new browser tab. These are live government portals, 
                    APIs, and web resources that provide real-time or regularly updated data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-8 bg-[#1e5c2a] rounded"></div>
              <h3 className="font-bold text-gray-800">Data Usage Guidelines</h3>
            </div>
            <div className="text-sm text-gray-600">Best Practices</div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-lg font-bold text-[#003366] mb-2">1. Data Attribution</div>
              <p className="text-sm text-gray-600">
                Always cite the original source when using data from these resources for analysis or reporting.
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-lg font-bold text-[#003366] mb-2">2. Update Frequency</div>
              <p className="text-sm text-gray-600">
                Check the frequency column to understand how often each data source is updated.
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="text-lg font-bold text-[#003366] mb-2">3. Format Compatibility</div>
              <p className="text-sm text-gray-600">
                Different formats (PDF, Excel, API) may require different tools for analysis and processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}