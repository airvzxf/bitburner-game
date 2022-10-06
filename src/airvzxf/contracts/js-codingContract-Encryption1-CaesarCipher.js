/**
 * Solution of the Coding Contract → Encryption I: Caesar Cipher.
 *
 * @param {[string, number]} data The text which needs to encrypt, and the left shift for the encryption.
 * @returns {string} The text encrypted.
 */
export function encryptionICaesarCipher(data) {
	const leftShift = data.pop();
	const text = data.pop().toUpperCase();

	const codeForA = 65;
	const codeForZ = 90;
	const alphabetSize = codeForZ - codeForA + 1;

	let textNew = "";
	for (let characterIndex = 0; characterIndex < text.length; characterIndex += 1) {
		const codeForLetter = text.charCodeAt(characterIndex);
		if (codeForLetter >= codeForA && codeForLetter <= codeForZ) {
			const codeShiftToLeft = (codeForLetter - codeForA - leftShift + alphabetSize) % alphabetSize + codeForA;
			textNew += String.fromCharCode(codeShiftToLeft);
		} else {
			textNew += text[characterIndex];
		}
	}

	return textNew;
}