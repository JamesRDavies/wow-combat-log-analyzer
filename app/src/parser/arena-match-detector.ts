import { readLogLines } from './log-reader';
import { parseRecordHeader } from './record-parser';
import { classifyEvent, type CombatEvent } from './combat-event';

export interface ArenaRound {
    startTimestamp: string;
    startPayload: string;
}

export interface ArenaMatch {
    startTimestamp: string;
    endTimestamp: string | null;
    startPayload: string;
    endPayload: string | null;
    rounds: ArenaRound[];
}

export class ArenaMatchTracker {
    private matches: ArenaMatch[] = [];
    private currentMatch: ArenaMatch | null = null;

    private closeCurrentMatch(): void {
        if (this.currentMatch) {
            this.matches.push(this.currentMatch);
            this.currentMatch = null;
        }
    }

    consume(event: CombatEvent): void {
        switch (event.kind) {
            case 'arena-start': {
                const round: ArenaRound = {
                    startTimestamp: event.timestamp,
                    startPayload: event.rawPayload
                };

                // Consecutive Solo Shuffle starts in the same arena
                // represent rounds within the same lobby.
                if (
                    this.currentMatch &&
                    this.currentMatch.startPayload.includes('Solo Shuffle') &&
                    event.rawPayload.includes('Solo Shuffle') &&
                    this.currentMatch.startPayload.split(',')[0] ===
                        event.rawPayload.split(',')[0]
                ) {
                    this.currentMatch.rounds.push(round);
                    break;
                }

                // A new ordinary arena match, or a different lobby.
                // Preserve the previous match even if it had no end event.
                this.closeCurrentMatch();

                this.currentMatch = {
                    startTimestamp: event.timestamp,
                    endTimestamp: null,
                    startPayload: event.rawPayload,
                    endPayload: null,
                    rounds: [round]
                };
                break;
            }

            case 'arena-end':
                if (this.currentMatch) {
                    this.currentMatch.endTimestamp = event.timestamp;
                    this.currentMatch.endPayload = event.rawPayload;
                    this.closeCurrentMatch();
                }
                break;

            case 'other':
                // If the player leaves the zone without a recorded end,
                // preserve the match as having no end event.
                if (event.eventType === 'ZONE_CHANGE') {
                    this.closeCurrentMatch();
                }
                break;

            default:
                break;
        }
    }

    finish(): ArenaMatch[] {
        this.closeCurrentMatch();
        return this.matches;
    }
}

export async function detectArenaMatches(
    file: File
): Promise<ArenaMatch[]> {
    const tracker = new ArenaMatchTracker();

    for await (const line of readLogLines(file)) {
        const header = parseRecordHeader(line);

        if (!header) {
            continue;
        }

        const event = classifyEvent(header);
        tracker.consume(event);
    }

    return tracker.finish();
}