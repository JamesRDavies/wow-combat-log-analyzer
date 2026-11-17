import { readLogLines } from '../parser/log-reader';
import { parseRecordHeader } from './record-parser';
import { classifyEvent } from './combat-event';
import { ArenaMatchTracker, type ArenaMatch } from './arena-match-detector';

export interface InspectionResult {
  totalRecords: number;
  validRecords: number;
  malformedRecords: number;
  matches: ArenaMatch[];
}

export async function inspectLog(file: File, onProgress?: (bytesRead: number, totalBytes: number) => void | Promise<void>): Promise<InspectionResult> {
    const tracker = new ArenaMatchTracker();

    const result: InspectionResult = {
        totalRecords: 0,
        validRecords: 0,
        malformedRecords: 0,
        matches: []
    };

    

    for await (const line of readLogLines(file, onProgress)) {
        if (!line.trim()) {
            continue;
        }

        result.totalRecords++;

        const header = parseRecordHeader(line);

        if (header) {
            result.validRecords++;

            const event = classifyEvent(header);
            tracker.consume(event);
        } else {
            result.malformedRecords++;
        }
    }
    result.matches = tracker.finish();
    
    return result;
}