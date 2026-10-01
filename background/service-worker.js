// Stage 1 intentionally has no timers, alarms, network calls, or ongoing work.
chrome.runtime.onInstalled.addListener(() => {
  console.info('ONEFLOW foundation ready. Open a new tab to begin.');
});
