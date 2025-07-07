chrome.storage.sync.get(['instagramBlocked'], function (data) {
  if (data.instagramBlocked) {
    // Cache for already processed elements to avoid re-processing
    const processedElements = new WeakSet();

    // Debounce function to limit execution frequency
    let debounceTimer;
    function debouncedHideReels() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(
        () => hideInstagramReels(processedElements),
        150
      );
    }

    // More efficient observer that only triggers on relevant changes
    const observer = new MutationObserver(function (mutations) {
      let shouldUpdate = false;

      for (const mutation of mutations) {
        // Only process if new nodes were added
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any added nodes might contain reels
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Quick check for potential reels content
              if (
                node.querySelector &&
                (node.querySelector('svg[aria-label="Reel"]') ||
                  node.querySelector('a[role="link"][href*="/reels/"]'))
              ) {
                shouldUpdate = true;
                break;
              }
            }
          }
        }
      }

      if (shouldUpdate) {
        debouncedHideReels();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial hide
    hideInstagramReels(processedElements);

    // Set up periodic cleanup for better performance
    setInterval(() => {
      hideInstagramReels(processedElements);
    }, 5000); // Check every 5 seconds for any missed elements
  }
});

function hideInstagramReels(processedElements = new WeakSet()) {
  let hiddenCount = 0;

  // Hide reels with SVG icons
  const reelSvgIcons = document.querySelectorAll('svg[aria-label="Reel"]');
  reelSvgIcons.forEach((svg) => {
    // Skip if already processed
    if (processedElements.has(svg)) return;

    const reelLink = svg.closest('a[role="link"]');
    if (reelLink) {
      const styledParent = reelLink.closest('[style]');
      if (styledParent && styledParent.parentElement) {
        const targetElement = styledParent.parentElement;
        if (targetElement.style.display !== 'none') {
          targetElement.style.display = 'none';
          processedElements.add(svg);
          processedElements.add(reelLink);
          processedElements.add(styledParent);
          processedElements.add(targetElement);
          hiddenCount++;
        }
      }
    }
  });

  // Hide reels with direct links
  const reelsLinks = document.querySelectorAll(
    'a[role="link"][href*="/reels/"]'
  );
  reelsLinks.forEach((link) => {
    // Skip if already processed
    if (processedElements.has(link)) return;

    const containerWithAria = link.closest('[aria-describedby]');
    if (containerWithAria) {
      const parentElement = containerWithAria.parentElement;
      if (parentElement && parentElement.style.display !== 'none') {
        parentElement.style.display = 'none';
        processedElements.add(link);
        processedElements.add(containerWithAria);
        processedElements.add(parentElement);
        hiddenCount++;
      }
    }
  });

  // Only log if something was actually hidden (for debugging)
  if (hiddenCount > 0) {
    console.log(`Instagram Reels Blocker: Hidden ${hiddenCount} reel elements`);
  }
}
