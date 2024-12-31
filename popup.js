document.addEventListener('DOMContentLoaded', function () {
  const youtubeToggle = document.getElementById('youtubeToggle');
  const instagramToggle = document.getElementById('instagramToggle');

  chrome.storage.sync.get(
    ['youtubeBlocked', 'instagramBlocked'],
    function (data) {
      youtubeToggle.checked = data.youtubeBlocked || true;
      instagramToggle.checked = data.instagramBlocked || true;
      chrome.storage.sync.set({ youtubeBlocked: youtubeToggle.checked });
      chrome.storage.sync.set({ instagramBlocked: instagramToggle.checked });
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
