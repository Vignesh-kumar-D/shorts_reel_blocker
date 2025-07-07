document.addEventListener('DOMContentLoaded', function () {
  const youtubeToggle = document.getElementById('youtubeToggle');
  const instagramToggle = document.getElementById('instagramToggle');

  chrome.storage.sync.get(
    ['youtubeBlocked', 'instagramBlocked'],
    function (data) {
      // Set default values only if the keys don't exist in storage
      if (data.youtubeBlocked === undefined) {
        data.youtubeBlocked = true; // Default to blocked
        chrome.storage.sync.set({ youtubeBlocked: true });
      }
      if (data.instagramBlocked === undefined) {
        data.instagramBlocked = true; // Default to blocked
        chrome.storage.sync.set({ instagramBlocked: true });
      }

      // Set the toggle states to the actual stored values
      youtubeToggle.checked = data.youtubeBlocked;
      instagramToggle.checked = data.instagramBlocked;
    }
  );

  youtubeToggle.addEventListener('change', function () {
    chrome.storage.sync.set({ youtubeBlocked: this.checked });
    updateContentScript('youtube');
  });

  instagramToggle.addEventListener('change', function () {
    chrome.storage.sync.set({ instagramBlocked: this.checked });
    updateContentScript('instagram');
  });
});

function updateContentScript(platform) {
  chrome.tabs.query({ url: `*://*.${platform}.com/*` }, function (tabs) {
    tabs.forEach((tab) => {
      chrome.tabs.reload(tab.id);
    });
  });
}
