export interface ParsedRecordHeader {
    timestamp: string;
    eventType: string;
    rawPayload: string;
}

const recordPattern =
        /^(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{2}:\d{2}:\d{2}\.\d+)\s{2,}([A-Z][A-Z0-9_]*)(?:,(.*)|$)/;


export function parseRecordHeader(line: string): ParsedRecordHeader | null {
    const match = line.match(recordPattern);

    if (!match) {
        return null;
    }

    return {
        timestamp: match[1],
        eventType: match[2],
        rawPayload: match[3] ?? ''
    };
}