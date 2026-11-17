import { describe, it, expect } from 'vitest';
import { parseRecordHeader } from '../../src/parser/record-parser';

describe('parseRecordHeader', () => {
    it('extracts timestamp, event type and raw payload', () => {
        const line =
            '10/27/2026 21:31:07.8100  SPELL_HEAL,Player-123,"Jámx",81751';

        const result = parseRecordHeader(line);

        expect(result).toEqual({
            timestamp: '10/27/2026 21:31:07.8100',
            eventType: 'SPELL_HEAL',
            rawPayload: 'Player-123,"Jámx",81751'
        });
    });

    it('returns null for malformed lines', () => {
        const malformedLine = 'This is not a valid record line';
        const result = parseRecordHeader(malformedLine);
        expect(result).toBeNull();
    });

    it('handles lines with no payload', () => {
        const line = '10/27/2026 21:31:07.8100  ZONE_CHANGE';
        const result = parseRecordHeader(line);
        expect(result).toEqual({
            timestamp: '10/27/2026 21:31:07.8100',
            eventType: 'ZONE_CHANGE',
            rawPayload: ''
        });
    });

    it('handles complex payloads with commas and quotes', () => {
        const line =
            '10/27/2026 21:31:07.8100  SPELL_CAST_SUCCESS,Player-123,"Jámx, the Brave",12345,"Some, complex, payload"';
        const result = parseRecordHeader(line);
        expect(result).toEqual({
            timestamp: '10/27/2026 21:31:07.8100',
            eventType: 'SPELL_CAST_SUCCESS',
            rawPayload: 'Player-123,"Jámx, the Brave",12345,"Some, complex, payload"'
        });
    });

    it.each([
        ['1/1/2026 01:01:01.1  ZONE_CHANGE,Payload',
        '1/1/2026 01:01:01.1', 'ZONE_CHANGE'],

        ['10/27/2026 21:31:07.8100  SPELL_AURA_APPLIED,Payload',
        '10/27/2026 21:31:07.8100', 'SPELL_AURA_APPLIED']
    ])('parses varying timestamp and event lengths: %s',
        (line, timestamp, eventType) => {
            const result = parseRecordHeader(line);

            expect(result).toEqual({
                timestamp,
                eventType,
                rawPayload: 'Payload'
            });
        }
    );
});