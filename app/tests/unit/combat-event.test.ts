import { describe, it, expect } from 'vitest';
import { classifyEvent } from '../../src/parser/combat-event';

describe('classifyEvent', () => {
    it('classifies an arena match start event', () => {
        const header = {
            timestamp: '10/16/2026 10:06:26.4361',
            eventType: 'ARENA_MATCH_START',
            rawPayload: '1504,42,Rated Solo Shuffle,0'
        };

        const result = classifyEvent(header);

        expect(result).toEqual({
            ...header,
            kind: 'arena-start'
        });
    });

    it('classifies an arena match end event', () => {
        const header = {
            timestamp: '10/16/2026 10:06:26.4361',
            eventType: 'ARENA_MATCH_END',
            rawPayload: '1504,42,Rated Solo Shuffle,0'
        }; 

        const result = classifyEvent(header);

        expect(result).toEqual({
            ...header,
            kind: 'arena-end'
        });
    });

    it('classifies a combatant info event', () => {
        const header = {
            timestamp: '10/16/2026 10:06:26.4361',
            eventType: 'COMBATANT_INFO',
            rawPayload: 'Player-123,"Jámx",81751'
        };

        const result = classifyEvent(header);

        expect(result).toEqual({
            ...header,
            kind: 'combatant-info'
        });
    });

    it('classifies other combat events', () => {
        const header = {
            timestamp: '10/16/2026 10:06:26.4361',
            eventType: 'SPELL_HEAL',
            rawPayload: 'Player-123,"Jámx",81751'
        };

        const result = classifyEvent(header);

        expect(result).toEqual({
            ...header,
            kind: 'other'
        });
    });
});