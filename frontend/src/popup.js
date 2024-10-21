// TODO FUTURE - port frontend to Svelte with DaisyUI
document.addEventListener('DOMContentLoaded', function () {
  const userImageInput = document.getElementById('userImage');
  const userImagePreview = document.getElementById('userImagePreview');
  const tryOnButton = document.getElementById('tryOn');
  const resultDiv = document.getElementById('result');

  // Check if we're on Zara's website
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = new URL(tabs[0].url);
    if (!url.hostname.includes('zara.com')) {
      resultDiv.textContent = "This extension only works on Zara's website.";
      return;
    }
  });

  userImageInput.accept = "image/*,.heic,.heif";
  userImageInput.addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (file) {
      try {
        const response = await sendImageToServer(file);

        if (response && response.img_path) {
          userImagePreview.src = response.img_path;
          userImagePreview.style.display = 'block';
          resultDiv.textContent = response.message || "Image uploaded successfully";
        } else {
          throw new Error('Invalid response from server: ' + JSON.stringify(response));
        }
      } catch (error) {
        console.error('Error storing image:', error);
        resultDiv.textContent = "Error storing image: " + error.message;
      }
    } else {
      resultDiv.textContent = "No user image found.";
    }
  });

  async function sendImageToServer(file) {
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
  }

  // TODO FUTURE - Work with the filtereed images that contain the front-facing garments
  // tryOnButton.addEventListener('click', function () {
  //   chrome.storage.local.get(['selectedImageUrl'], function (result) {
  //     if (result.selectedImageUrl) {
  //       const formData = new FormData();
  //       formData.append('user_image', userImageBlob, 'user_image.jpg');
  //       formData.append('garment_image', result.selectedImageUrl, 'garment.jpg');

  //       fetch('http://localhost:8000/try_on', {
  //         method: 'POST',
  //         body: formData,
  //       })
  //         .then(response => response.json())
  //         .then(data => {
  //           resultDiv.textContent = data.message;
  //           chrome.storage.local.remove('selectedImageUrl');
  //         })
  //         .catch(error => {
  //           resultDiv.textContent = "Error processing images: " + error.message;
  //         });
  //     } else {
  //       resultDiv.textContent = "No clothing image selected. Please use 'Select Clothing Image' first.";
  //     }
  //   });
  // })
});
