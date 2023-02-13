
export function changeGlobalConsole(tag: string) {
  let tagFormat = [`%c[${tag}]`, "color: gray;"];
  console = {
    ...console,
    log: console.log.bind(null, ...tagFormat),
    info: console.info.bind(null, ...tagFormat),
    error: console.error.bind(null, ...tagFormat),
    warn: console.warn.bind(null, ...tagFormat),
  }
}