export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Copies the given text to the clipboard.
 *
 * @param {string} text - The text to be copied to the clipboard.
 * @returns {Promise<void>} - A promise that resolves when the text is successfully copied.
 * @throws {Error} - If copying fails, an error is logged to the console.
 */
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};
