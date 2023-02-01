
export function getTempStrArr(arr: string[]): TemplateStringsArray {
  (arr as any).raw = arr;

  return arr as any;
}