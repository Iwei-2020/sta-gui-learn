/**
 * 生成UUID
 * @returns uuid {string}
 */

export const UUID = (): string => {
  const hexDigits = "0123456789abcdef";

  let uuid = "";

  for (let i = 0; i < 32; i++) {
    const randomDigit = Math.floor(Math.random() * 16);
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += "-";
    }
    uuid += hexDigits[randomDigit];
  }

  return uuid;
};
