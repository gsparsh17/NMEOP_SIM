import React, { useState } from "react";
import { Plus, Trash2, Save, X, ChevronUp, ChevronDown, Copy, Check } from "lucide-react";
import { useStaticData } from "../../contexts/StaticDataContext";

export default function DropdownManager() {
  const { data, updateDropdown, addChangeLog } = useStaticData();
  const [activeDropdown, setActiveDropdown] = useState('STATES');
  const [editingValue, setEditingValue] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [newItem, setNewItem] = useState('');

  const dropdowns = {
    STATES: { name: 'STATES', label: 'States & UTs', data: data.STATES },
    YEARS: { name: 'YEARS', label: 'Financial Years', data: data.YEARS },
    MONTHS: { name: 'MONTHS', label: 'Months', data: data.MONTHS },
    OIL_YEARS: { name: 'OIL_YEARS', label: 'Oil Years', data: data.OIL_YEARS },
    SCENARIOS: { name: 'SCENARIOS', label: 'Policy Scenarios', data: data.SCENARIOS }
  };

  const currentDropdown = dropdowns[activeDropdown];

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    
    const oldValue = [...currentDropdown.data];
    const newValue = [...currentDropdown.data, newItem.trim()];
    
    updateDropdown(activeDropdown, newValue);
    setNewItem('');
    addChangeLog('ADD', `${activeDropdown}[${oldValue.length}]`, '', newItem.trim());
  };

  const handleEditItem = (index) => {
    if (editingValue.trim()) {
      const oldValue = currentDropdown.data[index];
      const newArray = [...currentDropdown.data];
      newArray[index] = editingValue.trim();
      
      updateDropdown(activeDropdown, newArray);
      addChangeLog('UPDATE', `${activeDropdown}[${index}]`, oldValue, editingValue.trim());
    }
    setEditIndex(null);
    setEditingValue('');
  };

  const handleDeleteItem = (index) => {
    const oldValue = currentDropdown.data[index];
    const newValue = currentDropdown.data.filter((_, i) => i !== index);
    
    updateDropdown(activeDropdown, newValue);
    addChangeLog('DELETE', `${activeDropdown}[${index}]`, oldValue, '');
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    
    const newArray = [...currentDropdown.data];
    [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
    
    updateDropdown(activeDropdown, newArray);
    addChangeLog('MOVE', `${activeDropdown}[${index}]`, `Position ${index}`, `Position ${index - 1}`);
  };

  const handleMoveDown = (index) => {
    if (index === currentDropdown.data.length - 1) return;
    
    const newArray = [...currentDropdown.data];
    [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
    
    updateDropdown(activeDropdown, newArray);
    addChangeLog('MOVE', `${activeDropdown}[${index}]`, `Position ${index}`, `Position ${index + 1}`);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(currentDropdown.data, null, 2));
  };

  return (
    <div className="space-y-6">
      {/* Dropdown Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.values(dropdowns).map((dropdown) => (
          <button
            key={dropdown.name}
            onClick={() => setActiveDropdown(dropdown.name)}
            className={`px-4 py-3 rounded-lg border text-center transition-all ${
              activeDropdown === dropdown.name
                ? 'border-[#003366] bg-[#003366] text-white shadow-lg'
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{dropdown.label}</div>
            <div className="text-sm opacity-75">{dropdown.data.length} items</div>
          </button>
        ))}
      </div>

      {/* Current Dropdown Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{currentDropdown.label}</h3>
            <p className="text-sm text-gray-600">
              {currentDropdown.data.length} items • Used in dropdowns across the application
            </p>
          </div>
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Copy size={16} />
            Copy All
          </button>
        </div>

        {/* Add New Item */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={`Add new ${currentDropdown.label.toLowerCase()}...`}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#003366]"
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <button
              onClick={handleAddItem}
              className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter or click Add to insert new item
          </p>
        </div>

        {/* Items List */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-700">
              <div className="col-span-1">#</div>
              <div className="col-span-8">Value</div>
              <div className="col-span-3 text-center">Actions</div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
            {currentDropdown.data.map((item, index) => (
              <div key={index} className="px-4 py-3 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="col-span-8">
                    {editIndex === index ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => handleEditItem(index)}
                        onKeyPress={(e) => e.key === 'Enter' && handleEditItem(index)}
                        className="w-full border border-gray-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-[#003366]"
                        autoFocus
                      />
                    ) : (
                      <div className="font-medium">{item}</div>
                    )}
                  </div>
                  
                  <div className="col-span-3">
                    <div className="flex items-center justify-center gap-1">
                      {editIndex === index ? (
                        <button
                          onClick={() => handleEditItem(index)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditIndex(index);
                            setEditingValue(item);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                        title="Move Up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === currentDropdown.data.length - 1}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                        title="Move Down"
                      >
                        <ChevronDown size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteItem(index)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {currentDropdown.data.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">
                No items in this dropdown. Add your first item above.
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total: {currentDropdown.data.length} items
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const sorted = [...currentDropdown.data].sort();
                updateDropdown(activeDropdown, sorted);
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Sort Alphabetically
            </button>
            <button
              onClick={() => {
                const reversed = [...currentDropdown.data].reverse();
                updateDropdown(activeDropdown, reversed);
              }}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Reverse Order
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 mb-3">Preview as JavaScript</h4>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <div className="text-green-400">// {currentDropdown.label}</div>
          <div className="text-blue-400">export const</div>
          <span className="text-yellow-300">{activeDropdown}</span>
          <span className="text-white"> = [</span>
          <div className="ml-4">
            {currentDropdown.data.slice(0, 5).map((item, index) => (
              <div key={index}>
                <span className="text-green-400">  "{item}"</span>
                {index < Math.min(4, currentDropdown.data.length - 1) && <span className="text-white">,</span>}
              </div>
            ))}
            {currentDropdown.data.length > 5 && (
              <div className="text-gray-500">  // ... and {currentDropdown.data.length - 5} more items</div>
            )}
          </div>
          <span className="text-white">];</span>
        </div>
      </div>
    </div>
  );
}