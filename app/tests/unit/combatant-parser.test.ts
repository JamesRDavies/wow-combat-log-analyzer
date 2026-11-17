import { describe, it, expect } from 'vitest';
import { parseCombatantInfo } from '../../src/parser/combatant-parser';
import type { CombatantInfoEvent } from '../../src/parser/combat-event';

describe('parseCombatantInfo', () => {
    it('extracts a valid GUID and spec ID from a COMBATANT_INFO payload', () => {
        
        const combatantInfo: CombatantInfoEvent = {
            kind: 'combatant-info',
            eventType: 'COMBATANT_INFO',
            timestamp: '10/27/2026 21:26:47.6940',
            rawPayload:
                'Player-1604-0F93A7F5,0,380,539,57484,3761,0,0,0,0,0,0,0,98,0,1182,1182,1182,0,1201,922,922,922,1031,256,[(109009,103677,1)]'
        };

        const result = parseCombatantInfo(combatantInfo);

        expect(result).toEqual({
            timestamp: '10/27/2026 21:26:47.6940',
            playerGuid: 'Player-1604-0F93A7F5',
            specId: 256,
            rawPayload: combatantInfo.rawPayload
        });

    });

    it('extracts another spec ID to verify the value is not hardcoded', () => {

        const combatantInfo: CombatantInfoEvent = {
            kind: 'combatant-info',
            eventType: 'COMBATANT_INFO',
            timestamp: '10/27/2026 21:26:47.6940',
            rawPayload:
                'Player-1615-0BC39164,0,318,746,55001,4188,0,0,0,0,0,0,0,98,0,1604,1604,1604,0,0,1700,1700,1700,2817,102,[(82198,103276,1)]'
        };

        const result = parseCombatantInfo(combatantInfo);

        expect(result).toEqual({
            timestamp: '10/27/2026 21:26:47.6940',
            playerGuid: 'Player-1615-0BC39164',
            specId: 102,
            rawPayload: combatantInfo.rawPayload
        });

    });

    it('reject a record with an invalid GUID', () => {

        const combatantInfo: CombatantInfoEvent = {
            kind: 'combatant-info',
            eventType: 'COMBATANT_INFO',
            timestamp: '10/27/2026 21:26:47.6940',
            rawPayload:
                'Player-1604-0F93A7F5-ABC!,0,380,539,57484,3761,0,0,0,0,0,0,0,98,0,1182,1182,1182,0,1201,922,922,922,1031,256,[(109009,103677,1)]'
        };

        const result = parseCombatantInfo(combatantInfo);

        expect(result).toBeNull();

    });

    it('handles a missing specialisation ID', () => {
        
        const combatantInfo: CombatantInfoEvent = {
            kind: 'combatant-info',
            eventType: 'COMBATANT_INFO',
            timestamp: '10/27/2026 21:26:47.6940',
            rawPayload:
                'Player-1604-0F93A7F5,0,380,539,57484,3761,0,0,0,0,0,0,0,98,0,1182,1182,1182,0,1201,922,922,922,1031,[(109009,103677,1)]'
        };

        const result = parseCombatantInfo(combatantInfo);

        expect(result).toEqual({
            timestamp: '10/27/2026 21:26:47.6940',
            playerGuid: 'Player-1604-0F93A7F5',
            specId: null,
            rawPayload: combatantInfo.rawPayload
        });

    });

    it('handle missing talent-section delimiter', () => {
        
        const combatantInfo: CombatantInfoEvent = {
            kind: 'combatant-info',
            eventType: 'COMBATANT_INFO',
            timestamp: '10/27/2026 21:26:47.6940',
            rawPayload:
                'Player-1604-0F93A7F5,0,380,539,57484,3761,0,0,0,0,0,0,0,98,0,1182,1182,1182,0,1201,922,922,922,1031,256(109009,103677,1)]'
        };

        const result = parseCombatantInfo(combatantInfo);

        expect(result).toBeNull();

    });

});