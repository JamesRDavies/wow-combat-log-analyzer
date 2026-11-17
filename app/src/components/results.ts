import type { InspectionResult } from '../parser/log-inspector';

export function renderResults(): string {
  return `
    <section class="card">
      <div class="card-body">

        <h2 class="card-title">Analysis Results</h2>

        <div id="results-content">
          <p class="text-secondary">
            No combat log has been analysed yet.
          </p>
        </div>

      </div>
    </section>
  `;
}

export function displayInspectionResults(result: InspectionResult): void {
  const resultsContainer =
    document.querySelector<HTMLDivElement>('#results-content');

  if (!resultsContainer) {
    return;
  }

  resultsContainer.innerHTML = `
    <h3 class="mb-3">Log Inspection Summary</h3>

    <p>Total records inspected: ${result.totalRecords}</p>
    <p>Valid records: ${result.validRecords}</p>
    <p>Malformed records: ${result.malformedRecords}</p>
  `;
}