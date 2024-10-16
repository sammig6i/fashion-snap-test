document.addEventListener('DOMContentLoaded', function() {
  const userImageInput = document.getElementById('userImage');
  const userImagePreview = document.getElementById('userImagePreview');
  const tryOnButton = document.getElementById('tryOnButton');
  const resultDiv = document.getElementById('result');

  // Check if we're on Zara's website
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const url = new URL(tabs[0].url);
    if (!url.hostname.includes('zara.com')) {
      resultDiv.textContent = "This extension only works on Zara's website.";
      tryOnButton.disabled = true;
      return;
    }
  });

  userImageInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        chrome.storage.local.set({ 'userImage': e.target.result });
        userImagePreview.src = e.target.result;
        userImagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  tryOnButton.addEventListener('click', function() {
    chrome.storage.local.get(['userImage'], function(result) {
      if (!result.userImage) {
        resultDiv.textContent = "Please upload a user image first.";
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "tryOn" }, function(response) {
          if (response && response.clothImage) {
            // Send images to server for processing
            fetch('http://localhost:3000/try-on', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userImage: result.userImage,
                clothImage: response.clothImage
              }),
            })
            .then(response => response.json())
            .then(data => {
              resultDiv.innerHTML = `<img src="${data.resultImage}" alt="Try-On Result">`;
            })
            .catch(error => {
              resultDiv.textContent = "Error processing images: " + error.message;
            });
          } else {
            resultDiv.textContent = "No clothing image found on the page.";
          }
        });
      });
    });
  });
});
