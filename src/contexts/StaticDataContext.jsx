import React, { createContext, useState, useContext, useEffect } from "react";

// Import all static data
import * as staticData from "../data/staticData";

const StaticDataContext = createContext();

export const useStaticData = () => useContext(StaticDataContext);

export const StaticDataProvider = ({ children }) => {
  const [data, setData] = useState({
    // Dropdowns
    STATES: [...staticData.STATES],
    YEARS: [...staticData.YEARS],
    MONTHS: [...staticData.MONTHS],
    OIL_YEARS: [...staticData.OIL_YEARS],
    SCENARIOS: [...staticData.SCENARIOS],
    
    // Price Data
    telanganaPriceData: JSON.parse(JSON.stringify(staticData.telanganaPriceData)),
    
    // NMEO Data
    nmeoOPDetailedData: JSON.parse(JSON.stringify(staticData.nmeoOPDetailedData)),
    
    // State Data
    stateWiseData: JSON.parse(JSON.stringify(staticData.stateWiseData)),
    oilPalmSummary: JSON.parse(JSON.stringify(staticData.oilPalmSummary)),
    
    // Market Data
    liveMarket: JSON.parse(JSON.stringify(staticData.liveMarket)),
    bearingPotential: [...staticData.bearingPotential],
    farmerRisk: JSON.parse(JSON.stringify(staticData.farmerRisk)),
    supplyGapSummary: JSON.parse(JSON.stringify(staticData.supplyGapSummary)),
    nmeoOpProgress: JSON.parse(JSON.stringify(staticData.nmeoOpProgress)),
    clusterStatus: JSON.parse(JSON.stringify(staticData.clusterStatus)),
    
    // Chart Data
    ffbPriceTrend: [...staticData.ffbPriceTrend],
    cpoPriceTrend: [...staticData.cpoPriceTrend],
    areaProductionData: [...staticData.areaProductionData],
    vpFpVgpData: [...staticData.vpFpVgpData],
    diagnosticsDataQuality: [...staticData.diagnosticsDataQuality],
    importsProdConsData: [...staticData.importsProdConsData],
    diagnosticsModelPerf: [...staticData.diagnosticsModelPerf],
  });

  const [changeLog, setChangeLog] = useState([]);

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('staticDataBackup', JSON.stringify(data));
    localStorage.setItem('staticDataChangeLog', JSON.stringify(changeLog));
  }, [data, changeLog]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('staticDataBackup');
    const savedLog = localStorage.getItem('staticDataChangeLog');
    
    if (savedData) {
      setData(JSON.parse(savedData));
    }
    if (savedLog) {
      setChangeLog(JSON.parse(savedLog));
    }
  }, []);

  const addChangeLog = (action, field, oldValue, newValue, user) => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      field,
      oldValue: typeof oldValue === 'object' ? JSON.stringify(oldValue).substring(0, 100) : oldValue,
      newValue: typeof newValue === 'object' ? JSON.stringify(newValue).substring(0, 100) : newValue,
      user: user || 'admin',
      ip: '127.0.0.1'
    };
    setChangeLog(prev => [logEntry, ...prev.slice(0, 99)]); // Keep last 100 entries
  };

  // CRUD Operations
  const updateDropdown = (dropdownName, newValues) => {
    const oldValue = [...data[dropdownName]];
    setData(prev => ({
      ...prev,
      [dropdownName]: [...newValues]
    }));
    addChangeLog('UPDATE', dropdownName, oldValue, newValues);
  };

  const updatePriceData = (state, yearType, year, monthData) => {
    const oldValue = JSON.parse(JSON.stringify(data.telanganaPriceData));
    
    setData(prev => {
      const newData = JSON.parse(JSON.stringify(prev.telanganaPriceData));
      
      if (state === "Telangana") {
        const yearIndex = newData[yearType].findIndex(y => y.year === year);
        if (yearIndex !== -1) {
          newData[yearType][yearIndex].data = monthData;
        } else {
          newData[yearType].push({ year, data: monthData });
        }
      }
      
      return { ...prev, telanganaPriceData: newData };
    });
    
    addChangeLog('UPDATE', 'telanganaPriceData', oldValue, data.telanganaPriceData);
  };

  const updateStateData = (stateName, updates) => {
    const oldValue = JSON.parse(JSON.stringify(data.stateWiseData[stateName]));
    
    setData(prev => ({
      ...prev,
      stateWiseData: {
        ...prev.stateWiseData,
        [stateName]: {
          ...prev.stateWiseData[stateName],
          ...updates
        }
      }
    }));
    
    addChangeLog('UPDATE', `stateWiseData.${stateName}`, oldValue, updates);
  };

  const updateNMEOData = (updates) => {
    const oldValue = JSON.parse(JSON.stringify(data.nmeoOPDetailedData));
    
    setData(prev => ({
      ...prev,
      nmeoOPDetailedData: {
        ...prev.nmeoOPDetailedData,
        ...updates
      }
    }));
    
    addChangeLog('UPDATE', 'nmeoOPDetailedData', oldValue, updates);
  };

  const resetToOriginal = () => {
    setData({
      STATES: [...staticData.STATES],
      YEARS: [...staticData.YEARS],
      MONTHS: [...staticData.MONTHS],
      OIL_YEARS: [...staticData.OIL_YEARS],
      SCENARIOS: [...staticData.SCENARIOS],
      telanganaPriceData: JSON.parse(JSON.stringify(staticData.telanganaPriceData)),
      nmeoOPDetailedData: JSON.parse(JSON.stringify(staticData.nmeoOPDetailedData)),
      stateWiseData: JSON.parse(JSON.stringify(staticData.stateWiseData)),
      oilPalmSummary: JSON.parse(JSON.stringify(staticData.oilPalmSummary)),
      liveMarket: JSON.parse(JSON.stringify(staticData.liveMarket)),
      bearingPotential: [...staticData.bearingPotential],
      farmerRisk: JSON.parse(JSON.stringify(staticData.farmerRisk)),
      supplyGapSummary: JSON.parse(JSON.stringify(staticData.supplyGapSummary)),
      nmeoOpProgress: JSON.parse(JSON.stringify(staticData.nmeoOpProgress)),
      clusterStatus: JSON.parse(JSON.stringify(staticData.clusterStatus)),
      ffbPriceTrend: [...staticData.ffbPriceTrend],
      cpoPriceTrend: [...staticData.cpoPriceTrend],
      areaProductionData: [...staticData.areaProductionData],
      vpFpVgpData: [...staticData.vpFpVgpData],
      diagnosticsDataQuality: [...staticData.diagnosticsDataQuality],
      importsProdConsData: [...staticData.importsProdConsData],
      diagnosticsModelPerf: [...staticData.diagnosticsModelPerf],
    });
    addChangeLog('RESET', 'ALL', 'Current Data', 'Original Data');
  };

  const exportData = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `staticData_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (jsonData) => {
    try {
      const parsed = JSON.parse(jsonData);
      setData(parsed);
      addChangeLog('IMPORT', 'ALL', 'Previous Data', 'Imported Data');
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid JSON format' };
    }
  };

  const getDataAsJSFile = () => {
    let jsContent = `// ===============================\n`;
    jsContent += `// Static Data with Complete FFB & CPO Data\n`;
    jsContent += `// ===============================\n\n`;
    
    // Dropdowns
    jsContent += `// Dropdown Lists\n`;
    jsContent += `export const STATES = ${JSON.stringify(data.STATES, null, 2)};\n\n`;
    jsContent += `export const YEARS = ${JSON.stringify(data.YEARS, null, 2)};\n\n`;
    jsContent += `export const MONTHS = ${JSON.stringify(data.MONTHS, null, 2)};\n\n`;
    jsContent += `export const OIL_YEARS = ${JSON.stringify(data.OIL_YEARS, null, 2)};\n\n`;
    jsContent += `export const SCENARIOS = ${JSON.stringify(data.SCENARIOS, null, 2)};\n\n`;
    
    // Price Data
    jsContent += `// -------------------------------\n`;
    jsContent += `// Complete FFB & CPO Price Data from Telangana (Financial Years)\n`;
    jsContent += `// -------------------------------\n`;
    jsContent += `export const telanganaPriceData = ${JSON.stringify(data.telanganaPriceData, null, 2)};\n\n`;
    
    // Add more exports as needed...
    
    return jsContent;
  };

  const value = {
    data,
    changeLog,
    updateDropdown,
    updatePriceData,
    updateStateData,
    updateNMEOData,
    resetToOriginal,
    exportData,
    importData,
    getDataAsJSFile,
    addChangeLog
  };

  return (
    <StaticDataContext.Provider value={value}>
      {children}
    </StaticDataContext.Provider>
  );
};