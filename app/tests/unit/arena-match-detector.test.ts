import { describe, it, expect } from 'vitest';
import { detectArenaMatches } from '../../src/parser/arena-match-detector';

describe('detectArenaMatches', () => {
    it('detects a completed arena match', async () => {
        const file = new File(
            [
                '10/27/2026 21:31:00.1000  ARENA_MATCH_START,1504,42,Rated Solo Shuffle,0\n',
                '10/27/2026 21:32:00.1000  SPELL_CAST_SUCCESS,Player-123\n',
                '10/27/2026 21:35:00.1000  ARENA_MATCH_END,1\n'
            ],
            'arena-log.txt',
            { type: 'text/plain' }
        );

        const matches = await detectArenaMatches(file);

        expect(matches).toEqual([
            {
                startTimestamp: '10/27/2026 21:31:00.1000',
                endTimestamp: '10/27/2026 21:35:00.1000',
                startPayload: '1504,42,Rated Solo Shuffle,0',
                endPayload: '1',
                rounds: [
                    {
                        startTimestamp: '10/27/2026 21:31:00.1000',
                        startPayload: '1504,42,Rated Solo Shuffle,0'
                    }
                ]
            }
        ]);
    });

    it('handles two start/end pairs', async () => {
        const file = new File(
            [
                '10/27/2026 21:31:00.1000  ARENA_MATCH_START,1504,42,Rated Solo Shuffle,0\n',
                '10/27/2026 21:32:00.1000  SPELL_CAST_SUCCESS,Player-123\n',
                '10/27/2026 21:35:00.1000  ARENA_MATCH_END,1\n',
                '10/27/2026 21:40:00.1000  ARENA_MATCH_START,1504,42,Rated Solo Shuffle,1\n',
                '10/27/2026 21:45:00.1000  SPELL_CAST_SUCCESS,Player-134\n',
                '10/27/2026 21:47:00.1000  ARENA_MATCH_END,1\n'
            ],
            'arena-log.txt',
            { type: 'text/plain' }
        );

        const matches = await detectArenaMatches(file);

        expect(matches).toEqual([
            {
                startTimestamp: '10/27/2026 21:31:00.1000',
                endTimestamp: '10/27/2026 21:35:00.1000',
                startPayload: '1504,42,Rated Solo Shuffle,0',
                endPayload: '1',
                rounds: [
                    {
                        startTimestamp: '10/27/2026 21:31:00.1000',
                        startPayload: '1504,42,Rated Solo Shuffle,0'
                    }
                ]
            },
            {
                startTimestamp: '10/27/2026 21:40:00.1000',
                endTimestamp: '10/27/2026 21:47:00.1000',
                startPayload: '1504,42,Rated Solo Shuffle,1',
                endPayload: '1',
                rounds: [
                    {
                        startTimestamp: '10/27/2026 21:40:00.1000',
                        startPayload: '1504,42,Rated Solo Shuffle,1'
                    }
                ]
            }
        ]);
    });

    it('handles an end without a start', async () => {
        const file = new File(
            [
                '10/27/2026 21:32:00.1000  SPELL_CAST_SUCCESS,Player-123\n',
                '10/27/2026 21:35:00.1000  ARENA_MATCH_END,1\n'
            ],
            'arena-log.txt',
            { type: 'text/plain' }
        );

        const matches = await detectArenaMatches(file);

        expect(matches).toEqual([]);
    });

    it('handles a start without an end', async () => {
        const file = new File(
            [
                '10/27/2026 21:31:00.1000  ARENA_MATCH_START,1504,42,Rated Solo Shuffle,0\n',
                '10/27/2026 21:32:00.1000  SPELL_CAST_SUCCESS,Player-123\n'
            ],
            'arena-log.txt',
            { type: 'text/plain' }
        );

        const matches = await detectArenaMatches(file);

        expect(matches).toEqual([
            {
                endPayload: null,
                endTimestamp: null,
                startPayload: '1504,42,Rated Solo Shuffle,0',
                startTimestamp: '10/27/2026 21:31:00.1000',
                rounds: [
                    {
                        startTimestamp: '10/27/2026 21:31:00.1000',
                        startPayload: '1504,42,Rated Solo Shuffle,0'
                    }
                ]
            }
        ]);
    });

    it('groups consecutive Solo Shuffle starts before an end', async () => {
        const file = new File(
            [
                '10/27/2026 21:31:00.1000  ARENA_MATCH_START,1504,42,Rated Solo Shuffle,0\n',
                '10/27/2026 21:32:00.1000  SPELL_CAST_SUCCESS,Player-123\n',
                '10/27/2026 21:40:00.1000  ARENA_MATCH_START,1504,42,Rated Solo Shuffle,1\n',
                '10/27/2026 21:45:00.1000  SPELL_CAST_SUCCESS,Player-134\n',
                '10/27/2026 21:47:00.1000  ARENA_MATCH_END,1\n'
            ],
            'arena-log.txt',
            { type: 'text/plain' }
        );

        const matches = await detectArenaMatches(file);

        expect(matches).toEqual([
            {
                startTimestamp: '10/27/2026 21:31:00.1000',
                endTimestamp: '10/27/2026 21:47:00.1000',
                startPayload: '1504,42,Rated Solo Shuffle,0',
                endPayload: '1',
                rounds: [
                    {
                        startTimestamp: '10/27/2026 21:31:00.1000',
                        startPayload: '1504,42,Rated Solo Shuffle,0'
                    },
                    {
                        startTimestamp: '10/27/2026 21:40:00.1000',
                        startPayload: '1504,42,Rated Solo Shuffle,1'
                    }
                ]
            }
        ]);
    });

    it('returns no matches when the log contains no arena events', async () => {
        const file = new File(
            [
                '10/27/2026 21:31:00.1000  ZONE_CHANGE,1504\n',
                '10/27/2026 21:32:00.1000  SPELL_CAST_SUCCESS,Player-123\n'
            ],
            'no-arena-log.txt',
            { type: 'text/plain' }
        );

        const matches = await detectArenaMatches(file);

        expect(matches).toEqual([]);
    });

    it('groups Solo Shuffle rounds into one match', async () => {
        const file = new File(
            [
                '10/22/2026 20:35:41.7381  ARENA_MATCH_START,1911,42,Rated Solo Shuffle,0\n',
                '10/22/2026 20:36:52.1191  ARENA_MATCH_START,1911,42,Rated Solo Shuffle,0\n',
                '10/22/2026 20:44:10.1681  ARENA_MATCH_END,-1,25,1803,1806\n'
            ],
            'solo-shuffle.txt',
            { type: 'text/plain' }
        );

        const matches = await detectArenaMatches(file);

        expect(matches).toHaveLength(1);
        expect(matches[0].rounds).toHaveLength(2);
        expect(matches[0].endTimestamp)
            .toBe('10/22/2026 20:44:10.1681');
    });
});