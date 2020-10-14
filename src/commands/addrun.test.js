import assert from 'assert';
import { verifyArguments } from './addrun.js';

describe('AddRun', () => {
    it('should throw an error if not provided at least 5 arguments', () => {
        try {
            verifyArguments([]);
        } catch (error) {
            assert(
                error.toString() === 'Error: Expected at least 5 arguments.'
            );
        }
    });

    it('should throw an error if goldAmount argument is not an integer', () => {
        try {
            verifyArguments([
                'CustomerName',
                'goldAmount',
                'realm-faction',
                'type',
                'boosterName1'
            ]);
        } catch (error) {
            assert(
                error.toString() ===
                    'Error: Expected an integer for the gold amount; received "goldAmount"'
            );
        }
    });

    it('should throw an error if realm/faction are not formatted correctly', () => {
        try {
            verifyArguments([
                'CustomerName',
                '100',
                'realmfaction',
                'type',
                'boosterName1'
            ]);
        } catch (error) {
            assert(
                error.toString() ===
                    'Error: Expected realm in format <Realm Name>-<Faction>; received "realmfaction"'
            );
        }
    });

    it('should throw an error if faction is not "A" or "H"', () => {
        try {
            verifyArguments([
                'CustomerName',
                '100',
                'realm-faction',
                'type',
                'boosterName1'
            ]);
        } catch (error) {
            assert(
                error.toString() ===
                    'Error: Expected faction part of realm argument to be "A" or "H"; received "faction"'
            );
        }
    });

    it('should throw an error if run type is not "M+", "Raid", or "PvP"', () => {
        try {
            verifyArguments([
                'CustomerName',
                '100',
                'realm-A',
                'type',
                'boosterName1'
            ]);
        } catch (error) {
            assert(
                error.toString() ===
                    'Error: Expected run type to be one of "M+", "Raid", or "PvP"; received "type"'
            );
        }
    });

    it("should throw an error if run type is 'M+' and didn't receive 4 booster names", () => {
        try {
            verifyArguments([
                'CustomerName',
                '100',
                'realm-A',
                'm+',
                'boosterName1'
            ]);
        } catch (error) {
            assert(
                error.toString() ===
                    'Error: Expected 4 booster name arguments; received 1'
            );
        }
    });

    it("should throw an error if run type is 'Raid' and didn't receive 1 booster name", () => {
        try {
            verifyArguments([
                'CustomerName',
                '100',
                'realm-A',
                'raid',
                'boosterName1',
                'boosterName2'
            ]);
        } catch (error) {
            assert(
                error.toString() ===
                    'Error: Expected 1 booster name argument; received 2'
            );
        }
    });

    it("should throw an error if run type is 'PvP' and didn't receive 1-2 booster names", () => {
        try {
            verifyArguments([
                'CustomerName',
                '100',
                'realm-A',
                'pvp',
                'boosterName1',
                'boosterName2',
                'boosterName3'
            ]);
        } catch (error) {
            assert(
                error.toString() ===
                    'Error: Expected 1 or 2 booster name arguments; received 3'
            );
        }
    });
});
