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

    // TODO Store filtered images / update UI in poopup.js

  } catch (error) {
    console.error('Error:', error);
  }
}


// Store User Image
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "storeImage") {
    const file = base64ToFile(request.file.base64, request.file.name, request.file.type);
    storeImage(file)
      .then(response => {
        sendResponse(response);
      })
      .catch(error => {
        console.error('Error in storeImage:', error);
        sendResponse({ error: error.message });
      });
    return true;
  }
});

function base64ToFile(base64, filename, mime) {
  const arr = base64.split(',');
  if (arr.length !== 2) {
    throw new Error('Invalid Base64 string format');
  }

  let bstr;
  try {
    bstr = atob(arr[1]);
  } catch (error) {
    console.error('Failed to decode Base64 string:', error);
    throw new Error('Invalid Base64 encoding');
  }

  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

async function storeImage(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/store_user_image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to store user image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error storing user image:', error);
    throw error;
  }
};

/*
 TODO send API request to server for virtual try-on logic

 1. User selects a garment image from list of filtered front-facing garment images
 2. When user clicks to try on garment image, an API request for model inference --> server
 3. result image from server --> popup.js
*/
