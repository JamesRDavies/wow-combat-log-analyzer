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
          >
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