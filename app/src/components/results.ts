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

        <h3 class="mt-4 mb-3">
            Arena Matches (${result.matches.length})
        </h3>

        <div id="arena-matches" class="list-group"></div>
    `;

    const matchContainer =
        resultsContainer.querySelector<HTMLDivElement>('#arena-matches');

    if (!matchContainer) {
        return;
    }

    if (result.matches.length === 0) {
        matchContainer.textContent = 'No arena matches detected in this log.';
        return;
    }

    result.matches.forEach((match, index) => {
        const matchElement = document.createElement('div');
        matchElement.className = 'list-group-item';

        const title = document.createElement('div');
        title.className = 'fw-bold mb-1';

        const completed = match.endTimestamp !== null;

        title.textContent =
            `Match ${index + 1} — ${completed ? 'End recorded' : 'End not recorded'}`;
            
        const details = document.createElement('div');
        details.className = 'text-secondary small';

        details.textContent =
            `Rounds: ${match.rounds.length} | ` +
            `Started: ${match.startTimestamp} | ` +
            `Ended: ${match.endTimestamp ?? 'Not recorded'}`;

        const roundList = document.createElement('ol');
        roundList.className = 'small text-secondary mt-2 mb-0';

        match.rounds.forEach((round) => {
            const item = document.createElement('li');
            item.textContent = `Started: ${round.startTimestamp}`;
            roundList.append(item);
        });

        const roundDetails = document.createElement('details');
        roundDetails.className = 'mt-2';

        const summary = document.createElement('summary');
        summary.textContent = `Show ${match.rounds.length} rounds`;

        roundDetails.append(summary, roundList);

        matchElement.append(title, details, roundDetails);
        matchContainer.append(matchElement);
    });
}