import { Reflection, Types } from "../core/reflection";

export function mergeTokens(raw: string[]): string[] {
  const result: string[] = [];
  let buffer = '';
  let mode: 'none' | 'quote' | 'bracket' = 'none';
  let depth = 0;

  for (const token of raw) {
    if (mode === 'none') {
      if (token.startsWith('"')) {
        if (token.endsWith('"') && token.length > 1) {
          result.push(token.slice(1, -1));   // "Hello" on one token
        } else {
          mode = 'quote';
          buffer = token.slice(1);
        }
      } else if (token.startsWith('[')) {
        depth = [...token].filter(c => c === '[').length
              - [...token].filter(c => c === ']').length;
        if (depth === 0) {
          result.push(token);                // [1,2] on one token
        } else {
          mode = 'bracket';
          buffer = token;
        }
      } else {
        result.push(token);
      }
    } else if (mode === 'quote') {
      if (token.endsWith('"')) {
        result.push(buffer + ' ' + token.slice(0, -1));
        buffer = '';
        mode = 'none';
      } else {
        buffer += ' ' + token;
      }
    } else if (mode === 'bracket') {
      buffer += ' ' + token;
      depth += [...token].filter(c => c === '[').length;
      depth -= [...token].filter(c => c === ']').length;
      if (depth === 0) {
        result.push(buffer.trim());
        buffer = '';
        mode = 'none';
      }
    }
  }

  if (mode !== 'none') throw new Error(`Unclosed ${mode} in argument list`);
  return result;
}

function parseBracketedNumbers(raw: string): number[] {
  const inner = raw.trim().replace(/^\[|\]$/g, '');
  return inner.split(',').map(s => {
    const n = parseFloat(s.trim());
    if (isNaN(n)) throw new Error(`Expected number in bracketed list, got '${s.trim()}'`);
    return n;
  });
}

export function coerce(token: string, type: Types, propertyKey: string): unknown {
  switch (type) {
    case Types.String:
      return token;

    case Types.Int: {
      const n = parseInt(token, 10);
      if (isNaN(n)) throw new Error(`Expected int for '${propertyKey}', got '${token}'`);
      return n;
    }

    case Types.Float: {
      const n = parseFloat(token);
      if (isNaN(n)) throw new Error(`Expected float for '${propertyKey}', got '${token}'`);
      return n;
    }

    case Types.Vector2: {
      const [x, y] = parseBracketedNumbers(token);
      if (x === undefined || y === undefined)
        throw new Error(`Vector2 requires [x, y], got '${token}'`);
      return { x, y };
    }

    case Types.Vector3: {
      const [x, y, z] = parseBracketedNumbers(token);
      if (x === undefined || y === undefined || z === undefined)
        throw new Error(`Vector3 requires [x, y, z], got '${token}'`);
      return { x, y, z };
    }

    default:
      throw new Error(`Unsupported CLI type: ${type}`);
  }
}

export function parseArgs<T extends any>(cls: T, rawTokens: string[]) {
    const params = Reflection.getParams(cls);

    const tokens = mergeTokens(rawTokens);

    let cursor = 0;

    for (const [key, field] of params) {
        const token = tokens[cursor];
        if (token === undefined) {
            throw new Error(`Missing argument for ${key}`);
        }

        (cls as Record<string, unknown>)[key] = coerce(token, field.type, key);
        cursor++;
    }

    if (cursor < tokens.length) {
        throw new Error('Too many arguments');
    }

    return cls;
}