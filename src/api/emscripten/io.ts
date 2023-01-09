
export function getPrintWithTextareaElement(element?: HTMLTextAreaElement) {
  if (!element) return console.log;
  
  element.value = "";
  return function(...args: string[]) {
    let text = args.join(" ") + "\n";
    element.value += text;
    element.scrollTop = element.scrollHeight;
  }
}