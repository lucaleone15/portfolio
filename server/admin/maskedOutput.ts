/**
 * What a hidden prompt may print: the question and line breaks, never the typed text — not even
 * when readline redraws the whole line (question + what was typed so far).
 */
export function maskedOutput(question: string, write: (s: string) => void): (s: string) => void {
  return (s) => {
    if (s.startsWith(question)) write(question);
    else if (/^[\r\n]+$/.test(s)) write(s);
  };
}
