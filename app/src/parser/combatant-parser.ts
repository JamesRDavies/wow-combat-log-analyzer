import type { CombatantInfoEvent } from './combat-event';

export interface CombatantInfo {
    timestamp: string;
    playerGuid: string;
    specId: number | null;
    rawPayload: string;
}

export function parseCombatantInfo(
    event: CombatantInfoEvent
): CombatantInfo | null {

    const talentsStart = event.rawPayload.indexOf(',[');

    if (talentsStart === -1) {
        return null;
    }

    const basicFields = event.rawPayload
        .slice(0, talentsStart)
        .split(',');

    const playerGuid = basicFields[0];
    const specText = basicFields[24];

    // Validate the player GUID
    if (!playerGuid || !/^Player-\d+-[A-F0-9]+$/i.test(playerGuid)) {
        return null;
    }

    // Convert the specialisation ID if valid
    const specId = specText && /^\d+$/.test(specText)
        ? Number(specText)
        : null;

    return {
        timestamp: event.timestamp,
        playerGuid,
        specId,
        rawPayload: event.rawPayload
    };
}