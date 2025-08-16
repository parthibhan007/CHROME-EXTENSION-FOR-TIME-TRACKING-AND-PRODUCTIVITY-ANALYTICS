let currentTabId = null;
let currentSite = null;
let siteStartTime = null;

// Example lists (customize)
const productiveSites = ["github.com", "stackoverflow.com", "leetcode.com"];
const unproductiveSites = ["facebook.com", "twitter.com", "instagram.com"];

const classifySite = (url) => {
  try {
    const hostname = new URL(url).hostname;
    if (productiveSites.some(site => hostname.includes(site))) return "productive";
    if (unproductiveSites.some(site => hostname.includes(site))) return "unproductive";
    return "neutral";
  } catch {
    return "neutral";
  }
};

const saveTimeForSite = (site, duration, category) => {
  if (!site) return;
  chrome.storage.local.get([site], (result) => {
    let prev = result[site] || { time: 0, category: category };
    prev.time = (prev.time || 0) + duration;
    prev.category = prev.category || category;
    chrome.storage.local.set({ [site]: prev });
  });
};

const switchTab = async (tabId) => {
  if (currentTabId !== null && siteStartTime !== null) {
    const now = Date.now();
    const duration = (now - siteStartTime) / 1000; // seconds
    saveTimeForSite(currentSite, duration, classifySite(currentSite));
  }
  currentTabId = tabId;
  siteStartTime = Date.now();

  try {
    const tab = await chrome.tabs.get(tabId);
    currentSite = tab.url || null;
  } catch {
    currentSite = null;
  }
};

chrome.tabs.onActivated.addListener(activeInfo => {
  switchTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === currentTabId && changeInfo.status === 'complete') {
    switchTab(tabId);
  }
});

// On startup handle current active tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs.length > 0) {
    switchTab(tabs[0].id);
  }
});

// Optional: periodic flush to ensure time is counted if browser is left open
setInterval(() => {
  if (currentSite && siteStartTime) {
    const now = Date.now();
    const duration = (now - siteStartTime) / 1000;
    // add small checkpoint and reset timer
    saveTimeForSite(currentSite, duration, classifySite(currentSite));
    siteStartTime = Date.now();
  }
}, 60_000); // every 60s
