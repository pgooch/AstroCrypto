/**
 * Prepared some variables and does a very basic sanity check.
 */

var Crypto, Subtle;
if (typeof window === "undefined") {
  Crypto = globalThis.crypto;
  Subtle = Crypto.subtle;
} else {
  Crypto = window.crypto;
  Subtle = Crypto.subtle || Crypto.webkitSubtle;
}
if (!Subtle) {
  throw new Error(`Web Crypto API not supported, you're outta luck pal.`);
}

/**
 * Return a base64 string from the provided buffer array. From https://stackoverflow.com/a/68161336
 * @param {Uint8Array} arrayBuffer
 * @returns {String}
 */
function ab2b64(arrayBuffer) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
}
/**
 * Return an array from the provided buffer bae64 string. From https://stackoverflow.com/a/68161336
 * @param {String} base64string
 * @returns {Uint8Array}
 */
function b642ab(base64string) {
  return Uint8Array.from(atob(base64string), (c) => c.charCodeAt(0));
}

/**
 * Returns a initialization vector for the AES encryption
 * @returns {Uint8Array}
 */
export const getInitVect = () => {
  return Crypto.getRandomValues(new Uint8Array(12));
};
/**
 * Returns a salt to spice up encryption
 * @returns {Uint8Array}
 */
export const getSalt = () => {
  return Crypto.getRandomValues(new Uint8Array(16));
};

/**
 * Returns a key derived from provided password with the encryption usage
 * @param {string} password
 * @returns {CryptoKey}
 */
export const getEncryptionKey = async (password, salt) =>
  getEncryptionOrDecryptionKey(password, salt, ["encrypt"]);
/**
 * Returns a key derived from provided password with the decryption usage
 * @param {string} password
 * @returns {CryptoKey}
 */
export const getDecryptionKey = async (password, salt) =>
  getEncryptionOrDecryptionKey(password, salt, ["decrypt"]);

/**
 * Returns an encryptionKey derived from the provided password with the requested usages
 * @param {string} password
 * @returns {CryptoKey}
 */
const getEncryptionOrDecryptionKey = async (password, salt, usages) => {
  // Failure is not only an option, it's a probability.
  try {
    // Check that a password was even provided.
    if (password == null || password == undefined || password.trim() == "") {
      throw new Error("No password was provided");
    }

    // Turn a regular boring password and turn it into a key
    const importedKey = await Subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    const encryptionKey = await Subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 250000,
        hash: "SHA-256",
      },
      importedKey,
      { name: "AES-GCM", length: 256 },
      false,
      usages
    );

    return encryptionKey;
    // Handle those errors by simply throwing them away.
  } catch (err) {
    throw err;
  }
};

/**
 * Encrypts the provided content with the provided password and returns a base64 string for use.
 * @param {string} content
 * @param {string} password
 * @returns {string}
 */
export const encrypt = async (content, password) => {
  if (password == undefined || password.trim() == "") {
    throw new Error("No password was provided.");
  }

  // Get the bits we need to start encryption
  const salt = await getSalt();
  const encryptionKey = await getEncryptionKey(password, salt);
  const initVector = await getInitVect();

  // Encrypt the data
  const encryptedContent = new Uint8Array(
    await Subtle.encrypt(
      {
        name: "AES-GCM",
        iv: initVector,
        tagLength: 128,
      },
      encryptionKey,
      new TextEncoder().encode(content)
    )
  );

  // Return the encoded string
  return ab2b64([...salt, ...initVector, ...encryptedContent]);
};

/**
 * Decrypts a provided base64 string created by encode with the provided password.
 * @param {string} encryptedContent
 * @param {string} password
 * @returns {string}
 */
export const decrypt = async (content, password) => {
  if (password == undefined || password.trim() == "") {
    throw new Error("No password was provided.");
  }

  const encryptedData = b642ab(content);
  const salt = encryptedData.slice(0, 16);
  const InitVect = encryptedData.slice(16, 16 + 12);
  const encryptedContent = encryptedData.slice(16 + 12);

  const encryptionKey = await getDecryptionKey(password, salt);

  // Decrypt
  const decryptedContent = await Subtle.decrypt(
    {
      name: "AES-GCM",
      iv: InitVect,
      tagLength: 128,
    },
    encryptionKey,
    encryptedContent
  );

  // Return decrypted content
  return new TextDecoder().decode(decryptedContent);
};
