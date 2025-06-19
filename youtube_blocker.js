chrome.storage.sync.get(['youtubeBlocked'], function (data) {
  if (data.youtubeBlocked) {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        hideYoutubeShorts();
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    hideYoutubeShorts();
  }
});

function hideYoutubeShorts() {
  const shortsElements = document.querySelectorAll('a[href^="/shorts"]');
  shortsElements.forEach((element) => {
    const container = element.closest(
      'ytd-video-renderer, ytd-rich-section-renderer,ytd-reel-shelf-renderer'
    );
    if (container) {
      container.style.display = 'none';
    }
  });

  const shortsTab = document.querySelector('a[title="Shorts"]');
  if (shortsTab) {
    shortsTab.style.display = 'none';
  }

  const chipTextElements = document.querySelectorAll('div, button');
  chipTextElements.forEach((element) => {
    if (element.textContent.trim().toLowerCase() === 'shorts') {
      const container = element.closest('#chip-shape-container');
      if (container) {
        container.remove();
      }
    }
  });
}
