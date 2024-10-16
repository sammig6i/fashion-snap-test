chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "tryOn") {
    const clothImage = document.querySelector('.product-detail-images-thumbnails__item:first-child img');
    if (clothImage) {
      const fullSizeUrl = clothImage.src.replace(/&w=21&/, '&w=1920&');
      sendResponse({ clothImage: fullSizeUrl });
    } else {
      sendResponse({ error: "No clothing image found" });
    }
  }
  return true;
});
