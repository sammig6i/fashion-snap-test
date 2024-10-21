// Send Images to Server for Filtering
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendImagesToServer") {
    sendImagesToServer(request.images);
  }
});


async function sendImagesToServer(images) {
  if (!images || images.length === 0) {
    console.error('No images to send to server');
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/filter_images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ images: images }),
    });
    const data = await response.json();

    console.log('Filtered images:', data.filteredImages);

    // TODO Store filtered images / update UI in popup.js

  } catch (error) {
    console.error('Error:', error);
  }
}

/*
 TODO 
 send API request to server for virtual try-on logic
 1. User selects a garment image from list of filtered front-facing garment images
 2. When user clicks to try on garment image, an API request is sent to try-on endpoint for VTON model inference
 3. the resulting try-on image is sent to frontend
*/
