import type { Pluggable } from 'unified';

export interface MathPlugins {
  rehypeKatex: Pluggable;
  katex?: any;
}

let cachedPlugins: MathPlugins | null = null;

export async function loadMathPlugins(): Promise<MathPlugins> {
  if (cachedPlugins) {
    return cachedPlugins;
  }
  const [{ default: rehypeKatex }, katexModule] = await Promise.all([
    import('rehype-katex'),
    import('katex')
  ]);
  cachedPlugins = { rehypeKatex: rehypeKatex as unknown as Pluggable, katex: katexModule };
  return cachedPlugins;
}

const MATH_DETECTOR = /(^|[^$])\$\$[\s\S]+?\$\$|(^|[^$])\$(?!\$)[\s\S]+?\$(?!\$)/;

export function containsMath(text: string): boolean {
  if (!text) return false;
  return MATH_DETECTOR.test(text);
}
