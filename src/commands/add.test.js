import assert from 'assert';
import { verifyArguments } from './add.js';

describe('Add', () => {
    it('should throw an error if not provided exactly two arguments', () => {
        try {
            verifyArguments([]);
        } catch (error) {
            assert(error.toString() === 'Error: Expected two arguments.');
        }
    });

    it('should throw an error if goldAmount argument is not an integer', () => {
        try {
            verifyArguments(['CustomerName', 'goldAmount']);
        } catch (error) {
            assert(
                error.toString() ===
                    'Error: Expected an integer for the gold amount; received "goldAmount"'
            );
        }
    });
});
