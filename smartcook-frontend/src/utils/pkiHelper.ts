const prepareDataToSign = (data: any): string => {
  return JSON.stringify(data, Object.keys(data).sort());
};

export const pkiHelper = {
  generateKeyPair: async () => {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true, 
      ["sign", "verify"]
    );
    return keyPair;
  },

  signRecipe: async (recipeData: any, privateKey: CryptoKey): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(prepareDataToSign(recipeData));
    
    const signature = await window.crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      privateKey,
      data
    );

    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  },


  exportPublicKey: async (publicKey: CryptoKey): Promise<string> => {
    const exported = await window.crypto.subtle.exportKey("spki", publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }
};