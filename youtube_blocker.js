chrome.storage.sync.get(['youtubeBlocked'], function (data) {
  if (data.youtubeBlocked) {
    // Cache for already processed elements to avoid re-processing
    const processedElements = new WeakSet();

    // Statistics batching for better performance
    let statsBatch = {
      blockedCount: 0,
      lastUpdate: Date.now(),
    };

    // Batch statistics updates every 10 seconds instead of every block
    const statsInterval = setInterval(() => {
      if (statsBatch.blockedCount > 0) {
        updateStatisticsBatch(statsBatch.blockedCount);
        statsBatch.blockedCount = 0;
        statsBatch.lastUpdate = Date.now();
      }
    }, 10000); // Update every 10 seconds

    // Debounce function to limit execution frequency
    let debounceTimer;
    function debouncedHideShorts() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(
        () => hideYoutubeShorts(processedElements, statsBatch),
        150
      );
    }

    // More efficient observer that only triggers on relevant changes
    const observer = new MutationObserver(function (mutations) {
      let shouldUpdate = false;

      for (const mutation of mutations) {
        // Only process if new nodes were added
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any added nodes might contain shorts
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Quick check for potential shorts content
              if (
                node.querySelector &&
                (node.querySelector('a[href^="/shorts"]') ||
                  node.querySelector('ytd-reel-shelf-renderer') ||
                  node.querySelector('a[title="Shorts"]'))
              ) {
                shouldUpdate = true;
                break;
              }
            }
          }
        }
      }

      if (shouldUpdate) {
        debouncedHideShorts();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial hide
    hideYoutubeShorts(processedElements, statsBatch);

    // Set up periodic cleanup for better performance
    setInterval(() => {
      hideYoutubeShorts(processedElements, statsBatch);
    }, 5000); // Check every 5 seconds for any missed elements
  }
});

function hideYoutubeShorts(
  processedElements = new WeakSet(),
  statsBatch = { blockedCount: 0 }
) {
  // Use more specific selectors to avoid expensive operations
  const shortsElements = document.querySelectorAll('a[href^="/shorts"]');
  let hiddenCount = 0;

  shortsElements.forEach((element) => {
    // Skip if already processed
    if (processedElements.has(element)) return;

    const container = element.closest(
      'ytd-video-renderer, ytd-rich-section-renderer, ytd-reel-shelf-renderer'
    );
    if (container && container.style.display !== 'none') {
      container.style.display = 'none';
      processedElements.add(element);
      processedElements.add(container);
      hiddenCount++;
    }
  });

  // Hide shorts tab if not already hidden
  const shortsTab = document.querySelector('a[title="Shorts"]');
  if (shortsTab && shortsTab.style.display !== 'none') {
    shortsTab.style.display = 'none';
    processedElements.add(shortsTab);
  }

  // More efficient chip removal - only search in specific containers
  const chipContainers = document.querySelectorAll('#chip-shape-container');
  chipContainers.forEach((container) => {
    if (processedElements.has(container)) return;

    const chipTextElements = container.querySelectorAll('div, button');
    chipTextElements.forEach((element) => {
      if (element.textContent.trim().toLowerCase() === 'shorts') {
        container.remove();
        processedElements.add(container);
        return;
      }
    });
  });

  // Hide reel shelf renderers directly
  const reelShelves = document.querySelectorAll('ytd-reel-shelf-renderer');
  reelShelves.forEach((shelf) => {
    if (processedElements.has(shelf)) return;

    if (shelf.style.display !== 'none') {
      shelf.style.display = 'none';
      processedElements.add(shelf);
      hiddenCount++;
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

    // Estimate time saved (assume each short takes 2 minutes to watch)
    const estimatedTimePerElement = 2;
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
