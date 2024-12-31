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

    hideInstagramReels();
  }
});

function hideInstagramReels() {
  const reelSvgIcons = document.querySelectorAll('svg[aria-label="Reel"]');
  reelSvgIcons.forEach((svg) => {
    const reelLink = svg.closest('a[role="link"]');
    if (reelLink) {
      const styledParent = reelLink.closest('[style]');
      if (styledParent && styledParent.parentElement) {
        styledParent.parentElement.style.display = 'none';
      }
    }
  });

  const reelsLinks = document.querySelectorAll(
    'a[role="link"][href*="/reels/"]'
  );
  console.log(reelsLinks, 'reelsLinksssss');
  reelsLinks.forEach((link) => {
    const containerWithAria = link.closest('[aria-describedby]');
    if (containerWithAria) {
      const parentElement = containerWithAria.parentElement;
      if (parentElement) {
        parentElement.style.display = 'none';
      }
    }
  });
}
