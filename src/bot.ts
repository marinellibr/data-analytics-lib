// Heuristics to skip analytics for automated clients (headless browsers,
// crawlers, scanners). Deliberately conservative — only well-known signals —
// so real users are never dropped. Browser-safe: returns false in any
// non-browser environment where `navigator` is absent.

const BOT_UA_PATTERN =
  /bot|crawler|spider|crawling|headless|puppeteer|playwright|phantom|slurp|bingpreview|lighthouse|ahrefs|semrush|mj12|dotbot|petalbot|gptbot|claude|ccbot|bytespider/i;

export const isBot = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  // Selenium / Puppeteer / Playwright set this flag on the automated browser.
  if (navigator.webdriver === true) {
    return true;
  }

  const ua = navigator.userAgent;
  return typeof ua === 'string' && BOT_UA_PATTERN.test(ua);
};
