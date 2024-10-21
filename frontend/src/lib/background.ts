chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendImagesToServer") {
    sendImagesToServer(request.images);
  }
});

async function sendImagesToServer(images: string[]) {
  if (!images || images.length === 0) {
    console.error("No images to send to server");
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/filter_images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ images: images }),
    });
    const data = await response.json();

    console.log("Filtered images:", data.filteredImages);

    // TODO Store filtered images / update UI in popup.js
  } catch (error) {
    console.error("Error:", error);
  }
}
