<script lang="ts">
  import { onMount } from "svelte";

  let userImageInput: HTMLInputElement;
  let userImagePreview: HTMLImageElement;
  let resultDiv: HTMLDivElement;
  let isZaraWebsite = false;
  let theme: "light" | "dark";

  onMount(() => {
    // Check if we're on Zara's website
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const url = tabs[0]?.url ? new URL(tabs[0].url) : null;
      isZaraWebsite = url?.hostname.includes("zara.com") || false;
      if (!isZaraWebsite) {
        resultDiv.textContent = "This extension only works on Zara's website.";
      }
    });

    // Get the initial theme
    theme =
      (document.documentElement.getAttribute("data-theme") as
        | "light"
        | "dark") || "light";

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          theme =
            (document.documentElement.getAttribute("data-theme") as
              | "light"
              | "dark") || "light";
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
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

<div class="card card-compact bg-base-200 shadow-xl flex-grow">
  <div class="card-body p-4 overflow-y-auto">
    <input
      type="file"
      class="file-input file-input-bordered file-input-secondary w-full"
      accept="image/*,.heic,.heif"
      bind:this={userImageInput}
      on:change={handleFileChange}
    />
    <img
      bind:this={userImagePreview}
      alt="Selected outfit for virtual try-on"
      class="mt-4 w-full h-auto max-h-[70vh] object-contain hidden"
    />
    <button class="btn btn-primary mt-4 w-full">Try On</button>
    <div bind:this={resultDiv} class="mt-4 text-base"></div>
  </div>
</div>
