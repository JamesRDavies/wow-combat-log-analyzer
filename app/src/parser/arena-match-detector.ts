import { readLogLines } from './log-reader';
import { parseRecordHeader } from './record-parser';
import { classifyEvent } from './combat-event';

export interface ArenaMatch {
    startTimestamp: string;
    endTimestamp: string | null;
    startPayload: string;
    endPayload: string | null;
}

export async function detectArenaMatches(file: File): Promise<ArenaMatch[]> {
    const matches: ArenaMatch[] = [];
    let currentMatch: ArenaMatch | null = null;

    for await (const line of readLogLines(file)) {
        const header = parseRecordHeader(line);

        if (!header) {
            continue;
        }

        const event = classifyEvent(header);

        switch (event.kind) {
            case 'arena-start':
                if (currentMatch) {
                    matches.push(currentMatch);
                }

                currentMatch = {
                    startTimestamp: event.timestamp,
                    endTimestamp: null,
                    startPayload: event.rawPayload,
                    endPayload: null
                };
                break;

            case 'arena-end':
                if (currentMatch) {
                    currentMatch.endTimestamp = event.timestamp;
                    currentMatch.endPayload = event.rawPayload;
                    matches.push(currentMatch);
                    currentMatch = null;
                }
                break;

            default:
                // Other events aren't relevant to boundaries yet
                break;
        }
    }

    if (currentMatch) {
        matches.push(currentMatch);
    }

    return matches;
}