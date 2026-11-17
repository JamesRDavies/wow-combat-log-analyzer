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
            malformedRecords: 1
        });
    });

    it('handles an empty file', async () => {
        const file = new File([], 'empty-log.txt', { type: 'text/plain' });

        const result: InspectionResult = await inspectLog(file);

        expect(result).toEqual({
            totalRecords: 0,
            validRecords: 0,
            malformedRecords: 0
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
            malformedRecords: 3
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
            malformedRecords: 0
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
            malformedRecords: 0
        });
    });

});