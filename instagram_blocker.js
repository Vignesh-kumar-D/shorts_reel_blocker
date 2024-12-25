// instagram-blocker.js
chrome.storage.sync.get(['instagramBlocked'], function (data) {
  if (data.instagramBlocked) {
    const observer = new MutationObserver(function (mutations) {
      hideInstagramReels();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Run initial hide
    hideInstagramReels();
  }
});

function hideInstagramReels() {
  // Hide Reels from navigation
  const reelsNavItems = document.querySelectorAll(`
        a[href="/reels/"],
        a[href*="/reels"]
    `);
  reelsNavItems.forEach((item) => {
    const navContainer = item.closest('div[role="menuitem"]');
    if (navContainer) {
      navContainer.style.display = 'none';
    }
  });

  // Hide Reels from feed
  const reelsSelectors = [
    // Reels in main feed
    'div[role="presentation"] div[data-media-type="Reels"]',
    'div[role="presentation"] div[data-media-type="Video"]',
    // Reels section
    'section main div[style*="max-height"][style*="max-width"] video',
    // Reels suggestions
    'div[role="presentation"] a[href*="/reels/"]',
    // Reels tab content
    'div[role="tabpanel"] video',
    // Additional video content that might be Reels
    'div._aagv', // Instagram's internal class for Reels
    'div[class*="reels"]', // Any class containing "reels"
    'a[href*="/reels/"]', // Any link to reels
  ];

  const reelsElements = document.querySelectorAll(reelsSelectors.join(','));
  reelsElements.forEach((element) => {
    // Find the closest container to hide
    const container = element.closest(
      'article, div[role="presentation"], div[style*="max-height"]'
    );
    if (container) {
      container.style.display = 'none';
    }
  });

  // Hide Reels icon from bottom navigation (mobile view)
  const reelsLinks = document.querySelectorAll(
    'a[role="link"][href*="/reels/"]'
  );

  reelsLinks.forEach((link) => {
    // Find closest parent with aria-describedby
    const containerWithAria = link.closest('[aria-describedby]');
    if (containerWithAria) {
      // Get and hide the parent of this container
      const parentElement = containerWithAria.parentElement;
      if (parentElement) {
        parentElement.style.display = 'none';
      }
    }
  });
}
