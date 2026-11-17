import { readLogLines } from '../parser/log-reader';

export interface InspectionResult {
  totalRecords: number;
  validRecords: number;
  malformedRecords: number;
}

export async function inspectLog(file: File, onProgress?: (bytesRead: number, totalBytes: number) => void | Promise<void>): Promise<InspectionResult> {
    const recordPattern =
    /^(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{2}:\d{2}:\d{2}\.\d+)\s{2,}([A-Z][A-Z0-9_]*)(?:,|$)/;

    const result: InspectionResult = {
        totalRecords: 0,
        validRecords: 0,
        malformedRecords: 0
    };

    for await (const line of readLogLines(file, onProgress)) {
        if (!line.trim()) {
            continue;
        }

        result.totalRecords++;

        const match = line.match(recordPattern);

        if (match) {
            result.validRecords++;
        } else {
            result.malformedRecords++;
        }
    }

    return result;
}