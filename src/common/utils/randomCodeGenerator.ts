export function generateRandomCode(length: number): number {
  let result = '';

  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }

  return Number(result);
}
