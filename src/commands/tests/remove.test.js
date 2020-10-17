import assert from 'assert';
import { validateArguments } from '../remove.js';

describe('Remove', () => {
    it('should throw an error if not provided at least two arguments', () => {
        try {
            validateArguments([]);
        } catch (error) {
            assert(
                error.toString() === 'Error: Expected at least two arguments.'
            );
        }
    });

    it('should throw an error if CustomerName argument is not a mention', () => {
        try {
            validateArguments(['CustomerName', 'goldAmount']);
        } catch (error) {
            assert(
                error.toString() ===
                    'Error: Expected user name in the format @Username; received "CustomerName"'
            );
        }
    });

    it('should throw an error if goldAmount argument is not an integer', () => {
        try {
            validateArguments(['<@CustomerName>', 'goldAmount']);
        } catch (error) {
            assert(
                error.toString() ===
                    'Error: Expected an integer for the gold amount; received "goldAmount"'
            );
        }
    });

    it('should throw an error if goldAmount argument is negative', () => {
        try {
            validateArguments(['<@CustomerName>', '-1']);
        } catch (error) {
            assert(
                error.toString() ===
                    "Error: Expected a positive value for the gold amount. Use $remove to decrease a user's balance."
            );
        }
    });

    it('should concatenate remaining arguments into a reason string', () => {
        const { reason } = validateArguments([
            '<@CustomerName>',
            '1',
            'test',
            'reason'
        ]);
        assert(reason === 'test reason');
    });
});
