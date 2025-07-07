chrome.storage.sync.get(['instagramBlocked'], function (data) {
  if (data.instagramBlocked) {
    // Cache for already processed elements to avoid re-processing
    const processedElements = new WeakSet();

    // Statistics batching for better performance
    let statsBatch = {
      blockedCount: 0,
      lastUpdate: Date.now(),
    };

    // Batch statistics updates every 10 seconds instead of every block

    // Debounce function to limit execution frequency
    let debounceTimer;
    function debouncedHideReels() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(
        () => hideInstagramReels(processedElements, statsBatch),
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
    hideInstagramReels(processedElements, statsBatch);

    // Set up periodic cleanup for better performance
    setInterval(() => {
      hideInstagramReels(processedElements, statsBatch);
    }, 5000); // Check every 5 seconds for any missed elements
  }
});

function hideInstagramReels(
  processedElements = new WeakSet(),
  statsBatch = { blockedCount: 0 }
) {
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

  // Add to batch instead of immediate update
  if (hiddenCount > 0) {
    statsBatch.blockedCount += hiddenCount;
  }
}

// Optimized batch statistics update
function updateStatisticsBatch(newlyBlockedCount) {
  // Only update if there are actually blocked elements
  if (newlyBlockedCount <= 0) return;

  // Get current statistics once per batch
  chrome.storage.sync.get(['blockedElements', 'timeSaved'], function (data) {
    const currentElements = data.blockedElements || 0;
    const currentTimeSaved = data.timeSaved || 0;

    // Estimate time saved (assume each reel takes 1.5 minutes to watch)
    const estimatedTimePerElement = 1.5;
    const additionalTimeSaved = newlyBlockedCount * estimatedTimePerElement;

    // Update statistics
    const newElements = currentElements + newlyBlockedCount;
    const newTimeSaved = currentTimeSaved + additionalTimeSaved;

    // Save updated statistics
    chrome.storage.sync.set({
      blockedElements: newElements,
      timeSaved: newTimeSaved,
      lastUpdate: Date.now(),
    });
  });
}
