/**
 * Storage Service
 * 
 * Handles all local storage operations for layouts and configurations
 */

const STORAGE_KEY = 'drivingRemote_layouts';
const CONFIG_KEY = 'drivingRemote_config';
const ACTIVE_LAYOUT_KEY = 'drivingRemote_activeLayout';

/**
 * Get all layouts from local storage
 */
export function getAllLayouts() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load layouts:', error);
    return {};
  }
}

/**
 * Save all layouts to local storage
 */
export function saveAllLayouts(layouts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    return true;
  } catch (error) {
    console.error('Failed to save layouts:', error);
    return false;
  }
}

/**
 * Get a specific layout by ID
 */
export function getLayout(id) {
  const layouts = getAllLayouts();
  return layouts[id] || null;
}

/**
 * Save a single layout
 */
export function saveLayout(id, layout) {
  const layouts = getAllLayouts();
  layouts[id] = layout;
  return saveAllLayouts(layouts);
}

/**
 * Delete a layout
 */
export function deleteLayout(id) {
  const layouts = getAllLayouts();
  delete layouts[id];
  return saveAllLayouts(layouts);
}

/**
 * Delete all layouts
 */
export function deleteAllLayouts() {
  return saveAllLayouts({});
}

/**
 * Get active layout ID
 */
export function getActiveLayoutId() {
  return localStorage.getItem(ACTIVE_LAYOUT_KEY) || null;
}

/**
 * Set active layout ID
 */
export function setActiveLayoutId(id) {
  localStorage.setItem(ACTIVE_LAYOUT_KEY, id);
}

/**
 * Get global configuration
 */
export function getConfig() {
  try {
    const data = localStorage.getItem(CONFIG_KEY);
    return data ? JSON.parse(data) : getDefaultConfig();
  } catch (error) {
    console.error('Failed to load config:', error);
    return getDefaultConfig();
  }
}

/**
 * Save global configuration
 */
export function saveConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Failed to save config:', error);
    return false;
  }
}

/**
 * Get default configuration
 */
function getDefaultConfig() {
  return {
    serverUrl: `ws://${location.hostname}:8000/ws`,
    theme: 'dark',
    hapticFeedback: true,
    soundFeedback: false,
    updateRate: 60,
    binaryProtocol: false
  };
}

/**
 * Calculate storage usage percentage
 */
export function getStorageUsage() {
  try {
    const total = 5 * 1024 * 1024; // 5MB typical limit
    let used = 0;
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    return {
      used,
      total,
      percentage: (used / total) * 100
    };
  } catch (error) {
    console.error('Failed to calculate storage usage:', error);
    return { used: 0, total: 0, percentage: 0 };
  }
}

/**
 * Export layout to file
 */
export function exportLayoutToFile(layout) {
  const data = {
    app: 'drivingRemote',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    layout
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${layout.name || 'layout'}.dr`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import layout from file
 */
export async function importLayoutFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.app !== 'drivingRemote' || !data.layout) {
          reject(new Error('Invalid layout file format'));
          return;
        }
        
        resolve(data.layout);
      } catch (error) {
        reject(new Error('Failed to parse layout file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Clear all application data
 */
export function clearAllData() {
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith('drivingRemote_')
  );
  
  keys.forEach(key => localStorage.removeItem(key));
}
