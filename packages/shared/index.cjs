function canonicalize(value) {
  function canon(v) {
    if (v === null) return 'null';
    const t = typeof v;

    if (t === 'number') {
      if (!Number.isFinite(v)) throw new TypeError('Non-finite numbers are not valid JSON');
      return JSON.stringify(v);
    }
    if (t === 'string') return JSON.stringify(v);
    if (t === 'boolean') return v ? 'true' : 'false';

    if (Array.isArray(v)) {
      return '[' + v.map(canon).join(',') + ']';
    }
    if (t === 'object') {
      const keys = Object.keys(v).filter(k => v[k] !== undefined).sort();
      const parts = keys.map(k => JSON.stringify(k) + ':' + canon(v[k]));
      return '{' + parts.join(',') + '}';
    }
    throw new TypeError(`Unsupported type in canonical JSON: ${t}`);
  }
  
  return canon(value);
}

module.exports = { canonicalize };
