import { describe, it, expect } from 'vitest';
import {
    inspectLog,
    type InspectionResult
} from '../../src/parser/log-inspector';

describe('inspectLog', () => {

    it('counts valid and malformed combat log records', async () => {
        const file = new File(
            [
                '10/16/2026 10:05:26.4361  ZONE_CHANGE,1504,"Silvermoon City",0\n',
                'NOT A REAL LINE\n',
                '10/16/2026 10:05:26.5341  SPELL_AURA_APPLIED,Player-123,Example\n'
            ],
            'test-log.txt',
            { type: 'text/plain' }
        );

        const result: InspectionResult = await inspectLog(file);

        expect(result).toEqual({
            totalRecords: 3,
            validRecords: 2,
            malformedRecords: 1,
            matches: []
        });
    });

    it('handles an empty file', async () => {
        const file = new File([], 'empty-log.txt', { type: 'text/plain' });

        const result: InspectionResult = await inspectLog(file);

        expect(result).toEqual({
            totalRecords: 0,
            validRecords: 0,
            malformedRecords: 0,
            matches: []
        });
    });

    it('handles a file with only malformed records', async () => {
        const file = new File(
            [
                'MALFORMED LINE 1\n',
                'MALFORMED LINE 2\n',
                'MALFORMED LINE 3\n'
            ],
            'malformed-log.txt',
            { type: 'text/plain' }
        );

        const result: InspectionResult = await inspectLog(file);

        expect(result).toEqual({
            totalRecords: 3,
            validRecords: 0,
            malformedRecords: 3,
            matches: []
        });
    });

    it('handles a file with only valid records', async () => {
        const file = new File(
            [
                '10/16/2026 10:05:26.4361  ZONE_CHANGE,1504,"Silvermoon City",0\n',
                '10/16/2026 10:05:26.5341  SPELL_AURA_APPLIED,Player-123,Example\n'
            ],
            'valid-log.txt',
            { type: 'text/plain' }
        );

        const result: InspectionResult = await inspectLog(file);

        expect(result).toEqual({
            totalRecords: 2,
            validRecords: 2,
            malformedRecords: 0,
            matches: []
        });
    });

    it('handles a file with empty lines', async () => {
        const file = new File(
            [
                '10/16/2026 10:05:26.4361  ZONE_CHANGE,1504,"Silvermoon City",0\n',
                '\n',
                '10/16/2026 10:05:26.5341  SPELL_AURA_APPLIED,Player-123,Example\n',
                '\n'
            ],
            'log-with-empty-lines.txt',
            { type: 'text/plain' }
        );

        const result: InspectionResult = await inspectLog(file);

        expect(result).toEqual({
            totalRecords: 2,
            validRecords: 2,
            malformedRecords: 0,
            matches: []
        });
    });

    it('handles adding a valid match', async () => {
        const file = new File(
            [
                '10/27/2026 21:31:00.1000  ARENA_MATCH_START,1504,42,Rated Solo Shuffle,0\n',
                '10/27/2026 21:32:00.1000  SPELL_CAST_SUCCESS,Player-123\n',
                '10/27/2026 21:35:00.1000  ARENA_MATCH_END,1\n'
            ],
            'arena-log.txt',
            { type: 'text/plain' }
        );

        const result: InspectionResult = await inspectLog(file);

        expect(result).toEqual({
            totalRecords: 3,
            validRecords: 3,
            malformedRecords: 0,
            matches: [{
                endPayload: "1",
                endTimestamp: "10/27/2026 21:35:00.1000",
                startPayload: "1504,42,Rated Solo Shuffle,0",
                startTimestamp: "10/27/2026 21:31:00.1000",
                rounds: [
                    {
                        startTimestamp: '10/27/2026 21:31:00.1000',
                        startPayload: '1504,42,Rated Solo Shuffle,0'
                    }
                ]
                
            },]
        });
    });

});