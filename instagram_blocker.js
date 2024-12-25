chrome.storage.sync.get(['instagramBlocked'], function (data) {
  if (data.instagramBlocked) {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        hideInstagramReels();
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    hideInstagramReels();
  }
});

function hideInstagramReels() {
  // Hide Reels tab
  const reelsTab = document.querySelector('a[href="/reels/"]');
  if (reelsTab) {
    const tabContainer = reelsTab.closest('div[role="menuitem"]');
    if (tabContainer) {
      tabContainer.style.display = 'none';
    }
  }

  // Hide Reels in feed
  const reelsElements = document.querySelectorAll(
    'div[role="presentation"] video'
  );
  reelsElements.forEach((element) => {
    const container = element.closest('article');
    if (container) {
      container.style.display = 'none';
    }
  });
}
