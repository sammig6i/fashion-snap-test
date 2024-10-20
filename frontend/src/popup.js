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
        const base64 = await fileToBase64(file);
        const response = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            action: "storeImage",
            file: {
              name: file.name,
              type: file.type,
              size: file.size,
              base64: base64
            }
          }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });

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

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // TODO Update this in the future to work with filtered images sent from "filter_images" API endpoint
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
