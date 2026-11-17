import { readLogLines } from '../parser/log-reader';
import { parseRecordHeader } from './record-parser';

export interface InspectionResult {
  totalRecords: number;
  validRecords: number;
  malformedRecords: number;
}

export async function inspectLog(file: File, onProgress?: (bytesRead: number, totalBytes: number) => void | Promise<void>): Promise<InspectionResult> {
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

        const header = parseRecordHeader(line);

        if (header) {
            result.validRecords++;
        } else {
            result.malformedRecords++;
        }
    }

    return result;
}