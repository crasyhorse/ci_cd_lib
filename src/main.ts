/**
 * And array containing the country code and the length of the IBAN in the respective country.
 * 
 * @type {string[]}
 */
 const charsArr = [
    { key: 'AT', len: 20 },
    { key: 'BE', len: 16 },
    { key: 'CZ', len: 24 },
    { key: 'DE', len: 22 },
    { key: 'DK', len: 18 },
    { key: 'FR', len: 27 }
];

/**
 * Contains the lengths of the IBANs. The country code serves as key.
 * 
 * @example
 * chars.get("DE")
 * // returns 22
 * 
 * @type {Map<String, number>}
 */
const chars: Map<String, number> = new Map(
    charsArr.map((item) => {
        return [item.key, item.len];
    }),
);

/**
 * Validates an IBAN as described in [ISO 7064]{@link https://en.wikipedia.org/wiki/ISO_7064}.
 * 
 * @param {string} iban The IBAN to be validated.
 * 
 * @returns {boolean} Returns true if the IBAN is valid. 
 */
export function validate(iban: string): boolean {
    if (!checkLength(iban)) {
        return false;
    }

    const rearrangedIban: string = rearrangeIban(iban);
    const convertedIban = convertToInteger(rearrangedIban);
    const segments: string[] = createSegments(convertedIban);
    
    return calculate(segments) === 1;
}

/**
 * Computes the remainder.
 * 
 * Have a look at [Modulo_operation_on_IBAN]{@link https://en.wikipedia.org/wiki/International_Bank_Account_Number#Modulo_operation_on_IBAN} to see how this is done.
 * 
 * @param {string[]} segments The segmented IBAN
 * 
 * @returns {number}
 */
function calculate(segments: string[]): number {
    let n: number = 0;
    
    segments.forEach((segment) => {
        if (segment.length === 9) {
            n = Number(segment) % 97
        } else {
            segment = `${n}${segment}`;
            n = Number(segment) % 97;
        }
    });

    return n;
}

/**
 * Checks the IBAN for correct length. 
 * 
 * @param {string} iban The IBAN to check
 * 
 * @returns {boolean} Returns true if the IBAN has the correct length
 */
function checkLength(iban: string): boolean {
    const countryCode = iban.substring(0, 2);

    return chars.has(countryCode) && chars.get(countryCode) === iban.length;
}

/**
 * Converts all characters in the IBAN to numbers.
 * 
 * The coding is as follows: A = 10, B = 11, C = 12, ...
 * 
 * @example
 * const iban = "790200760027913168DE22"
 * convertToInteger(iban)
 * //returns 790200760027913168131422
 * // DE is converted into 1314
 * 
 * @param {string} iban
 * 
 * @returns {string} The integer representation of the IBAN 
 */
function convertToInteger(iban: string): string {
    const _iban: string = iban.toUpperCase();

    let convertedIban: string = "";
    for (const c of _iban) {
        if (c.match(/[0-9]/)) {
            convertedIban += c;
        }

        if (c.match(/[A-Z]/)) {
            convertedIban += String(Number(c.charCodeAt(0)) - 55);
        }
    }

    return convertedIban;
}

/**
 * Splits the IBAN into segments.
 * 
 * We need to do this because JavaScript is not able to handle big integers, which means we cannot just calculate "iban % 97". Therefore, we have to follow [Modulo_operation_on_IBAN]{@link https://en.wikipedia.org/wiki/International_Bank_Account_Number#Modulo_operation_on_IBAN}.
 *  
 * The first segment has always a length of 9 digits. The subsequent segments have a length of 7 digits. The last segment contains the remaining digits.
 * 
 * @example
 * const iban = "790200760027913168131422";
 * createSegments(iban);
 * //returns ["790200760", "0279131", "68131422"]
 * 
 * @param {string} iban The integere representation of the IBAN
 *  
 * @returns {string[]} The segmented IBAN 
 */
function createSegments(iban: string): string[] {
    let _iban: string = iban;
    const segments: string[] = [];
    let index: number = 0;

    segments[index++] = _iban.substring(0, 9);
    _iban = _iban.substring(9, _iban.length);

    while (_iban.length >= 9) {
        segments[index++] = _iban.substring(0, 7);
        _iban = _iban.substring(7, _iban.length);
    }

    segments[index++] = _iban

    return segments;
}

/**
 * Moves the four digits from the beginning of the IBAN to its end.
 * 
 * @example
 * const iban = "DE22790200760027913168";
 * rearrangeIban(iban);
 * // returns 790200760027913168DE22
 * 
 * @param {string} iban - The IBAN to be rearranged
 * 
 * @returns {string} The rearranged IBAN
 */
function rearrangeIban(iban: string): string {
    return `${iban.substring(4, iban.length)}${iban.substring(0, 4)}`;
}