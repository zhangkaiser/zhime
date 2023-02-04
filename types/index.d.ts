

module globalThis {
  jsdom: JSDOM;

  var Module: any;
  
  var imeWorker: Worker | undefined;
}

declare module "*.css" {
  const styles: any;
  export default styles;
}