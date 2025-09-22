import * as CryptoJS from "crypto-js"

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

// Validate that the secret key exists
if (!SECRET_KEY) {
  throw new Error("VITE_SECRET_KEY environment variable is not set");
}

const encryptData = (data: any): string | null => {
  try {
    // Validate input
    if (data === null || data === undefined) {
      console.error("Cannot encrypt null or undefined data");
      return null;
    }

    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
};

const decryptData = (encryptedData: any): any => {
  try {
    // Validate input
    if (!encryptedData) {
      console.error("Cannot decrypt null or undefined data");
      return null;
    }

    if (typeof encryptedData !== "string") {
      console.error("Encrypted data must be a string");
      return null;
    }

    // Perform decryption
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    
    // Check if decryption produced valid bytes
    if (!bytes || bytes.sigBytes <= 0) {
      console.error("Decryption failed - invalid encrypted data or wrong key");
      return null;
    }

    // Convert to UTF-8 string
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    // Validate that we got a non-empty string
    if (!decryptedString) {
      console.error("Decryption produced empty result");
      return null;
    }

    // Parse JSON
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

export { encryptData, decryptData };
