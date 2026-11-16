export function initFileUpload(): void {
  const fileInput = document.querySelector<HTMLInputElement>('#log-file');
  const fileDetails = document.querySelector<HTMLParagraphElement>('#file-details');
  const fileError = document.querySelector<HTMLParagraphElement>('#file-error');

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    const validationError = validateFile(file);

    if (fileError) {
      fileError.textContent = validationError;
      fileError.hidden = !validationError;
    }

    if (validationError) {
      if (fileDetails) {
        fileDetails.textContent = '';
      }
      return;
    }

    if (file && fileDetails != null) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

      fileDetails.textContent = `${file.name} (${sizeMB} MB)`;
    } else if (fileDetails) {
      fileDetails.textContent = '';
    }
  });
}


function validateFile(file: File | undefined): string | null {
  // Check whether a file was selected
  if (!file) {
    return 'No file selected.';
  }

  // Check the filename extension
  if (!file.name.toLowerCase().endsWith('.txt')) {
    return 'Selected file must have a .txt extension.';
  }

  // Check whether the file is empty
  if (file.size === 0) {
    return 'Selected file is empty.';
  }

  // Return null if everything is valid
  return null;
}


export function renderFileUpload(): string {
  return `
    <section class="card mb-4">
      <div class="card-body">

        <h2 class="card-title">Import Combat Log</h2>
        <p class="text-secondary">
          Select a combat log file to begin analysis.
        </p>

        <div class="mb-3">
          <label for="log-file" class="form-label">
            Combat log file
          </label>

          <input
            type="file"
            id="log-file"
            class="form-control"
            accept=".txt"
          ><p id="file-details" class="text-secondary mt-2"></p>
          <p id="file-error" class="text-danger mt-2" role="alert" hidden></p>
        </div>

        <button
          type="button"
          id="import-button"
          class="btn btn-primary"
          disabled
        >
          Import Log
        </button>

        <div id="processing-status" class="mt-4" hidden>
          <p class="text-secondary">Processing combat log...</p>

          <div class="progress progress-sm"
               role="progressbar"
               aria-label="Processing combat log">
            <div class="progress-bar progress-bar-indeterminate"></div>
          </div>
        </div>

      </div>
    </section>
  `;
}