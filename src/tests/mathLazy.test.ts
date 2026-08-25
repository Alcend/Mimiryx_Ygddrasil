import { describe, it, expect } from 'vitest';
import { containsMath, loadMathPlugins } from '../utils/lazyMath';

describe('Lazy Math Detection & Dynamic Loader', () => {
  it('should detect inline and block LaTeX math patterns', () => {
    expect(containsMath('The equation is $E = mc^2$')).toBe(true);
    expect(containsMath('$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$')).toBe(true);
    expect(containsMath('Regular prose without any math formatting.')).toBe(false);
    expect(containsMath('Cost is $50 and $100')).toBe(true);
    expect(containsMath('')).toBe(false);
  });

  it('should dynamically import rehypeKatex on demand', async () => {
    const plugins = await loadMathPlugins();
    expect(plugins).toBeDefined();
    expect(plugins.rehypeKatex).toBeDefined();
  });
});
