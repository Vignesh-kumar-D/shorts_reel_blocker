document.addEventListener('DOMContentLoaded', function () {
  const youtubeToggle = document.getElementById('youtubeToggle');
  const instagramToggle = document.getElementById('instagramToggle');
  const statusText = document.getElementById('statusText');
  const statusIndicator = document.getElementById('statusIndicator');
  const blockedCount = document.getElementById('blockedCount');
  const timeSaved = document.getElementById('timeSaved');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const resetStatsButton = document.getElementById('resetStats');

  // Initialize extension
  initializeExtension();

  // Refresh statistics every 5 seconds when popup is open (reduced from 2 seconds)
  const statsInterval = setInterval(refreshStatistics, 5000);

  // Clean up interval when popup closes
  window.addEventListener('beforeunload', () => {
    clearInterval(statsInterval);
  });

  function initializeExtension() {
    try {
      chrome.storage.sync.get(
        ['youtubeBlocked', 'instagramBlocked', 'blockedElements', 'timeSaved'],
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

          // Update ARIA attributes for accessibility
          youtubeToggle.setAttribute(
            'aria-checked',
            data.youtubeBlocked.toString()
          );
          instagramToggle.setAttribute(
            'aria-checked',
            data.instagramBlocked.toString()
          );

          // Update status indicator
          updateStatusIndicator(data.youtubeBlocked, data.instagramBlocked);

          // Update statistics
          updateStatistics(data.blockedElements || 0, data.timeSaved || 0);

          // Hide any previous errors
          hideError();
        }
      );
    } catch (error) {
      showError('Failed to initialize extension settings');
      console.error('Initialization error:', error);
    }
  }

  youtubeToggle.addEventListener('change', function () {
    try {
      const isChecked = this.checked;
      chrome.storage.sync.set({ youtubeBlocked: isChecked });
      this.setAttribute('aria-checked', isChecked.toString());
      updateContentScript('youtube');
      updateStatusIndicator(isChecked, instagramToggle.checked);
      trackEvent('youtube_toggle', { enabled: isChecked });
    } catch (error) {
      showError('Failed to update YouTube settings');
      console.error('YouTube toggle error:', error);
    }
  });

  instagramToggle.addEventListener('change', function () {
    try {
      const isChecked = this.checked;
      chrome.storage.sync.set({ instagramBlocked: isChecked });
      this.setAttribute('aria-checked', isChecked.toString());
      updateContentScript('instagram');
      updateStatusIndicator(youtubeToggle.checked, isChecked);
      trackEvent('instagram_toggle', { enabled: isChecked });
    } catch (error) {
      showError('Failed to update Instagram settings');
      console.error('Instagram toggle error:', error);
    }
  });

  // Reset statistics button
  resetStatsButton.addEventListener('click', function () {
    if (
      confirm(
        'Are you sure you want to reset your statistics? This action cannot be undone.'
      )
    ) {
      resetStatistics();
    }
  });

  // Footer link handlers
  document
    .getElementById('privacyLink')
    .addEventListener('click', function (e) {
      e.preventDefault();
      chrome.tabs.create({ url: chrome.runtime.getURL('privacy-policy.html') });
    });

  document
    .getElementById('feedbackLink')
    .addEventListener('click', function (e) {
      e.preventDefault();
      chrome.tabs.create({
        url: 'https://chromewebstore.google.com/detail/shorts-reels-blocker/hddclpebfglijbmapdjminkkcafchkmb',
      });
    });

  function updateStatusIndicator(youtubeBlocked, instagramBlocked) {
    const totalBlocked = (youtubeBlocked ? 1 : 0) + (instagramBlocked ? 1 : 0);

    if (totalBlocked === 2) {
      statusText.textContent = 'All platforms protected';
      statusIndicator.style.background =
        'linear-gradient(135deg, var(--success-color), #059669)';
    } else if (totalBlocked === 1) {
      statusText.textContent = 'Partially protected';
      statusIndicator.style.background =
        'linear-gradient(135deg, var(--warning-color), #d97706)';
    } else {
      statusText.textContent = 'Protection disabled';
      statusIndicator.style.background =
        'linear-gradient(135deg, var(--error-color), #dc2626)';
    }
  }

  function updateStatistics(elements, minutes) {
    blockedCount.textContent = elements.toLocaleString();

    // Format time saved more nicely
    if (minutes < 60) {
      timeSaved.textContent = `${minutes}m`;
    } else if (minutes < 1440) {
      // less than 24 hours
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      timeSaved.textContent = `${hours}h ${remainingMinutes}m`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      timeSaved.textContent = `${days}d ${hours}h`;
    }
  }

  function refreshStatistics() {
    chrome.storage.sync.get(['blockedElements', 'timeSaved'], function (data) {
      const elements = data.blockedElements || 0;
      const minutes = data.timeSaved || 0;
      updateStatistics(elements, minutes);
    });
  }

  function resetStatistics() {
    try {
      chrome.storage.sync.set(
        {
          blockedElements: 0,
          timeSaved: 0,
          lastUpdate: Date.now(),
        },
        function () {
          updateStatistics(0, 0);
          trackEvent('statistics_reset');
          showSuccess('Statistics reset successfully!');
        }
      );
    } catch (error) {
      showError('Failed to reset statistics');
      console.error('Reset statistics error:', error);
    }
  }

  function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(hideError, 5000); // Auto-hide after 5 seconds
  }

  function showSuccess(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.style.backgroundColor = '#f0fdf4';
    errorMessage.style.borderColor = '#bbf7d0';
    errorMessage.style.color = '#166534';
    setTimeout(hideError, 3000); // Auto-hide after 3 seconds
  }

  function hideError() {
    errorMessage.style.display = 'none';
    // Reset error message styling
    errorMessage.style.backgroundColor = '#fef2f2';
    errorMessage.style.borderColor = '#fecaca';
    errorMessage.style.color = '#ef4444';
  }

  function trackEvent(eventName, parameters = {}) {
    // Analytics tracking for Featured extension requirements
    try {
      chrome.storage.local.get(['analytics'], function (data) {
        const analytics = data.analytics || {};
        const timestamp = Date.now();

        if (!analytics[eventName]) {
          analytics[eventName] = [];
        }

        analytics[eventName].push({
          timestamp,
          ...parameters,
        });

        // Keep only last 100 events per type
        if (analytics[eventName].length > 100) {
          analytics[eventName] = analytics[eventName].slice(-100);
        }

        chrome.storage.local.set({ analytics });
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }
});

function updateContentScript(platform) {
  try {
    chrome.tabs.query({ url: `*://*.${platform}.com/*` }, function (tabs) {
      if (chrome.runtime.lastError) {
        console.error('Tab query error:', chrome.runtime.lastError);
        return;
      }

      tabs.forEach((tab) => {
        chrome.tabs.reload(tab.id, { bypassCache: true }, function () {
          if (chrome.runtime.lastError) {
            console.error('Tab reload error:', chrome.runtime.lastError);
          }
        });
      });
    });
  } catch (error) {
    console.error('Content script update error:', error);
  }
}
