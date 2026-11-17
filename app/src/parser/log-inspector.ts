export interface InspectionResult {
  totalRecords: number;
  validRecords: number;
  malformedRecords: number;
}

export async function inspectLog(file: File): Promise<InspectionResult> {
    const recordPattern =
    /^(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{2}:\d{2}:\d{2}\.\d+)\s{2,}([A-Z][A-Z0-9_]*)(?:,|$)/;

    const sample = await file.slice(0, 16 * 1024).text();

    const lines = sample.split(/\r?\n/);

    // Remove the incomplete final line, or the empty entry
    // produced by a trailing newline.
    if (lines.length > 0) {
        lines.pop();
    }

    const result: InspectionResult = {
        totalRecords: 0,
        validRecords: 0,
        malformedRecords: 0
    };

    lines.forEach((line) => {
        // Skip blank lines
        if (!line.trim()) {
            return;
        }

        result.totalRecords++;

        const match = line.match(recordPattern);

        if (match) {
            result.validRecords++;
        } else {
            result.malformedRecords++;
        }
    });

    return result;
}