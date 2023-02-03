

module globalThis {
  jsdom: JSDOM;
  
  var imeWorker: Worker | undefined;
}

declare module "*.css" {
  const styles: any;
  export default styles;
}