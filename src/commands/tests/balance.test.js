import assert from 'assert';
import { validateArguments } from '../balance.js';

describe('Balance', () => {
    it('should throw an error if provided more than one argument', () => {
        try {
            validateArguments(['1', '2']);
        } catch (error) {
            assert(error.toString() === 'Error: Expected at most 1 argument.');
        }
    });

    it('should throw an error if CustomerName argument is not a mention', () => {
        try {
            validateArguments(['CustomerName']);
        } catch (error) {
            assert(
                error.toString() ===
                    'Error: Expected user name in the format @Username; received "CustomerName"'
            );
        }
    });
});
