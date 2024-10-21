<script lang="ts">
  import { onMount } from "svelte";

  let userImageInput: HTMLInputElement;
  let userImagePreview: HTMLImageElement;
  let resultDiv: HTMLDivElement;
  let isZaraWebsite = false;

  onMount(() => {
    // Check if we're on Zara's website
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const url = tabs[0]?.url ? new URL(tabs[0].url) : null;
      isZaraWebsite = url?.hostname.includes("zara.com") || false;
      if (!isZaraWebsite) {
        resultDiv.textContent = "This extension only works on Zara's website.";
      }
    });
  });

  async function handleFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      try {
        const response = await sendImageToServer(file);

        if (response && response.img_path) {
          userImagePreview.src = response.img_path;
          userImagePreview.style.display = "block";
          resultDiv.textContent =
            response.message || "Image uploaded successfully";
        } else {
          throw new Error(
            "Invalid response from server: " + JSON.stringify(response)
          );
        }
      } catch (error) {
        console.error("Error storing image:", error);
        resultDiv.textContent = `Error storing image: ${error instanceof Error ? error.message : String(error)}`;
      }
    } else {
      resultDiv.textContent = "No user image found.";
    }
  }

  async function sendImageToServer(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:8000/store_user_image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to store user image");
    }

    return await response.json();
  }
</script>

<main>
  <h1>Virtual Try-On</h1>
  <input
    type="file"
    bind:this={userImageInput}
    on:change={handleFileChange}
    accept="image/*,.heic,.heif"
  />
  <img
    bind:this={userImagePreview}
    alt="Selected outfit for virtual try-on"
    style="display: none; max-width: 100%; margin-top: 10px;"
  />
  <button>Try On</button>
  <div bind:this={resultDiv}></div>
</main>
