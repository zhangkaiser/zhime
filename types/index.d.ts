

module globalThis {
  jsdom: JSDOM
}

declare module "*.css" {
  const styles: any;
  export default styles;
}