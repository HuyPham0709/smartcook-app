// src/utils/pkiHelper.ts

/**
 * Chuyển đổi object recipe thành chuỗi string ổn định để ký
 * Đảm bảo thứ tự các key không thay đổi để chữ ký luôn khớp
 */
const prepareDataToSign = (data: any): string => {
  return JSON.stringify(data, Object.keys(data).sort());
};

export const pkiHelper = {
  // 1. Tạo cặp khóa RSA cho KOL
  generateKeyPair: async () => {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true, // Có thể xuất khóa ra định dạng string
      ["sign", "verify"]
    );
    return keyPair;
  },

  // 2. Ký dữ liệu công thức
  signRecipe: async (recipeData: any, privateKey: CryptoKey): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(prepareDataToSign(recipeData));
    
    const signature = await window.crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      privateKey,
      data
    );

    // Chuyển binary sang Base64 để lưu vào DB
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  },

  // 3. Xuất khóa sang String (để lưu vào cột PublicKey trong DB)
  exportPublicKey: async (publicKey: CryptoKey): Promise<string> => {
    const exported = await window.crypto.subtle.exportKey("spki", publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }
};