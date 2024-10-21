function determinePageType() {
  if (document.querySelector('.product-detail-images__images')) {
    return 'individual';
  } else if (document.querySelector('.product-grid__product-list')) {
    return 'grid';
  }
  return 'unknown';
}

let processedImages = new Set();

function extractProductImages(pageType) {
  let images = [];

  if (pageType === 'individual' || pageType === 'grid') {
    if (pageType === 'individual') {
      const visibleThumbnails = document.querySelectorAll('.product-detail-images__image-wrapper');
      images = Array.from(visibleThumbnails).map(wrapper => {
        const sourceTags = wrapper.querySelectorAll('source');
        if (sourceTags.length > 0) {
          const lastSource = sourceTags[sourceTags.length - 1];
          const srcset = lastSource.getAttribute('srcset');
          if (srcset) {
            const firstImageUrl = srcset.split(',')[0].split(' ')[0];
            return firstImageUrl.replace(/&w=\d+&/, '&w=2048&');
          }
        }
        return null;
      }).filter(Boolean);
    }

    const productCards = document.querySelectorAll('.product-grid-product__figure');
    const gridImages = Array.from(productCards).map(card => {
      const img = card.querySelector('img');
      if (img && img.src && !img.src.includes('transparent-background.png')) {
        return img.src.replace(/&w=\d+&/, '&w=2048&');
      }
      return null;
    }).filter(Boolean);

    images = [...images, ...gridImages];
  }

  return images;
}

function sendImagesToBackground() {
  const pageType = determinePageType();

  if (pageType !== 'unknown') {
    const productImages = extractProductImages(pageType);
    const newImages = productImages.filter(img => !processedImages.has(img));

    if (newImages.length > 0) {
      chrome.runtime.sendMessage({ action: "sendImagesToServer", images: newImages });
      newImages.forEach(img => processedImages.add(img));
    }
  }
}

const observer = new IntersectionObserver((entries) => {
  if (entries.some(entry => entry.isIntersecting)) {
    sendImagesToBackground();
  }
}, {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
});

function setupObserver() {
  document.querySelectorAll('.product-detail-images__image-wrapper, .product-grid-product__figure').forEach(element => {
    observer.observe(element);
  });
}

setupObserver();
sendImagesToBackground();

const mutationObserver = new MutationObserver((mutations) => {
  for (let mutation of mutations) {
    if (mutation.type === 'childList') {
      setupObserver();
      sendImagesToBackground();
      break;
    }
  }
});

mutationObserver.observe(document.body, {
  childList: true,
  subtree: true
});

// TODO this function will use filtered images to make inference API request to virtual try-on model
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.action === "tryOn") {
//     const clothImage = document.querySelector('.product-detail-images-thumbnails__item:first-child img');
//     if (clothImage) {
//       console.log(`Clothing image: ${clothImage}`);
//       const fullSizeUrl = clothImage.src.replace(/&w=21&/, '&w=1920&');
//       sendResponse({ clothImage: fullSizeUrl });
//     } else {
//       sendResponse({ error: "No clothing image found" });
//     }
//   }
//   return true;
// })







