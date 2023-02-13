
export const enum Platforms {
  Windows = 1,
  Linux,
  Macintosh,
  ChromeOS,
  Web
}

let _isWeb = false;
let _isMobile = false;
let _isExt = false;
let _isIOS = false;
let _platform: Platforms | undefined = undefined;
let _userAgent: string | undefined = undefined;

// Web environment
if (typeof navigator === 'object') {
	_userAgent = navigator.userAgent;
  _platform = _userAgent.indexOf("Windows") >= 0 
    ? Platforms.Windows
    : _userAgent.indexOf("Macintosh") >= 0
      ? Platforms.Macintosh
      : _userAgent.indexOf("Linux")
        ? Platforms.Linux
        : _userAgent.indexOf("CrOS")
          ? Platforms.ChromeOS
          : Platforms.Web;
  _isIOS = _userAgent.indexOf("Macintosh") >= 0 
    || _userAgent.indexOf("iPad") >= 0 
    || _userAgent.indexOf("iPhone") >=0 
    && !!navigator.maxTouchPoints 
    && navigator.maxTouchPoints > 0;
  _isMobile = _userAgent.indexOf("Mobi") >= 0;
	_isWeb = true;
}

// Unknown environment
else {
	console.error('Unknow environment.');
}

if (typeof location === "object") {
  _isExt = ["http:", "https:"].indexOf(location.protocol) === -1;
} else {
  console.error("Unknow environment.");
}

export const isWeb = _isWeb;
export const isWebWorker = (_isWeb && typeof globalThis.importScripts === 'function');
export const isExt = _isExt;
export const isIOS = _isIOS;
export const isMobile = _isMobile;
export const platform = _platform;
export const userAgent = _userAgent;

export const isChrome = !!(userAgent && userAgent.indexOf('Chrome') >= 0);
export const isFirefox = !!(userAgent && userAgent.indexOf('Firefox') >= 0);
export const isSafari = !!(!isChrome && (userAgent && userAgent.indexOf('Safari') >= 0));
export const isEdge = !!(userAgent && userAgent.indexOf('Edg/') >= 0);
export const isAndroid = !!(userAgent && userAgent.indexOf('Android') >= 0);
