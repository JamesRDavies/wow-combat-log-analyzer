import type { ParsedRecordHeader } from './record-parser';

export type CombatEvent =
    | ArenaMatchStartEvent
    | ArenaMatchEndEvent
    | CombatantInfoEvent
    | OtherCombatEvent;

export interface ArenaMatchStartEvent extends ParsedRecordHeader {
    kind: 'arena-start';
    eventType: 'ARENA_MATCH_START';
}

export interface ArenaMatchEndEvent extends ParsedRecordHeader {
    kind: 'arena-end';
    eventType: 'ARENA_MATCH_END';
}

export interface CombatantInfoEvent extends ParsedRecordHeader {
    kind: 'combatant-info';
    eventType: 'COMBATANT_INFO';
}

export interface OtherCombatEvent extends ParsedRecordHeader {
    kind: 'other';
    eventType: string;
}

export function classifyEvent(
    header: ParsedRecordHeader
): CombatEvent {

    switch (header.eventType) {
        case 'ARENA_MATCH_START':
            return {
                ...header,
                kind: 'arena-start',
                eventType: 'ARENA_MATCH_START'
            };

        case 'ARENA_MATCH_END':
            return {
                ...header,
                kind: 'arena-end',
                eventType: 'ARENA_MATCH_END'
            };

        case 'COMBATANT_INFO':
            return {
                ...header,
                kind: 'combatant-info',
                eventType: 'COMBATANT_INFO'
            };

        default:
            return {
                ...header,
                kind: 'other'
            };
    }
}