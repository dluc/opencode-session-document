function Ln(e) {
  const t = Object.values(e.methods).flatMap((n) => Object.keys(n.errors ?? {})).find((n) => n.startsWith("rpc."));
  if (t)
    throw new Error(`RPC error names starting with "rpc." are reserved: ${t}`);
  return e;
}
function Ce(e) {
  const t = Object.values(e).filter((r) => typeof r == "number");
  return Object.entries(e).filter(([r, o]) => t.indexOf(+r) === -1).map(([r, o]) => o);
}
function st(e, t = "|") {
  return e.map((n) => Wt(n)).join(t);
}
function De(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
class Jn {
  constructor(t) {
    this._getter = t, this._value = void 0;
  }
  get value() {
    const t = this._getter;
    return t !== void 0 && (this._value = t(), this._getter = void 0), this._value;
  }
}
function Be(e) {
  return new Jn(e);
}
function Kn(e) {
  return e == null;
}
function Ve(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function Bn(e, t) {
  const n = e / t, r = Math.round(n), o = 4 * Number.EPSILON * Math.max(Math.abs(n), 1);
  return Math.abs(n - r) < o ? 0 : n - r;
}
function K(e, t, n) {
  Object.defineProperty(e, t, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function Lt(e) {
  const t = Object.getOwnPropertyDescriptor(e, "shape");
  return t?.get ? t.get.raw : t?.value;
}
function D(e) {
  return Lt(e._zod.def) ?? e._zod.def.shape;
}
function Jt(e, t, n) {
  Object.defineProperty(e, t, {
    get() {
      const r = n();
      return K(this, t, r), r;
    },
    enumerable: !0,
    configurable: !0
  });
}
function Kt(e, t, n) {
  t in e ? K(e, t, n) : e[t] = n;
}
function J(e, t, n, r) {
  const o = D(t);
  for (const i of n) {
    const s = Object.getOwnPropertyDescriptor(o, i);
    s.enumerable && (s.get ? Jt(e, i, () => {
      const c = t._zod.def.shape[i];
      return r ? r(c, i) : c;
    }) : Kt(e, i, r ? r(s.value, i) : s.value));
  }
}
function Vn(e, t) {
  for (const n of Reflect.ownKeys(t)) {
    const r = Object.getOwnPropertyDescriptor(t, n);
    r.enumerable && (r.get ? Jt(e, n, () => t[n]) : Kt(e, n, r.value));
  }
}
function E(...e) {
  const t = {};
  for (const n of e) {
    const r = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, r);
  }
  return Object.defineProperties({}, t);
}
function Wn(e) {
  return JSON.stringify(e);
}
function Gn(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const Bt = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function _e(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const qn = /* @__PURE__ */ Be(() => {
  if (R.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare"))
    return !1;
  try {
    const e = Function;
    return new e(""), !0;
  } catch {
    return !1;
  }
});
function se(e) {
  if (_e(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function")
    return !0;
  const n = t.prototype;
  return !(_e(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function Vt(e) {
  return se(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
const Yn = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function $e(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function U(e, t, n) {
  const r = new e._zod.constr(t ?? e._zod.def);
  return (!t || n?.parent) && (r._zod.parent = e), r;
}
function _(e) {
  const t = e;
  if (!t)
    return {};
  if (typeof t == "string")
    return { error: () => t };
  if (t?.message !== void 0) {
    if (t?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return delete t.message, typeof t.error == "string" ? { ...t, error: () => t.error } : t;
}
function Wt(e) {
  return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function Xn(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
const Gt = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, Hn = {
  int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function Qn(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const i = {};
  return J(i, e, Oe(e, t)), U(e, E(n, { shape: i, checks: [] }));
}
function Oe(e, t) {
  const n = D(e), r = [];
  for (const o of Reflect.ownKeys(t)) {
    if (!Object.getOwnPropertyDescriptor(n, o)?.enumerable)
      throw new Error(`Unrecognized key: "${String(o)}"`);
    t[o] && r.push(o);
  }
  return r;
}
function er(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const i = new Set(Oe(e, t)), s = {};
  return J(s, e, Reflect.ownKeys(D(e)).filter((c) => !i.has(c))), U(e, E(n, { shape: s, checks: [] }));
}
function tr(e, t) {
  if (!se(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const o = D(e);
    for (const i of Reflect.ownKeys(t))
      if (Object.getOwnPropertyDescriptor(o, i) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  return U(e, E(e._zod.def, { shape: qt(e, t) }));
}
function qt(e, t) {
  const n = {};
  return J(n, e, Reflect.ownKeys(D(e))), Vn(n, t), n;
}
function nr(e, t) {
  if (!se(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  return U(e, E(e._zod.def, { shape: qt(e, t) }));
}
function rr(e, t) {
  if (!t?._zod?.def)
    throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
  if (e._zod.def.checks?.length)
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  const n = {};
  J(n, e, Reflect.ownKeys(D(e))), J(n, t, Reflect.ownKeys(D(t)));
  const r = E(e._zod.def, {
    shape: n,
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: t._zod.def.checks ?? []
  });
  return U(e, r);
}
function ct(e, t, n, r = "partial") {
  const i = t._zod.def.checks;
  if (i && i.length > 0)
    throw new Error(`.${r}() cannot be used on object schemas containing refinements`);
  const c = n ? new Set(Oe(t, n)) : void 0, u = {};
  return J(u, t, Reflect.ownKeys(D(t)), e && ((a, l) => c && !c.has(l) ? a : new e({ type: "optional", innerType: a }))), U(t, E(t._zod.def, { shape: u, checks: [] }));
}
function or(e, t, n) {
  const r = n ? new Set(Oe(t, n)) : void 0, o = {};
  return J(o, t, Reflect.ownKeys(D(t)), (i, s) => (
    // overwrite with non-optional
    r && !r.has(s) ? i : new e({ type: "nonoptional", innerType: i })
  )), U(t, E(t._zod.def, { shape: o }));
}
function C(e, t = 0) {
  if (e.aborted === !0)
    return !0;
  for (let n = t; n < e.issues.length; n++)
    if (e.issues[n]?.continue !== !0)
      return !0;
  return !1;
}
function ir(e, t = 0) {
  if (e.aborted === !0)
    return !0;
  for (let n = t; n < e.issues.length; n++)
    if (e.issues[n]?.continue === !1)
      return !0;
  return !1;
}
function Yt(e, t) {
  return t.map((n) => {
    var r;
    return (r = n).path ?? (r.path = []), n.path.unshift(e), n;
  });
}
function Q(e) {
  return typeof e == "string" ? e : e?.message;
}
function ut(e) {
  const t = [];
  for (const n of e ?? []) {
    const r = n._zod.def;
    if (!/_(length|size)$|_equals$/.test(r.check))
      break;
    const o = r.maximum ?? r.length ?? r.size;
    o >= 0 && t.push([o, n]);
  }
  return t;
}
function xe(e, t, n) {
  var r;
  for (let o = t; o < e.length; o++)
    (r = e[o]).schema ?? (r.schema = n);
}
function G(e, t, n) {
  var r;
  const o = e.inst?._zod?.traits;
  o?.has("$ZodType") && (o.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
  const i = e.schema !== e.inst ? e.schema?._zod.def?.error : void 0, s = e.message ? e.message : Q(e.inst?._zod.def?.error?.(e)) ?? Q(i?.(e)) ?? Q(t?.error?.(e)) ?? Q(n.customError?.(e)) ?? Q(n.localeError?.(e)) ?? "Invalid input", c = {};
  for (const u of Object.keys(e))
    u === "inst" || u === "schema" || u === "continue" || u === "input" || u === "__proto__" || (c[u] = e[u]);
  return c.path ?? (c.path = []), c.message = s, t?.reportInput && (c.input = e.input), c;
}
const sr = /[\uD800-\uDBFF]/;
function We(e) {
  const t = e.length;
  if (!sr.test(e))
    return t;
  let n = t;
  for (let r = 0; r < t - 1; r++)
    (e.charCodeAt(r) & 64512) === 55296 && (e.charCodeAt(r + 1) & 64512) === 56320 && (n--, r++);
  return n;
}
function Ge(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function cr(e) {
  const t = typeof e;
  switch (t) {
    case "number":
      return Number.isNaN(e) ? "nan" : "number";
    case "object": {
      if (e === null)
        return "null";
      if (Array.isArray(e))
        return "array";
      const n = e;
      if (n && Object.getPrototypeOf(n) !== Object.prototype && "constructor" in n && n.constructor)
        return n.constructor.name;
    }
  }
  return t;
}
function ce(...e) {
  const [t, n, r] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: r
  } : { ...t };
}
function ur(e, t) {
  for (const n in t) {
    const r = Object.getOwnPropertyDescriptor(t, n);
    r.get ? Object.defineProperty(e, n, { ...r, enumerable: !1 }) : ar(e, n, r.value);
  }
}
function F(e, t, n, r = !0) {
  return Object.defineProperty(e, t, { configurable: !0, writable: !0, enumerable: r, value: n }), n;
}
function Xt(e, t, n) {
  return F(e, t, n, !1);
}
function Ht(e, t) {
  for (const n in e) {
    const r = e[n];
    Object.defineProperty(t, n, {
      configurable: !0,
      enumerable: !0,
      get() {
        return F(this, n, r(this));
      },
      set(o) {
        F(this, n, o);
      }
    });
  }
  return t;
}
function ar(e, t, n) {
  Object.defineProperty(e, t, {
    configurable: !0,
    get() {
      return this == null ? n : F(this, t, n.bind(this));
    },
    set(r) {
      F(this, t, r);
    }
  });
}
function fr(e, t) {
  const n = Object.getPrototypeOf(e);
  return t in n ? void 0 : n;
}
let Ee, x = !1;
const lr = {
  configurable: !0,
  get() {
    x = !0;
  }
};
function b(e, t, n) {
  const r = Object.getPrototypeOf(e._zod);
  if (t in r && Ee !== e._zod) {
    Ee = void 0;
    return;
  }
  Ee = e._zod, Object.defineProperty(r, t, {
    configurable: !0,
    get() {
      Object.defineProperty(this, t, lr);
      const o = x;
      x = !1;
      try {
        const i = n(this);
        return x ? delete this[t] : Object.defineProperty(this, t, { configurable: !0, writable: !0, value: i }), x = x || o, i;
      } catch (i) {
        throw delete this[t], x = x || o, i;
      }
    },
    set(o) {
      Object.defineProperty(this, t, { configurable: !0, writable: !0, value: o });
    }
  });
}
function dr(e, t, n, r) {
  const o = fr(e, t);
  o && Object.defineProperty(o, t, {
    configurable: !0,
    get() {
      const i = { configurable: !0, writable: !0, enumerable: r, value: void 0 };
      return Object.defineProperty(this, t, i), i.value = n(this), Object.defineProperty(this, t, i), i.value;
    },
    set(i) {
      Object.defineProperty(this, t, { configurable: !0, writable: !0, enumerable: r, value: i });
    }
  });
}
const pr = "~constantCatch";
function hr(e) {
  const t = () => e;
  return t[pr] = !0, t;
}
var at;
const Ae = { value: void 0, enumerable: !1 };
let ft = "captureStackTrace" in Error ? Error : null;
function mr(e) {
  const t = ft;
  if (t) {
    const n = t.stackTraceLimit;
    if (typeof n == "number") {
      try {
        t.stackTraceLimit = 0;
      } catch {
        return ft = null, new e();
      }
      try {
        return new e();
      } finally {
        t.stackTraceLimit = n;
      }
    }
  }
  return new e();
}
function f(e, t, n, r) {
  const o = {};
  function i(p) {
    this.def = p, this.constr = d, this.traits = /* @__PURE__ */ new Set();
  }
  i.prototype = o;
  const s = n, c = s && /* @__PURE__ */ new WeakSet();
  function u(p, h) {
    if (p._zod) {
      if (p._zod.traits.has(e))
        return;
    } else {
      Ae.value = new i(h);
      try {
        Object.defineProperty(p, "_zod", Ae);
      } finally {
        Ae.value = void 0;
      }
    }
    if (p._zod.traits.add(e), t(p, h), c) {
      const v = Object.getPrototypeOf(p), g = p._zod.constr.prototype;
      let y = v;
      for (; y && y !== g; )
        y = Object.getPrototypeOf(y);
      const T = y ?? v;
      c.has(T) || (c.add(T), ur(T, s));
    }
    const m = d.prototype;
    for (const v in m)
      Object.prototype.hasOwnProperty.call(m, v) && (v in p || (p[v] = m[v].bind(p)));
  }
  const a = r?.Parent ?? Object;
  class l extends a {
  }
  Object.defineProperty(l, "name", { value: e });
  function d(p) {
    const h = r?.Parent ? mr(l) : this;
    u(h, p);
    const m = h._zod.deferred;
    if (m) {
      for (const g of m)
        g();
      h._zod.deferred = void 0;
    }
    const v = globalThis.__zod_globalConfig?.postProcessor;
    return v && v(h), h;
  }
  return Object.defineProperty(d, "init", { value: u }), Object.defineProperty(d, Symbol.hasInstance, {
    value: (p) => r?.Parent && p instanceof r.Parent ? !0 : p?._zod?.traits?.has(e)
  }), Object.defineProperty(d, "name", { value: e }), d;
}
class L extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class Qt extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
(at = globalThis).__zod_globalConfig ?? (at.__zod_globalConfig = {});
const R = globalThis.__zod_globalConfig;
function M(e) {
  return e && Object.assign(R, e), R;
}
function _r() {
  const e = this._zod;
  return e.message ?? (e.message = JSON.stringify(e.def, De, 2)), e.message;
}
function gr(e) {
  this._zod.message = e;
}
const vr = {
  get: _r,
  set: gr,
  enumerable: !0,
  configurable: !0
}, Te = { value: void 0, enumerable: !1 }, lt = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), br = (e, t) => {
  e.name = "$ZodError", Te.value = t, Object.defineProperty(e, "issues", Te), Te.value = void 0, Object.defineProperty(e, "message", vr);
  const n = Object.getPrototypeOf(e);
  lt.has(n) || (lt.add(n), Object.defineProperty(n, "toString", {
    configurable: !0,
    enumerable: !1,
    get() {
      const r = () => this.message;
      return Object.defineProperty(this, "toString", { value: r, configurable: !0, writable: !0 }), r;
    },
    set(r) {
      Object.defineProperty(this, "toString", { value: r, configurable: !0, writable: !0 });
    }
  }));
}, yr = f("$ZodError", br);
function wr(e, t, n) {
  return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, { value: n(), writable: !0, enumerable: !0, configurable: !0 }) : e[t] = n()), e[t];
}
function zr(e, t = (n) => n.message) {
  const n = {}, r = [];
  for (const o of e.issues)
    o.path.length > 0 ? wr(n, o.path[0], () => []).push(t(o)) : r.push(t(o));
  return { formErrors: r, fieldErrors: n };
}
function kr(e, t = (n) => n.message) {
  const n = { _errors: [] }, r = (o, i = []) => {
    for (const s of o.issues)
      if (s.code === "invalid_union" && s.errors.length)
        s.errors.map((c) => r({ issues: c }, [...i, ...s.path]));
      else if (s.code === "invalid_key")
        r({ issues: s.issues }, [...i, ...s.path]);
      else if (s.code === "invalid_element")
        r({ issues: s.issues }, [...i, ...s.path]);
      else {
        const c = [...i, ...s.path];
        if (c.length === 0)
          n._errors.push(t(s));
        else {
          let u = n, a = 0;
          for (; a < c.length; ) {
            const l = c[a], d = a === c.length - 1;
            if (l === "_errors") {
              d && u._errors.push(t(s)), a++;
              continue;
            }
            Object.prototype.hasOwnProperty.call(u, l) || Object.defineProperty(u, l, {
              value: { _errors: [] },
              enumerable: !0,
              writable: !0,
              configurable: !0
            });
            const p = u[l];
            d && p._errors.push(t(s)), u = p, a++;
          }
        }
      }
  };
  return r(e), n;
}
function Ze(e, t) {
  return { callee: t?.callee ?? e, Err: t?.Err };
}
const qe = (e) => {
  const t = (n, r, o, i) => {
    const s = o ? { ...o, async: !1 } : { async: !1 }, c = n._zod.run({ value: r, issues: [] }, s);
    if (c instanceof Promise)
      throw new L();
    if (c.issues.length) {
      const u = new (i?.Err ?? e)(c.issues.map((a) => G(a, s, M())));
      throw Bt(u, i?.callee ?? t), u;
    }
    return c.value;
  };
  return t;
}, Ye = (e) => {
  const t = async (n, r, o, i) => {
    const s = o ? { ...o, async: !0 } : { async: !0 };
    let c = n._zod.run({ value: r, issues: [] }, s);
    if (c instanceof Promise && (c = await c), c.issues.length) {
      const u = new (i?.Err ?? e)(c.issues.map((a) => G(a, s, M())));
      throw Bt(u, i?.callee ?? t), u;
    }
    return c.value;
  };
  return t;
}, Xe = (e) => (t, n, r) => {
  const o = r ? { ...r, async: !1 } : { async: !1 }, i = t._zod.run({ value: n, issues: [] }, o);
  if (i instanceof Promise)
    throw new L();
  return i.issues.length ? en(e, i.issues, o) : { success: !0, data: i.value };
};
function en(e, t, n) {
  let r;
  return {
    success: !1,
    get error() {
      return r || (r = new e(t.map((o) => G(o, n, M()))), t = void 0, n = void 0), r;
    },
    set error(o) {
      r = o, t = void 0, n = void 0;
    }
  };
}
const He = (e) => async (t, n, r) => {
  const o = r ? { ...r, async: !0 } : { async: !0 };
  let i = t._zod.run({ value: n, issues: [] }, o);
  return i instanceof Promise && (i = await i), i.issues.length ? en(e, i.issues, o) : { success: !0, data: i.value };
}, $r = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), Or = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), Zr = ((e, t, n) => {
  const r = e._zod.bag.validator;
  if (r !== void 0) {
    if (r(t) !== $r)
      return !0;
    if (r.definite === !0 && n === void 0)
      return !1;
  }
  return Sr(e, t, n);
});
function Sr(e, t, n) {
  const r = n ? { ...n, async: !1, abortEarly: !0 } : { async: !1, abortEarly: !0 }, o = e._zod.bag.fallbackRun;
  let i;
  if (o ? (r[Or] = !0, i = o({ value: t, issues: [] }, r)) : i = e._zod.run({ value: t, issues: [] }, r), i instanceof Promise)
    throw new L();
  return i.issues.length === 0;
}
const Pr = async (e, t, n) => {
  const r = n ? { ...n, async: !0, abortEarly: !0 } : { async: !0, abortEarly: !0 };
  let o = e._zod.run({ value: t, issues: [] }, r);
  return o instanceof Promise && (o = await o), o.issues.length === 0;
}, Ir = (e) => {
  const t = qe(e), n = (r, o, i, s) => {
    const c = i ? { ...i, direction: "backward" } : { direction: "backward" };
    return t(r, o, c, Ze(n, s));
  };
  return n;
}, Er = (e) => {
  const t = qe(e), n = (r, o, i, s) => t(r, o, i, Ze(n, s));
  return n;
}, Ar = (e) => {
  const t = Ye(e), n = async (r, o, i, s) => {
    const c = i ? { ...i, direction: "backward" } : { direction: "backward" };
    return await t(r, o, c, Ze(n, s));
  };
  return n;
}, Tr = (e) => {
  const t = Ye(e), n = async (r, o, i, s) => await t(r, o, i, Ze(n, s));
  return n;
}, jr = (e) => (t, n, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return Xe(e)(t, n, o);
}, Nr = (e) => (t, n, r) => Xe(e)(t, n, r), Rr = (e) => async (t, n, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return He(e)(t, n, o);
}, Cr = (e) => async (t, n, r) => He(e)(t, n, r), Dr = /^[cC][0-9a-z]{6,}$/, xr = /^[0-9a-z]+$/, Fr = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, Ur = /^[0-9a-vA-V]{20}$/, Mr = /^[A-Za-z0-9]{27}$/, Lr = /^[a-zA-Z0-9_-]{21}$/;
function Jr(e) {
  return new RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
const Kr = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, Br = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, dt = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, Vr = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, Wr = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function Gr() {
  return new RegExp(Wr, "u");
}
const qr = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Yr = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, Xr = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, Hr = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Qr = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, eo = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, to = /^https?$/, no = /^\+[1-9]\d{6,14}$/, tn = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function ro(e) {
  return new RegExp(`^${e}$`);
}
const oo = /* @__PURE__ */ ro(tn);
function Fe(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function io(e) {
  return new RegExp(`^${Fe(e)}$`);
}
function so(e) {
  const t = ["Z"];
  e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const n = `${Fe({ precision: e.precision, seconds: !0 })}(?:${t.join("|")})`, r = e.local ? `${n}|${Fe({ precision: e.precision })}` : n;
  return new RegExp(`^${tn}T(?:${r})$`);
}
const co = /^[\s\S]{0,}$/, uo = /^-?\d+(?:\.\d+)?$/, ao = /^(?:true|false)$/i, fo = /^null$/i, lo = /^[^A-Z]*$/, po = /^[^a-z]*$/, I = /* @__PURE__ */ f("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), Qe = (e) => {
  const t = e.value;
  return !Kn(t) && t.length !== void 0;
}, ge = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, nn = /* @__PURE__ */ f("$ZodCheckLessThan", (e, t) => {
  I.init(e, t);
  const n = ge[typeof t.value];
  e._zod.check = (r) => {
    (t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
      origin: ge[typeof r.value] ?? n,
      code: "too_big",
      maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), rn = /* @__PURE__ */ f("$ZodCheckGreaterThan", (e, t) => {
  I.init(e, t);
  const n = ge[typeof t.value];
  e._zod.check = (r) => {
    (t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
      origin: ge[typeof r.value] ?? n,
      code: "too_small",
      minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), ho = /* @__PURE__ */ f("$ZodCheckMultipleOf", (e, t) => {
  I.init(e, t), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? (
      // `value % 0n` throws, and nothing is a multiple of zero — the number branch already fails this way via NaN
      t.value !== BigInt(0) && n.value % t.value === BigInt(0)
    ) : Bn(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), mo = /* @__PURE__ */ f("$ZodCheckNumberFormat", (e, t) => {
  I.init(e, t), t.format = t.format || "float64";
  const n = t.format?.includes("int"), r = n ? "int" : "number", [o, i] = Gt[t.format];
  e._zod.check = (s) => {
    const c = s.value;
    if (n) {
      if (!Number.isInteger(c)) {
        s.issues.push({
          expected: r,
          format: t.format,
          code: "invalid_type",
          continue: !1,
          input: c,
          inst: e
        });
        return;
      }
      if (!Number.isSafeInteger(c)) {
        c > 0 ? s.issues.push({
          input: c,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          inclusive: !0,
          continue: !t.abort
        }) : s.issues.push({
          input: c,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          inclusive: !0,
          continue: !t.abort
        });
        return;
      }
    }
    c < o && s.issues.push({
      origin: "number",
      input: c,
      code: "too_small",
      minimum: o,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    }), c > i && s.issues.push({
      origin: "number",
      input: c,
      code: "too_big",
      maximum: i,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    });
  };
}), _o = /* @__PURE__ */ f("$ZodCheckMaxLength", (e, t) => {
  var n;
  I.init(e, t), (n = e._zod.def).when ?? (n.when = Qe), e._zod.check = (r) => {
    const o = r.value, i = o.length;
    if ((typeof o == "string" && i > t.maximum ? We(o) : i) <= t.maximum)
      return;
    const c = Ge(o);
    r.issues.push({
      origin: c,
      code: "too_big",
      maximum: t.maximum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), go = /* @__PURE__ */ f("$ZodCheckMinLength", (e, t) => {
  var n;
  I.init(e, t), (n = e._zod.def).when ?? (n.when = Qe), e._zod.check = (r) => {
    const o = r.value, i = o.length;
    if ((typeof o == "string" && i >= t.minimum && i < t.minimum * 2 ? We(o) : i) >= t.minimum)
      return;
    const c = Ge(o);
    r.issues.push({
      origin: c,
      code: "too_small",
      minimum: t.minimum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), vo = /* @__PURE__ */ f("$ZodCheckLengthEquals", (e, t) => {
  var n;
  I.init(e, t), (n = e._zod.def).when ?? (n.when = Qe), e._zod.check = (r) => {
    const o = r.value, i = o.length, s = typeof o == "string" && i >= t.length && i <= t.length * 2 ? We(o) : i;
    if (s === t.length)
      return;
    const c = Ge(o), u = s > t.length;
    r.issues.push({
      origin: c,
      ...u ? { code: "too_big", maximum: t.length } : { code: "too_small", minimum: t.length },
      inclusive: !0,
      exact: !0,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Se = /* @__PURE__ */ f("$ZodCheckStringFormat", (e, t) => {
  var n, r;
  I.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (o) => {
    t.pattern.lastIndex = 0, !t.pattern.test(o.value) && o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: t.format,
      input: o.value,
      ...t.pattern ? { pattern: t.pattern.toString() } : {},
      inst: e,
      continue: !t.abort
    });
  }) : (r = e._zod).check ?? (r.check = () => {
  });
}), bo = /* @__PURE__ */ f("$ZodCheckRegex", (e, t) => {
  Se.init(e, t), e._zod.check = (n) => {
    t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: n.value,
      pattern: t.pattern.toString(),
      inst: e,
      continue: !t.abort
    });
  };
}), yo = /* @__PURE__ */ f("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = lo), Se.init(e, t);
}), wo = /* @__PURE__ */ f("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = po), Se.init(e, t);
}), zo = /* @__PURE__ */ f("$ZodCheckIncludes", (e, t) => {
  I.init(e, t);
  const n = $e(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position},}${n}` : n);
  t.pattern = r, e._zod.check = (o) => {
    o.value.includes(t.includes, t.position) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: t.includes,
      input: o.value,
      inst: e,
      continue: !t.abort
    });
  };
}), ko = /* @__PURE__ */ f("$ZodCheckStartsWith", (e, t) => {
  I.init(e, t);
  const n = new RegExp(`^${$e(t.prefix)}.*`);
  t.pattern ?? (t.pattern = n), e._zod.check = (r) => {
    r.value.startsWith(t.prefix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: t.prefix,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), $o = /* @__PURE__ */ f("$ZodCheckEndsWith", (e, t) => {
  I.init(e, t);
  const n = new RegExp(`.*${$e(t.suffix)}$`);
  t.pattern ?? (t.pattern = n), e._zod.check = (r) => {
    r.value.endsWith(t.suffix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: t.suffix,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Oo = /* @__PURE__ */ f("$ZodCheckOverwrite", (e, t) => {
  I.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class Zo {
  constructor(t = [], n = {}) {
    this.content = [], this.indent = 0, this.args = t, this.closed = n;
  }
  // the compiler catches a child's throw and keeps writing into this doc, so the indent has to unwind with it
  indented(t) {
    this.indent += 1;
    try {
      t(this);
    } finally {
      this.indent -= 1;
    }
  }
  write(t) {
    if (typeof t == "function") {
      t(this, { execution: "sync" }), t(this, { execution: "async" });
      return;
    }
    const r = t.split(`
`).filter((s) => s), o = Math.min(...r.map((s) => s.length - s.trimStart().length)), i = r.map((s) => s.slice(o)).map((s) => " ".repeat(this.indent * 2) + s);
    for (const s of i)
      this.content.push(s);
  }
  compile() {
    const t = Function, n = this?.content ?? [""];
    return new t(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {
${n.join(`
`)}
};`)(...Object.values(this.closed));
  }
}
const So = {
  major: 4,
  minor: 6,
  patch: 7
}, $ = /* @__PURE__ */ f("$ZodType", (e, t) => {
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = So;
  const r = e._zod.def.checks, o = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
  for (const i of o)
    for (const s of i._zod.onattach)
      s(e);
  if (o.length === 0)
    (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const i = (c, u, a) => {
      if (c.memo)
        return c;
      let l = C(c), d;
      for (const p of u) {
        if (p._zod.def.when) {
          if (ir(c) || !p._zod.def.when(c))
            continue;
        } else if (l)
          continue;
        const h = c.issues.length, m = p._zod.check(c);
        if (m instanceof Promise && a?.async === !1)
          throw new L();
        if (d || m instanceof Promise)
          d = (d ?? Promise.resolve()).then(async () => {
            await m, c.issues.length !== h && (xe(c.issues, h, e), l || (l = C(c, h)));
          });
        else {
          if (c.issues.length === h)
            continue;
          xe(c.issues, h, e), l || (l = C(c, h));
        }
      }
      return d ? d.then(() => c) : c;
    }, s = (c, u, a) => {
      if (C(c))
        return c.aborted = !0, c;
      const l = i(u, o, a);
      if (l instanceof Promise) {
        if (a.async === !1)
          throw new L();
        return l.then((d) => e._zod.parse(d, a));
      }
      return e._zod.parse(l, a);
    };
    e._zod.run = (c, u) => {
      if (u.skipChecks)
        return e._zod.parse(c, u);
      if (u.direction === "backward") {
        const l = e._zod.parse({ value: c.value, issues: [] }, { ...u, skipChecks: !0 });
        return l instanceof Promise ? l.then((d) => s(d, c, u)) : s(l, c, u);
      }
      const a = e._zod.parse(c, u);
      if (a instanceof Promise) {
        if (u.async === !1)
          throw new L();
        return a.then((l) => i(l, o, u));
      }
      return i(a, o, u);
    };
  }
}, {
  // Wrappers extend this by installing a richer factory over it; reading it eagerly would defeat the laziness.
  get "~standard"() {
    return Xt(this, "~standard", sn(this));
  },
  set "~standard"(e) {
    F(this, "~standard", e);
  }
}), on = (e, t) => e.issues.length ? { issues: e.issues.map((n) => G(n, t, M())) } : { value: e.value };
async function Po(e, t) {
  const n = { async: !0 };
  return on(await e._zod.run({ value: t, issues: [] }, n), n);
}
function sn(e) {
  return {
    validate: (t) => {
      const n = { async: !1 };
      try {
        const r = e._zod.run({ value: t, issues: [] }, n);
        if (!(r instanceof Promise))
          return on(r, n);
      } catch {
      }
      return Po(e, t);
    },
    vendor: "zod",
    version: 1
  };
}
const et = /* @__PURE__ */ f("$ZodString", (e, t) => {
  $.init(e, t), e._zod.pattern = t.pattern ?? co, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = String(n.value);
      } catch {
      }
    return typeof n.value == "string" || n.issues.push({
      expected: "string",
      code: "invalid_type",
      input: n.value,
      inst: e
    }), n;
  };
}), z = /* @__PURE__ */ f("$ZodStringFormat", (e, t) => {
  Se.init(e, t), et.init(e, t);
}), Io = /* @__PURE__ */ f("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = Br), z.init(e, t);
}), Eo = /* @__PURE__ */ f("$ZodUUID", (e, t) => {
  if (t.version) {
    const r = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[t.version];
    if (r === void 0)
      throw new Error(`Invalid UUID version: "${t.version}"`);
    t.pattern ?? (t.pattern = dt(r));
  } else
    t.pattern ?? (t.pattern = dt());
  z.init(e, t);
}), Ao = /* @__PURE__ */ f("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = Vr), z.init(e, t);
}), cn = 1, ve = 2;
function un(e) {
  try {
    return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
  } catch {
    return !1;
  }
}
function To(e, t) {
  return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? un(e) || ve : jo(e, t);
}
function jo(e, t) {
  if (!t.normalize && t.protocol?.source === to.source && !/^https?:\/\//i.test(e))
    return cn;
  try {
    if (typeof URL < "u") {
      const n = URL;
      if (typeof n.parse == "function")
        return n.parse(e) ?? ve;
    }
    return new URL(e);
  } catch {
    return ve;
  }
}
const No = /[\t\n\r]/g;
function pt(e) {
  return e.replace(No, "");
}
function Ro(e, t) {
  return t.lastIndex = 0, t.test(e.hostname);
}
function Co(e, t) {
  return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
const Do = /* @__PURE__ */ f("$ZodURL", (e, t) => {
  z.init(e, t), e._zod.check = (n) => {
    try {
      const r = n.value.trim(), o = To(r, t);
      if (o === cn) {
        n.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid URL format",
          input: n.value,
          inst: e,
          continue: !t.abort
        });
        return;
      }
      if (o === ve) {
        n.issues.push({
          code: "invalid_format",
          format: "url",
          input: n.value,
          inst: e,
          continue: !t.abort
        });
        return;
      }
      if (o === !0) {
        n.value = pt(r);
        return;
      }
      t.hostname && !Ro(o, t.hostname) && n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: t.hostname.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      }), t.protocol && !Co(o, t.protocol) && n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: t.protocol.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      }), n.value = t.normalize ? o.href : pt(r);
      return;
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "url",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), xo = /* @__PURE__ */ f("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = Gr()), z.init(e, t);
}), Fo = /* @__PURE__ */ f("$ZodNanoID", (e, t) => {
  if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1))
    throw new Error(`Invalid nanoid length: ${t.length}`);
  t.pattern ?? (t.pattern = t.length === void 0 ? Lr : Jr(t.length)), z.init(e, t);
}), Uo = /* @__PURE__ */ f("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = Dr), z.init(e, t);
}), Mo = /* @__PURE__ */ f("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = xr), z.init(e, t);
}), Lo = /* @__PURE__ */ f("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = Fr), z.init(e, t);
}), Jo = /* @__PURE__ */ f("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = Ur), z.init(e, t);
}), Ko = /* @__PURE__ */ f("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = Mr), z.init(e, t);
}), Bo = /* @__PURE__ */ f("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = so(t)), z.init(e, t);
}), Vo = /* @__PURE__ */ f("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = oo), z.init(e, t);
}), Wo = /* @__PURE__ */ f("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = io(t)), z.init(e, t);
}), Go = /* @__PURE__ */ f("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = Kr), z.init(e, t);
}), qo = /* @__PURE__ */ f("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = qr), z.init(e, t);
}), Yo = /^[0-9a-fA-F:.]+$/;
function an(e) {
  return Yo.test(e) ? un(`http://[${e}]`) : !1;
}
const Xo = /* @__PURE__ */ f("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = Yr), z.init(e, t), e._zod.check = (n) => {
    an(n.value) || n.issues.push({
      code: "invalid_format",
      format: "ipv6",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ho = /* @__PURE__ */ f("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = Xr), z.init(e, t);
});
function Qo(e) {
  const t = e.split("/");
  if (t.length !== 2)
    return !1;
  const [n, r] = t;
  if (!r)
    return !1;
  const o = Number(r);
  return `${o}` !== r || o < 0 || o > 128 ? !1 : an(n);
}
const ei = /* @__PURE__ */ f("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = Hr), z.init(e, t), e._zod.check = (n) => {
    Qo(n.value) || n.issues.push({
      code: "invalid_format",
      format: "cidrv6",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function fn(e) {
  if (e === "")
    return !0;
  if (/\s/.test(e) || e.length % 4 !== 0)
    return !1;
  try {
    return atob(e), !0;
  } catch {
    return !1;
  }
}
const ln = /^[0-9a-zA-Z+/]*={0,2}$/, ti = /* @__PURE__ */ f("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = ln), z.init(e, t), e._zod.check = (n) => {
    fn(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), tt = /^[A-Za-z0-9_-]*$/;
function ni(e) {
  if (!tt.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return fn(n);
}
const ri = /* @__PURE__ */ f("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = tt), z.init(e, t), e._zod.check = (n) => {
    ni(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), oi = /* @__PURE__ */ f("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = no), z.init(e, t);
});
function ii(e, t = null) {
  try {
    const n = e.split(".");
    if (n.length !== 3)
      return !1;
    const [r] = n;
    if (!r)
      return !1;
    const o = JSON.parse(atob(r));
    return !("typ" in o && o?.typ !== "JWT" || !o.alg || t && (!("alg" in o) || o.alg !== t));
  } catch {
    return !1;
  }
}
const si = /* @__PURE__ */ f("$ZodJWT", (e, t) => {
  z.init(e, t), e._zod.check = (n) => {
    ii(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), dn = /* @__PURE__ */ f("$ZodNumber", (e, t) => {
  $.init(e, t), e._zod.pattern = uo, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = Number(n.value);
      } catch {
      }
    const o = n.value;
    if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o))
      return n;
    const i = typeof o == "number" ? Number.isNaN(o) ? "NaN" : Number.isFinite(o) ? void 0 : String(o) : void 0;
    return n.issues.push({
      expected: "number",
      code: "invalid_type",
      input: o,
      inst: e,
      ...i ? { received: i } : {}
    }), n;
  };
}), ci = /* @__PURE__ */ f("$ZodNumberFormat", (e, t) => {
  mo.init(e, t), dn.init(e, t);
}), ui = /* @__PURE__ */ f("$ZodBoolean", (e, t) => {
  $.init(e, t), e._zod.pattern = ao, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = !!n.value;
      } catch {
      }
    const o = n.value;
    return typeof o == "boolean" || n.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: o,
      inst: e
    }), n;
  };
}), ai = /* @__PURE__ */ f("$ZodNull", (e, t) => {
  $.init(e, t), e._zod.pattern = fo, e._zod.values = /* @__PURE__ */ new Set([null]), e._zod.parse = (n, r) => {
    const o = n.value;
    return o === null || n.issues.push({
      expected: "null",
      code: "invalid_type",
      input: o,
      inst: e
    }), n;
  };
}), fi = /* @__PURE__ */ f("$ZodUnknown", (e, t) => {
  $.init(e, t), e._zod.parse = (n) => n;
}), li = /* @__PURE__ */ f("$ZodNever", (e, t) => {
  $.init(e, t), e._zod.parse = (n, r) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function di(e, t) {
  const n = ut(e._zod.def.checks);
  if (!n.length)
    return;
  const r = Math.min(...n.map((i) => i[0])), o = e._zod.parse;
  e._zod.parse = (i, s) => {
    const c = t(i.value);
    if (c > r && !s?.skipChecks && s?.direction !== "backward") {
      for (const [u, a] of ut(e._zod.def.checks))
        if (c > u && a._zod.def.when(i)) {
          const l = i.issues.length;
          return a._zod.check(i), i.issues[l].continue = !1, xe(i.issues, l, e), i;
        }
    }
    return o(i, s);
  };
}
const pi = (e) => Array.isArray(e) ? e.length : -1;
function ht(e, t, n) {
  e.issues.length && t.issues.push(...Yt(n, e.issues)), t.value[n] = e.value;
}
const hi = /* @__PURE__ */ f("$ZodArray", (e, t) => {
  $.init(e, t);
  const n = R.memoizer;
  n?.attach(e), e._zod.parse = (r, o) => {
    const i = r.value;
    if (!Array.isArray(i))
      return r.issues.push({
        expected: "array",
        code: "invalid_type",
        input: i,
        inst: e
      }), r;
    r.value = n ? n.alloc(e, r, Array(i.length), o) : Array(i.length);
    const s = [], c = o?.abortEarly;
    for (let u = 0; u < i.length; u++) {
      const a = i[u], l = t.element._zod.run({
        value: a,
        issues: []
      }, o);
      if (l instanceof Promise)
        s.push(l.then((d) => ht(d, r, u)));
      else if (ht(l, r, u), c && l.issues.length !== 0 && C(l))
        break;
    }
    return s.length ? Promise.all(s).then(() => r) : r;
  }, di(e, pi);
});
function be(e, t, n, r, o, i) {
  const s = n in r, c = i === "optional";
  if (!(!s && c && o === "optional")) {
    if (e.issues.length) {
      if (o !== void 0 && c && !s)
        return;
      t.issues.push(...Yt(n, e.issues));
    }
    if (!s && o === void 0) {
      e.issues.length || t.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: void 0,
        path: [n]
      });
      return;
    }
    e.value === void 0 ? (s || o === "defaulted" && !c) && (t.value[n] = void 0) : t.value[n] = e.value;
  }
}
const mi = [];
function pn(e) {
  const t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : mi, o = r.length ? [...t, ...r] : t;
  for (const s of o)
    if (!e.shape?.[s]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${String(s)}": expected a Zod schema`);
  const i = Xn(e.shape);
  return {
    ...e,
    allKeys: o,
    symbolKeys: r,
    // string-only: handleCatchall matches it against `for...in`, which never yields a symbol
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(i)
  };
}
function hn(e, t, n, r, o, i, s) {
  const c = [], u = o.keySet, a = o.catchall._zod, l = a.def.type, d = a.optin, p = a.optout;
  let h = 0;
  for (const m in t) {
    if (s && n.issues.length !== h) {
      if (C(n, h))
        break;
      h = n.issues.length;
    }
    if (u.has(m))
      continue;
    if (m === "__proto__") {
      l === "never" && c.push(m);
      continue;
    }
    if (l === "never") {
      c.push(m);
      continue;
    }
    const v = a.run({ value: t[m], issues: [] }, r);
    v instanceof Promise ? e.push(v.then((g) => be(g, n, m, t, d, p))) : be(v, n, m, t, d, p);
  }
  return c.length && n.issues.push({
    code: "unrecognized_keys",
    keys: c,
    input: t,
    inst: i,
    // Describes the shape of the input, not the validity of the parsed value, so it never aborts. The parse still fails; the schema's own checks just get to run first, and an enclosing intersection can reconcile the key against a sibling operand.
    continue: !0
  }), e.length ? Promise.all(e).then(() => n) : n;
}
const _i = /* @__PURE__ */ f("$ZodObject", (e, t) => {
  $.init(e, t);
  const n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
  if (r) {
    const a = () => {
      const l = { ...r };
      return Object.defineProperty(t, "shape", { value: l }), a.raw = l, l;
    };
    a.raw = r, Object.defineProperty(t, "shape", { get: a });
  }
  const o = Be(() => pn(t));
  b(e, "propValues", (a) => {
    const l = a.def.shape, d = {};
    for (const p in l) {
      const h = l[p]._zod;
      if (h.values) {
        Object.prototype.hasOwnProperty.call(d, p) || K(d, p, /* @__PURE__ */ new Set());
        for (const m of h.values)
          d[p].add(m);
        h.optin !== void 0 && d[p].add(void 0);
      }
    }
    return d;
  });
  const i = _e, s = t.catchall;
  let c;
  const u = R.memoizer;
  u?.attach(e), e._zod.parse = (a, l) => {
    c ?? (c = o.value);
    const d = a.value;
    if (!i(d))
      return a.issues.push({
        expected: "object",
        code: "invalid_type",
        input: d,
        inst: e
      }), a;
    a.value = u ? u.alloc(e, a, {}, l) : {};
    const p = [], h = c.shape, m = l?.abortEarly;
    let v = a.issues.length;
    for (const g of c.allKeys) {
      if (m && a.issues.length !== v) {
        if (C(a, v))
          break;
        v = a.issues.length;
      }
      if (g === "__proto__")
        continue;
      const y = h[g], T = y._zod.optin, X = y._zod.optout, H = y._zod.run({ value: d[g], issues: [] }, l);
      H instanceof Promise ? p.push(H.then((Z) => be(Z, a, g, d, T, X))) : be(H, a, g, d, T, X);
    }
    return s ? hn(p, d, a, l, o.value, e, m === !0) : p.length ? Promise.all(p).then(() => a) : a;
  };
}), gi = /* @__PURE__ */ f("$ZodObjectJIT", (e, t) => {
  _i.init(e, t);
  const n = e._zod.parse, r = Be(() => pn(t)), o = R.memoizer, i = (h) => {
    const m = r.value, v = m.symbolKeys, g = new Zo(["payload", "ctx"], { shape: h, inst: e, memo: o, syms: v }), y = (Z) => `shape[${Z}]._zod.run({ value: input[${Z}], issues: [] }, ctx)`, T = (Z, w) => `
          let ${Z}_ab = false;
          for (let i = 0; i < ${Z}.issues.length; i++) {
            const iss = ${Z}.issues[i];
            iss.path = iss.path ? [${w}, ...iss.path] : [${w}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${Z}_ab = true;
          }
          if (${Z}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
    g.write("const input = payload.value;");
    const X = /* @__PURE__ */ Object.create(null);
    let H = 0;
    for (const Z of m.allKeys)
      X[Z] = `key_${H++}`;
    g.write(o ? "const newResult = memo.alloc(inst, payload, {}, ctx);" : "const newResult = {};");
    for (const Z of m.allKeys) {
      if (Z === "__proto__")
        continue;
      const w = X[Z], j = typeof Z == "symbol" ? `syms[${v.indexOf(Z)}]` : Wn(Z), Pe = `${j} in input`, ot = h[Z], Ie = ot?._zod?.optin, it = Ie !== void 0, Un = ot?._zod?.optout === "optional";
      if (g.write(`const ${w} = ${y(j)};`), it && Un) {
        const Mn = Ie === "optional" ? `${w}_present` : `${w}.value !== undefined || ${w}_present`;
        g.write(`
        const ${w}_present = ${Pe};
        if (!${w}.issues.length || ${w}_present) {
          if (${w}.issues.length) {${T(w, j)}
          }

          if (${Mn}) {
            newResult[${j}] = ${w}.value;
          }
        }

      `);
      } else it ? (g.write(`
        if (${w}.issues.length) {${T(w, j)}
        }
      `), Ie === "defaulted" ? g.write(`newResult[${j}] = ${w}.value;`) : g.write(`
        if (${w}.value !== undefined || ${Pe}) {
          newResult[${j}] = ${w}.value;
        }
      `)) : g.write(`
        const ${w}_present = ${Pe};
        if (${w}.issues.length) {${T(w, j)}
        }
        if (!${w}_present && !${w}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${j}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${w}_present) {
          newResult[${j}] = ${w}.value;
        }

      `);
    }
    return g.write("payload.value = newResult;"), g.write("return payload;"), g.compile();
  };
  let s;
  const c = _e, u = !R.jitless, l = u && qn.value, d = t.catchall;
  let p;
  e._zod.parse = (h, m) => {
    p ?? (p = r.value);
    const v = h.value;
    return c(v) ? u && l && m?.async === !1 && m.jitless !== !0 ? (s || (s = i(t.shape)), h = s(h, m), d ? hn([], v, h, m, p, e, m?.abortEarly === !0) : h) : n(h, m) : (h.issues.push({
      expected: "object",
      code: "invalid_type",
      input: v,
      inst: e
    }), h);
  };
});
function mt(e, t, n, r) {
  for (const i of e)
    if (i.issues.length === 0)
      return t.value = i.value, t;
  const o = e.filter((i) => !C(i));
  return o.length === 1 ? (t.value = o[0].value, o[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((i) => i.issues.map((s) => G(s, r, M())))
  }), t);
}
const vi = /* @__PURE__ */ f("$ZodUnion", (e, t) => {
  $.init(e, t), b(e, "optin", (r) => r.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : r.def.options.some((o) => o._zod.optin !== void 0) ? "optional" : void 0), b(e, "optout", (r) => r.def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0), b(e, "values", (r) => {
    if (r.def.options.every((o) => o._zod.values))
      return new Set(r.def.options.flatMap((o) => Array.from(o._zod.values)));
  }), b(e, "pattern", (r) => {
    if (r.def.options.every((o) => o._zod.pattern)) {
      const o = r.def.options.map((i) => i._zod.pattern);
      return new RegExp(`^(${o.map((i) => Ve(i.source)).join("|")})$`);
    }
  });
  const n = t.options.length === 1 ? t.options[0]._zod.run : null;
  e._zod.parse = (r, o) => {
    if (n)
      return n(r, o);
    let i = !1;
    const s = [];
    for (const c of t.options) {
      const u = c._zod.run({
        value: r.value,
        issues: []
      }, o);
      if (u instanceof Promise)
        s.push(u), i = !0;
      else {
        if (u.issues.length === 0)
          return u;
        s.push(u);
      }
    }
    return i ? Promise.all(s).then((c) => mt(c, r, e, o)) : mt(s, r, e, o);
  };
}), bi = /* @__PURE__ */ f("$ZodIntersection", (e, t) => {
  $.init(e, t), e._zod.parse = (n, r) => {
    const o = n.value, i = t.left._zod.run({ value: o, issues: [] }, r), s = t.right._zod.run({ value: o, issues: [] }, r);
    return i instanceof Promise || s instanceof Promise ? Promise.all([i, s]).then(([u, a]) => _t(n, u, a)) : _t(n, i, s);
  };
});
function Ue(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (se(e) && se(t)) {
    const n = Object.keys(t), r = Object.keys(e).filter((i) => n.indexOf(i) !== -1), o = { ...e, ...t };
    Object.prototype.hasOwnProperty.call(o, "__proto__") && delete o.__proto__;
    for (const i of r) {
      if (i === "__proto__")
        continue;
      const s = Ue(e[i], t[i]);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [i, ...s.mergeErrorPath]
        };
      o[i] = s.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length)
      return { valid: !1, mergeErrorPath: [] };
    const n = [];
    for (let r = 0; r < e.length; r++) {
      const o = e[r], i = t[r], s = Ue(o, i);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [r, ...s.mergeErrorPath]
        };
      n.push(s.data);
    }
    return { valid: !0, data: n };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function _t(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  let o;
  const i = /* @__PURE__ */ new Map(), s = (a, l) => {
    let d;
    if (a.code === "unrecognized_keys" && !a.path?.length)
      o ?? (o = a), d = a.keys;
    else if (a.code === "invalid_key" && a.origin === "record" && a.path?.length === 1) {
      const p = String(a.path[0]);
      i.has(p) || i.set(p, a), d = [p];
    } else
      return !1;
    for (const p of d)
      r.has(p) || r.set(p, {}), r.get(p)[l] = !0;
    return !0;
  };
  for (const a of t.issues)
    s(a, "l") || e.issues.push(a);
  for (const a of n.issues)
    s(a, "r") || e.issues.push(a);
  const c = [...r].filter(([, a]) => a.l && a.r).map(([a]) => a);
  if (c.length) {
    const a = o ? c.filter((l) => o.keys.includes(l)) : [];
    a.length && e.issues.push({ ...o, keys: a });
    for (const l of c)
      !a.includes(l) && i.has(l) && e.issues.push(i.get(l));
  }
  const u = Ue(t.value, n.value);
  if (!u.valid) {
    if (C(e))
      return e;
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(u.mergeErrorPath)}`);
  }
  return e.value = u.data, e;
}
const yi = /* @__PURE__ */ f("$ZodEnum", (e, t) => {
  $.init(e, t);
  const n = Ce(t.entries), r = new Set(n);
  e._zod.values = r, b(e, "pattern", (o) => {
    const i = Ce(o.def.entries).filter((s) => Yn.has(typeof s));
    return new RegExp(i.length ? `^(${i.map((s) => $e(s.toString())).join("|")})$` : "^[^\\s\\S]$");
  }), e._zod.parse = (o, i) => {
    const s = o.value;
    return r.has(s) || o.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: e
    }), o;
  };
}), wi = /* @__PURE__ */ f("$ZodTransform", (e, t) => {
  $.init(e, t), e._zod.optin = "optional", R.memoizer?.guard(e), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new Qt(e.constructor.name);
    const o = t.transform(n.value, n);
    if (r.async)
      return (o instanceof Promise ? o : Promise.resolve(o)).then((s) => (n.value = s, n));
    if (o instanceof Promise)
      throw new L();
    return n.value = o, n;
  };
});
function gt(e, t) {
  return e.value = t.issues.length ? void 0 : t.value, e;
}
const mn = /* @__PURE__ */ f("$ZodOptional", (e, t) => {
  $.init(e, t), b(e, "optin", (n) => n.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", b(e, "values", (n) => {
    const r = n.def.innerType._zod.values;
    return r ? /* @__PURE__ */ new Set([...r, void 0]) : void 0;
  }), b(e, "pattern", (n) => {
    const r = n.def.innerType._zod.pattern;
    return r ? new RegExp(`^(${Ve(r.source)})?$`) : void 0;
  }), e._zod.parse = (n, r) => {
    if (n.value === void 0) {
      if (t.innerType._zod.optin !== "defaulted")
        return n;
      const o = t.innerType._zod.run({ value: n.value, issues: [] }, r);
      return o instanceof Promise ? o.then((i) => gt(n, i)) : gt(n, o);
    }
    return t.innerType._zod.run(n, r);
  };
}), zi = /* @__PURE__ */ f("$ZodExactOptional", (e, t) => {
  mn.init(e, t), b(e, "values", (n) => n.def.innerType._zod.values), b(e, "pattern", (n) => n.def.innerType._zod.pattern), e._zod.parse = (n, r) => t.innerType._zod.run(n, r);
}), ki = /* @__PURE__ */ f("$ZodNullable", (e, t) => {
  $.init(e, t), b(e, "optin", (n) => n.def.innerType._zod.optin), b(e, "optout", (n) => n.def.innerType._zod.optout), b(e, "pattern", (n) => {
    const r = n.def.innerType._zod.pattern;
    return r ? new RegExp(`^(${Ve(r.source)}|null)$`) : void 0;
  }), b(e, "values", (n) => n.def.innerType._zod.values ? /* @__PURE__ */ new Set([...n.def.innerType._zod.values, null]) : void 0), e._zod.parse = (n, r) => n.value === null ? n : t.innerType._zod.run(n, r);
}), $i = /* @__PURE__ */ f("$ZodDefault", (e, t) => {
  $.init(e, t), e._zod.optin = "defaulted", b(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => vt(i, t)) : vt(o, t);
  };
});
function vt(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const Oi = /* @__PURE__ */ f("$ZodPrefault", (e, t) => {
  $.init(e, t), e._zod.optin = "defaulted", b(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => (r.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, r));
}), Zi = /* @__PURE__ */ f("$ZodNonOptional", (e, t) => {
  $.init(e, t), b(e, "values", (n) => {
    const r = n.def.innerType._zod.values;
    return r ? new Set([...r].filter((o) => o !== void 0)) : void 0;
  }), e._zod.parse = (n, r) => {
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => bt(i, e)) : bt(o, e);
  };
});
function bt(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
function yt(e, t, n, r) {
  return t.issues.length ? (e.value = n.catchValue({
    ...t,
    value: e.value,
    error: {
      issues: t.issues.map((o) => G(o, r, M()))
    },
    input: e.value
  }), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
const Si = /* @__PURE__ */ f("$ZodCatch", (e, t) => {
  $.init(e, t), b(e, "optin", (n) => n.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), b(e, "optout", (n) => n.def.innerType._zod.optout), b(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run({ value: n.value, issues: [] }, r);
    return o instanceof Promise ? o.then((i) => yt(n, i, t, r)) : yt(n, o, t, r);
  };
}), Pi = /* @__PURE__ */ f("$ZodPipe", (e, t) => {
  $.init(e, t), b(e, "values", (n) => n.def.in._zod.values), b(e, "optin", (n) => n.def.in._zod.optin), b(e, "optout", (n) => n.def.out._zod.optout), b(e, "propValues", (n) => n.def.in._zod.propValues), e._zod.parse = (n, r) => {
    if (r.direction === "backward") {
      const i = t.out._zod.run(n, r);
      return i instanceof Promise ? i.then((s) => ue(s, t.in, r)) : ue(i, t.in, r);
    }
    const o = t.in._zod.run(n, r);
    return o instanceof Promise ? o.then((i) => ue(i, t.out, r)) : ue(o, t.out, r);
  };
});
function ue(e, t, n) {
  return e.issues.some((r) => r.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues }, n);
}
const Ii = /* @__PURE__ */ f("$ZodReadonly", (e, t) => {
  $.init(e, t), b(e, "propValues", (n) => n.def.innerType._zod.propValues), b(e, "values", (n) => n.def.innerType._zod.values), b(e, "optin", (n) => n.def.innerType?._zod?.optin), b(e, "optout", (n) => n.def.innerType?._zod?.optout), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then(wt) : wt(o);
  };
});
function wt(e) {
  return e.memo || (e.value = Object.freeze(e.value)), e;
}
const Ei = /* @__PURE__ */ f("$ZodCustom", (e, t) => {
  I.init(e, t), $.init(e, t), e._zod.parse = (n, r) => n, e._zod.check = (n) => {
    const r = n.value, o = t.fn(r);
    if (o instanceof Promise)
      return o.then((i) => zt(i, n, r, e));
    zt(o, n, r, e);
  };
});
function zt(e, t, n, r) {
  if (!e) {
    const o = {
      code: "custom",
      input: n,
      inst: r,
      // incorporates params.error into issue reporting
      path: [...r._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !r._zod.def.abort
      // params: inst._zod.def.params,
    };
    r._zod.def.params && (o.params = r._zod.def.params), t.issues.push(ce(o));
  }
}
class Ai extends Error {
  constructor() {
    super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
  }
}
const Me = "~memo", kt = [];
function _n(e) {
  return e !== null && typeof e == "object";
}
function je(e) {
  return e.map((t) => t.path ? { ...t, path: t.path.slice() } : { ...t });
}
const gn = /* @__PURE__ */ new WeakMap(), te = 0, he = 1, re = 2;
function me(e, t, n) {
  const r = gn.get(e);
  if (r !== void 0)
    return r ? re : te;
  if (t.has(e))
    return re;
  t.add(e);
  let o = te;
  const i = (l) => {
    if (o !== re && l?._zod) {
      const d = me(l, t);
      d > o && (o = d);
    }
  }, s = (l, d) => {
    let p = te;
    for (const h of Reflect.ownKeys(l)) {
      const m = Object.getOwnPropertyDescriptor(l, h);
      if (!m.enumerable)
        continue;
      const v = m.get ? he : m.value?._zod ? me(m.value, t) : te;
      v > p && (p = v);
    }
    return p;
  }, c = (l) => {
    l > o && (o = l);
  }, u = e._zod.def;
  switch (u.type) {
    case "object": {
      const l = Lt(u);
      c(l ? s(l) : he), i(u.catchall);
      break;
    }
    case "array":
      i(u.element);
      break;
    case "tuple":
      for (const l of u.items)
        i(l);
      i(u.rest);
      break;
    case "record":
    case "map":
      i(u.keyType), i(u.valueType);
      break;
    case "set":
      i(u.valueType);
      break;
    case "union":
      for (const l of u.options)
        i(l);
      break;
    case "intersection":
      i(u.left), i(u.right);
      break;
    case "optional":
    case "nullable":
    case "default":
    case "prefault":
    case "catch":
    case "readonly":
    case "nonoptional":
    case "promise":
    case "success":
      i(u.innerType);
      break;
    case "pipe":
      i(u.in), i(u.out);
      break;
    case "function":
      i(u.input), i(u.output);
      break;
    // `$ZodLazy` caches its inner on the def, so a resolved edge is followed exactly
    case "lazy": {
      const l = u._cachedInner ?? void 0;
      c(l ? me(l, t) : he);
      break;
    }
    // a leaf by choice: `parts` are regex fragments, not data positions
    case "template_literal":
    // leaves
    case "string":
    case "number":
    case "int":
    case "boolean":
    case "bigint":
    case "symbol":
    case "undefined":
    case "null":
    case "void":
    case "never":
    case "any":
    case "unknown":
    case "date":
    case "nan":
    case "enum":
    case "literal":
    case "file":
    case "transform":
    case "custom":
      break;
    default:
      for (const l in u) {
        const d = Object.getOwnPropertyDescriptor(u, l);
        if (!d || d.get)
          continue;
        const p = d.value;
        if (!(!p || typeof p != "object")) {
          if (p._zod)
            i(p);
          else if (Array.isArray(p))
            for (const h of p)
              i(h);
        }
      }
  }
  return t.delete(e), Ti(e, o);
}
function Ti(e, t) {
  return t !== he && gn.set(e, t === re), t;
}
function ji(e, t) {
  let n = e.buckets.get(t);
  return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
let ae;
const fe = [], Ni = {
  alloc(e, t, n) {
    const r = ae;
    if (!r)
      return n;
    ae = void 0;
    const o = { value: n, issues: null };
    return r.set(t.value, o), fe.push(o), n;
  },
  guard(e) {
    var t;
    (t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
      const n = e._zod.parse, r = (o, i) => {
        if (i.direction !== "backward" && Ci(i, o.value))
          throw new Ai();
        return n(o, i);
      };
      e._zod.parse = r, e._zod.run === n && (e._zod.run = r);
    });
  },
  attach(e) {
    var t;
    let n, r = !1, o, i;
    (t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
      const s = e._zod.parse, c = (u, a) => {
        if (n === void 0) {
          const y = me(e, /* @__PURE__ */ new Set());
          if (y === te)
            return e._zod.parse = s, e._zod.run === c && (e._zod.run = s), s(u, a);
          y === re || r ? n = !0 : r = !0;
        }
        const l = u.value;
        if (!_n(l))
          return s(u, a);
        let d = a[Me];
        d || (d = { buckets: /* @__PURE__ */ new WeakMap(), backEdges: void 0 }, a[Me] = d);
        let p;
        o === a ? p = i : (p = ji(d, e), o = a, i = p);
        const h = p.get(l);
        if (h)
          return u.value = h.value, h.issues ? h.issues.length && u.issues.push(...je(h.issues)) : (u.memo = !0, d.backEdges ?? (d.backEdges = /* @__PURE__ */ new WeakSet()), d.backEdges.add(h.value)), u;
        ae = p;
        const m = fe.length, v = s(u, a);
        ae = void 0;
        const g = fe.length > m ? fe.pop() : void 0;
        return v instanceof Promise ? v.then((y) => (g && (g.issues = y.issues.length ? je(y.issues) : kt), y)) : (g && (g.issues = v.issues.length ? je(v.issues) : kt), v);
      };
      e._zod.parse = c, e._zod.run === s && (e._zod.run = c);
    });
  }
};
function Ri() {
  return Ni;
}
function Ci(e, t) {
  const n = e[Me]?.backEdges;
  return n !== void 0 && _n(t) && n.has(t);
}
const Di = () => {
  const e = {
    string: { unit: "characters", verb: "to have" },
    file: { unit: "bytes", verb: "to have" },
    array: { unit: "items", verb: "to have" },
    set: { unit: "items", verb: "to have" },
    map: { unit: "entries", verb: "to have" }
  };
  function t(i) {
    return e[i] ?? null;
  }
  const n = {
    regex: "input",
    email: "email address",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datetime",
    date: "ISO date",
    time: "ISO time",
    duration: "ISO duration",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    mac: "MAC address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64-encoded string",
    base64url: "base64url-encoded string",
    json_string: "JSON string",
    e164: "E.164 number",
    currency_code: "currency code",
    credit_card: "credit card number",
    iban: "IBAN",
    jwt: "JWT",
    template_literal: "input"
  }, r = {
    // Compatibility: "nan" -> "NaN" for display
    nan: "NaN"
    // All other type names omitted - they fall back to raw values via ?? operator
  };
  function o(i, s) {
    return i === "number" && typeof s == "number" && !Number.isFinite(s) ? String(s) : r[i] ?? i;
  }
  return (i) => {
    switch (i.code) {
      case "invalid_type": {
        const s = o(i.expected), c = cr(i.input), u = o(c, i.input);
        return `Invalid input: expected ${s}, received ${u}`;
      }
      case "invalid_value":
        return i.values.length === 1 ? `Invalid input: expected ${Wt(i.values[0])}` : `Invalid option: expected one of ${st(i.values, "|")}`;
      case "too_big": {
        const s = i.exact ? "exactly " : i.inclusive ? "<=" : "<", c = t(i.origin);
        return c ? `Too big: expected ${i.origin ?? "value"} to have ${s}${i.maximum.toString()} ${c.unit ?? "elements"}` : `Too big: expected ${i.origin ?? "value"} to be ${s}${i.maximum.toString()}`;
      }
      case "too_small": {
        const s = i.exact ? "exactly " : i.inclusive ? ">=" : ">", c = t(i.origin);
        return c ? `Too small: expected ${i.origin} to have ${s}${i.minimum.toString()} ${c.unit}` : `Too small: expected ${i.origin} to be ${s}${i.minimum.toString()}`;
      }
      case "invalid_format": {
        const s = i;
        return s.format === "starts_with" ? `Invalid string: must start with "${s.prefix}"` : s.format === "ends_with" ? `Invalid string: must end with "${s.suffix}"` : s.format === "includes" ? `Invalid string: must include "${s.includes}"` : s.format === "regex" ? `Invalid string: must match pattern ${s.pattern}` : `Invalid ${n[s.format] ?? i.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${i.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${i.keys.length > 1 ? "s" : ""}: ${st(i.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${i.origin}`;
      case "invalid_union":
        return i.options && Array.isArray(i.options) && i.options.length > 0 ? `Invalid discriminator value. Expected ${i.options.map((c) => `'${c}'`).join(" | ")}` : i.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
      case "invalid_element":
        return `Invalid value in ${i.origin}`;
      default:
        return "Invalid input";
    }
  };
};
function xi() {
  return {
    localeError: Di()
  };
}
var $t;
class Fi {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(t, ...n) {
    const r = n[0];
    return this._map.set(t, r), r && typeof r == "object" && "id" in r && this._idmap.set(r.id, t), this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(t) {
    const n = this._map.get(t);
    return n && typeof n == "object" && "id" in n && this._idmap.delete(n.id), this._map.delete(t), this;
  }
  get(t) {
    const n = t._zod.parent;
    if (n) {
      const r = { ...this.get(n) ?? {} };
      delete r.id;
      const o = { ...r, ...this._map.get(t) };
      return Object.keys(o).length ? o : void 0;
    }
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
}
function Ui() {
  return new Fi();
}
($t = globalThis).__zod_globalRegistry ?? ($t.__zod_globalRegistry = Ui());
const ne = globalThis.__zod_globalRegistry;
function vn(e) {
  return e.checks && (e.checks = [...e.checks]), e;
}
// @__NO_SIDE_EFFECTS__
function Mi(e, t) {
  return new e(vn({ type: "string", ..._(t) }));
}
// @__NO_SIDE_EFFECTS__
function Li(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ji(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ki(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Bi(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Vi(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Wi(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Gi(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function qi(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Yi(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Xi(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Hi(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Qi(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function es(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ts(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ns(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function rs(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function os(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function is(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ss(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function cs(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function us(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function as(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function fs(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ls(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ds(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ps(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function hs(e, t) {
  return new e(vn({ type: "number", checks: [], ..._(t) }));
}
// @__NO_SIDE_EFFECTS__
function ms(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function _s(e, t) {
  return new e({
    type: "boolean",
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function gs(e, t) {
  return new e({
    type: "null",
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function vs(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function bs(e, t) {
  return new e({
    type: "never",
    ..._(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ot(e, t) {
  return new nn({
    check: "less_than",
    ..._(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Ne(e, t) {
  return new nn({
    check: "less_than",
    ..._(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Zt(e, t) {
  return new rn({
    check: "greater_than",
    ..._(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Re(e, t) {
  return new rn({
    check: "greater_than",
    ..._(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function St(e, t) {
  return new ho({
    check: "multiple_of",
    ..._(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function bn(e, t) {
  return new _o({
    check: "max_length",
    ..._(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function ye(e, t) {
  return new go({
    check: "min_length",
    ..._(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function yn(e, t) {
  return new vo({
    check: "length_equals",
    ..._(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function ys(e, t) {
  return new bo({
    check: "string_format",
    format: "regex",
    ..._(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function ws(e) {
  return new yo({
    check: "string_format",
    format: "lowercase",
    ..._(e)
  });
}
// @__NO_SIDE_EFFECTS__
function zs(e) {
  return new wo({
    check: "string_format",
    format: "uppercase",
    ..._(e)
  });
}
// @__NO_SIDE_EFFECTS__
function ks(e, t) {
  return new zo({
    check: "string_format",
    format: "includes",
    ..._(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function $s(e, t) {
  return new ko({
    check: "string_format",
    format: "starts_with",
    ..._(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function Os(e, t) {
  return new $o({
    check: "string_format",
    format: "ends_with",
    ..._(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function q(e) {
  return new Oo({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function Zs(e) {
  return /* @__PURE__ */ q((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Ss() {
  return /* @__PURE__ */ q((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Ps() {
  return /* @__PURE__ */ q((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Is() {
  return /* @__PURE__ */ q((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Es() {
  return /* @__PURE__ */ q((e) => Gn(e));
}
// @__NO_SIDE_EFFECTS__
function As(e, t, n) {
  return new e({
    type: "array",
    element: t,
    // get element() {
    //   return element;
    // },
    ..._(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Ts(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ..._(n)
  });
}
// @__NO_SIDE_EFFECTS__
function js(e, t) {
  const n = /* @__PURE__ */ Ns((r) => (r.addIssue = (o) => {
    if (typeof o == "string")
      r.issues.push(ce(o, r.value, n._zod.def));
    else {
      const i = o;
      i.fatal && (i.continue = !1), i.code ?? (i.code = "custom"), "input" in i || (i.input = r.value), i.inst ?? (i.inst = n), i.continue ?? (i.continue = !n._zod.def.abort), r.issues.push(ce(i));
    }
  }, e(r.value, r)), t);
  return n;
}
// @__NO_SIDE_EFFECTS__
function Ns(e, t) {
  const n = new I({
    check: "custom",
    ..._(t)
  });
  return n._zod.check = e, n;
}
function oe(e, ...t) {
  for (const n of t)
    for (const r of Reflect.ownKeys(n))
      Object.prototype.propertyIsEnumerable.call(n, r) && K(e, r, n[r]);
  return e;
}
function wn(e) {
  let t = e?.target ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: e?.metadata ?? ne,
    target: t,
    unrepresentable: e?.unrepresentable ?? "throw",
    override: e?.override ?? (() => {
    }),
    io: e?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    sharedDefsExtractedFor: void 0,
    sharedEmitDoneFor: void 0,
    cycles: e?.cycles ?? "ref",
    reused: e?.reused ?? "inline",
    intersections: [],
    deferred: [],
    external: e?.external ?? void 0
  };
}
function Y(e, t, n, r, o) {
  const i = typeof t.unrepresentable == "function" ? t.unrepresentable({ zodSchema: e, path: r.path, message: o }) : t.unrepresentable;
  if (i === "any")
    return !1;
  if (i === void 0 || i === "throw")
    throw new Error(o);
  return Object.assign(n, i), !0;
}
function S(e, t, n = { path: [], schemaPath: [] }) {
  var r;
  const o = e._zod.def, i = t.seen.get(e);
  if (i)
    return i.count++, n.schemaPath.includes(e) && (i.cycle = n.path), i.schema;
  const s = { schema: {}, count: 1, cycle: void 0, path: n.path };
  t.seen.set(e, s), t.sharedDefsExtractedFor = void 0, t.sharedEmitDoneFor = void 0;
  const c = e._zod.toJSONSchema?.();
  if (c)
    s.schema = c;
  else {
    const l = {
      ...n,
      schemaPath: [...n.schemaPath, e],
      path: n.path
    };
    if (e._zod.processJSONSchema)
      e._zod.processJSONSchema(t, s.schema, l);
    else {
      const p = s.schema, h = t.processors[o.type];
      if (!h)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      h(e, t, p, l);
    }
    const d = e._zod.parent;
    d && (s.ref || (s.ref = d), S(d, t, l), t.seen.get(d).isParent = !0);
  }
  const u = t.metadataRegistry.get(e);
  return u && oe(s.schema, u), t.io === "input" && P(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && "_prefault" in s.schema && ((r = s.schema).default ?? (r.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
}
function Pt(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function zn(e, t) {
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  if (e.external && e.sharedDefsExtractedFor === e.external)
    return;
  const r = /* @__PURE__ */ new Map();
  for (const s of e.seen.entries()) {
    const c = e.metadataRegistry.get(s[0])?.id;
    if (c) {
      const u = r.get(c);
      if (u && u !== s[0])
        throw new Error(`Duplicate schema id "${c}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      r.set(c, s[0]);
    }
  }
  const o = (s) => {
    const c = e.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e.external) {
      const d = e.external.registry.get(s[0])?.id, p = e.external.uri ?? ((m) => m);
      if (d)
        return { ref: p(d) };
      const h = s[1].defId ?? s[1].schema.id ?? `schema${e.counter++}`;
      return s[1].defId = h, { defId: h, ref: `${p("__shared")}#/${c}/${Pt(h)}` };
    }
    const u = "#", a = `${u}/${c}/`;
    if (s[1] === n && !s[1].schema.id)
      return { ref: u };
    const l = s[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: l, ref: a + Pt(l) };
  }, i = (s) => {
    if (s[1].schema.$ref)
      return;
    const c = s[1], { ref: u, defId: a } = o(s);
    c.def = { ...c.schema }, a && (c.defId = a);
    const l = c.schema;
    for (const d in l)
      delete l[d];
    l.$ref = u;
  };
  if (e.cycles === "throw")
    for (const s of e.seen.entries()) {
      const c = s[1];
      if (c.cycle)
        throw new Error(`Cycle detected: #/${c.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const s of e.seen.entries()) {
    const c = s[1];
    if (t === s[0]) {
      i(s);
      continue;
    }
    if (e.external) {
      const a = e.external.registry.get(s[0])?.id;
      if (t !== s[0] && a) {
        i(s);
        continue;
      }
    }
    if (e.metadataRegistry.get(s[0])?.id) {
      i(s);
      continue;
    }
    if (c.cycle) {
      i(s);
      continue;
    }
    c.count > 1 && e.reused === "ref" && i(s);
  }
  e.external && (e.sharedDefsExtractedFor = e.external);
}
function kn(e) {
  const t = e.anyOf;
  if (!Array.isArray(t) || t.length === 0 || e.type !== void 0)
    return;
  const n = [];
  for (const r of t) {
    if (!r || typeof r != "object")
      return;
    kn(r);
    const o = Object.keys(r);
    if (o.length !== 1 || o[0] !== "type")
      return;
    const i = r.type;
    for (const s of Array.isArray(i) ? i : [i]) {
      if (typeof s != "string")
        return;
      n.includes(s) || n.push(s);
    }
  }
  delete e.anyOf, e.type = n.length === 1 ? n[0] : n;
}
const $n = /* @__PURE__ */ new Set(["type", "properties", "required", "additionalProperties"]), It = ["oneOf", "anyOf"];
function Et(e) {
  const t = e.additionalProperties;
  return t === void 0 || t === !1 || typeof t != "object" || t === null ? null : Object.keys(t).length ? t : null;
}
function Le(e) {
  const t = [];
  for (const i of e) {
    if (typeof i != "object" || i.type !== "object")
      return null;
    for (const s in i)
      if (!$n.has(s))
        return null;
    t.push(i);
  }
  const n = {}, r = /* @__PURE__ */ new Set();
  for (const i of t) {
    for (const s in i.properties) {
      if (Object.prototype.hasOwnProperty.call(n, s))
        continue;
      const c = [];
      for (const a of t) {
        const l = a.properties?.[s] ?? Et(a);
        l != null && (c.some((d) => JSON.stringify(d) === JSON.stringify(l)) || c.push(l));
      }
      const u = c.length === 1 ? c[0] : Le(c) ?? { allOf: c };
      K(n, s, u);
    }
    for (const s of i.required ?? [])
      r.add(s);
  }
  const o = { type: "object", properties: n };
  if (r.size && (o.required = [...r]), t.every((i) => i.additionalProperties === !1))
    o.additionalProperties = !1;
  else {
    const i = [];
    for (const s of t) {
      const c = Et(s);
      c && !i.some((u) => JSON.stringify(u) === JSON.stringify(c)) && i.push(c);
    }
    i.length === 1 ? o.additionalProperties = i[0] : i.length > 1 && (o.additionalProperties = { allOf: i });
  }
  return o;
}
function Rs(e) {
  const t = e.allOf;
  if (!Array.isArray(t) || t.length < 2)
    return;
  for (const o of $n)
    if (o in e)
      return;
  const n = t.filter((o) => It.some((i) => Array.isArray(o[i])));
  let r = null;
  if (!n.length)
    r = Le(t);
  else {
    const o = n[0], i = It.find((u) => Array.isArray(o[u]));
    if (Object.keys(o).length !== 1)
      return;
    const s = t.filter((u) => u !== o), c = o[i].map((u) => Le([...s, u]));
    if (c.some((u) => !u))
      return;
    r = { [i]: c };
  }
  r && (delete e.allOf, oe(e, r));
}
function On(e, t) {
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (c) => {
    const u = e.seen.get(c);
    if (u.ref === null)
      return;
    const a = u.def ?? u.schema, l = { ...a }, d = u.ref;
    if (u.ref = null, d) {
      r(d);
      const h = e.seen.get(d), m = h.schema;
      if (m.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (a.allOf = a.allOf ?? [], a.allOf.push(m)) : oe(a, m), oe(a, l), c._zod.parent === d)
        for (const g in a)
          g === "$ref" || g === "allOf" || g in l || delete a[g];
      if (m.$ref && h.def)
        for (const g in a)
          g === "$ref" || g === "allOf" || g in h.def && JSON.stringify(a[g]) === JSON.stringify(h.def[g]) && delete a[g];
    }
    const p = c._zod.parent;
    if (p && p !== d) {
      r(p);
      const h = e.seen.get(p);
      if (h?.schema.$ref && (a.$ref = h.schema.$ref, h.def))
        for (const m in a)
          m === "$ref" || m === "allOf" || m in h.def && JSON.stringify(a[m]) === JSON.stringify(h.def[m]) && delete a[m];
    }
    e.override({
      zodSchema: c,
      jsonSchema: a,
      path: u.path ?? []
    });
  };
  if (!e.external || e.sharedEmitDoneFor !== e.external) {
    for (const c of [...e.seen.entries()].reverse())
      r(c[0]);
    if (e.target !== "openapi-3.0")
      for (const c of e.seen.entries())
        kn(c[1].def ?? c[1].schema);
    for (const c of e.deferred)
      c();
    if (e.intersections.length) {
      const c = /* @__PURE__ */ new Map();
      for (const u of e.seen.values())
        for (const a of [u.schema, u.def]) {
          const l = a?.allOf;
          if (!Array.isArray(l))
            continue;
          const d = c.get(l);
          d ? d.push(a) : c.set(l, [a]);
        }
      for (const u of e.intersections)
        for (const a of c.get(u) ?? [])
          Rs(a);
    }
  }
  const o = {};
  if (e.target === "draft-2020-12" ? o.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? o.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? o.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
    const c = e.external.registry.get(t)?.id;
    if (!c)
      throw new Error("Schema is missing an `id` property");
    o.$id = e.external.uri(c);
  }
  oe(o, n.defId ? n.schema : n.def ?? n.schema);
  const i = e.metadataRegistry.get(t)?.id;
  i !== void 0 && o.id === i && delete o.id;
  const s = e.external?.defs ?? {};
  if (!e.external || e.sharedEmitDoneFor !== e.external)
    for (const c of e.seen.entries()) {
      const u = c[1];
      u.def && u.defId && (u.def.id === u.defId && delete u.def.id, K(s, u.defId, u.def));
    }
  e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(s).length > 0 && (e.target === "draft-2020-12" ? o.$defs = s : o.definitions = s);
  try {
    const c = JSON.parse(JSON.stringify(o));
    return Object.defineProperty(c, "~standard", {
      value: {
        ...t["~standard"],
        jsonSchema: {
          input: we(t, "input", e.processors),
          output: we(t, "output", e.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), c;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function P(e, t) {
  const n = t ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(e))
    return !1;
  n.seen.add(e);
  const r = e._zod.def;
  if (r.type === "transform")
    return !0;
  if (r.type === "array")
    return P(r.element, n);
  if (r.type === "set")
    return P(r.valueType, n);
  if (r.type === "lazy")
    return P(r.getter(), n);
  if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch")
    return P(r.innerType, n);
  if (r.type === "intersection")
    return P(r.left, n) || P(r.right, n);
  if (r.type === "record" || r.type === "map")
    return P(r.keyType, n) || P(r.valueType, n);
  if (r.type === "pipe")
    return e._zod.traits.has("$ZodCodec") ? !0 : P(r.in, n) || P(r.out, n);
  if (r.type === "object") {
    for (const o in r.shape)
      if (P(r.shape[o], n))
        return !0;
    return !1;
  }
  if (r.type === "union") {
    for (const o of r.options)
      if (P(o, n))
        return !0;
    return !1;
  }
  if (r.type === "tuple") {
    for (const o of r.items)
      if (P(o, n))
        return !0;
    return !!(r.rest && P(r.rest, n));
  }
  return !1;
}
const Cs = (e, t = {}) => (n) => {
  const r = wn({ ...n, processors: t });
  return S(e, r), zn(r, e), On(r, e);
}, we = (e, t, n = {}) => (r) => {
  const { libraryOptions: o, target: i } = r ?? {}, s = wn({ ...o ?? {}, target: i, io: t, processors: n });
  return S(e, s), zn(s, e), On(s, e);
}, V = (e, t, n) => {
  (e[t] === void 0 || n > e[t]) && (e[t] = n);
}, W = (e, t, n) => {
  (e[t] === void 0 || n < e[t]) && (e[t] = n);
}, At = (e, t) => {
  V(e, "minimum", t), W(e, "maximum", t);
}, Zn = (e, t) => {
  e.multipleOf ?? (e.multipleOf = []), e.multipleOf.includes(t) || e.multipleOf.push(t);
}, Sn = (e, t) => {
  e.patterns ?? (e.patterns = /* @__PURE__ */ new Set()), e.patterns.add(t);
}, Pn = (e, t) => {
  e.mime = e.mime ? e.mime.filter((n) => t.includes(n)) : [...t];
}, In = (e, t) => {
  e.format = t, t.includes("int") && (e.isInt = !0);
}, Tt = (e, t) => V(e, "minimum", t.minimum), jt = (e, t) => W(e, "maximum", t.maximum), Nt = (e) => (t, n) => {
  In(t, n.format);
  const [r, o] = e[n.format];
  V(t, "minimum", r), W(t, "maximum", o);
}, Ds = {
  greater_than: (e, t) => V(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
  less_than: (e, t) => W(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
  multiple_of: (e, t) => Zn(e, t.value),
  number_format: Nt(Gt),
  bigint_format: Nt(Hn),
  min_length: Tt,
  max_length: jt,
  length_equals: (e, t) => At(e, t.length),
  min_size: Tt,
  max_size: jt,
  size_equals: (e, t) => At(e, t.size),
  string_format: (e, t) => {
    In(e, t.format), t.pattern && Sn(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
  },
  mime_type: (e, t) => Pn(e, t.mime)
};
function N(e) {
  const t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
  for (const i of r)
    Ds[i._zod.def.check]?.(t, i._zod.def);
  const o = e._zod.bag;
  o.minimum !== void 0 && V(t, "minimum", o.minimum), o.exclusiveMinimum !== void 0 && V(t, "exclusiveMinimum", o.exclusiveMinimum), o.maximum !== void 0 && W(t, "maximum", o.maximum), o.exclusiveMaximum !== void 0 && W(t, "exclusiveMaximum", o.exclusiveMaximum), o.multipleOf !== void 0 && Zn(t, o.multipleOf), o.format !== void 0 && (t.format ?? (t.format = o.format), o.format.includes("int") && (t.isInt = !0)), o.mime && Pn(t, o.mime);
  for (const i of o.patterns ?? [])
    Sn(t, i);
  return t;
}
const xs = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, Fs = /* @__PURE__ */ new Map([
  [ln, Qr],
  [tt, eo]
]), Us = (e) => Fs.get(e) ?? e, Ms = (e, t, n, r) => {
  const o = n;
  o.type = "string";
  const { minimum: i, maximum: s, format: c, patterns: u, contentEncoding: a, laxFormat: l } = N(e);
  if (typeof i == "number" && (o.minLength = i), typeof s == "number" && (o.maxLength = s), c && (o.format = xs[c] ?? c, o.format === "" && delete o.format, (c === "time" || l) && delete o.format), a && (o.contentEncoding = a), u && u.size > 0) {
    const d = [...u].map(Us);
    d.length === 1 ? o.pattern = d[0].source : d.length > 1 && (o.allOf = [
      ...d.map((p) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: p.source
      }))
    ]);
  }
}, Ls = (e, t, n, r) => {
  const o = n, { minimum: i, maximum: s, multipleOf: c, exclusiveMaximum: u, exclusiveMinimum: a, isInt: l } = N(e);
  o.type = l ? "integer" : "number";
  const d = typeof a == "number" && a >= (i ?? Number.NEGATIVE_INFINITY), p = typeof u == "number" && u <= (s ?? Number.POSITIVE_INFINITY), h = t.target === "draft-04" || t.target === "openapi-3.0";
  if (d ? h ? (o.minimum = a, o.exclusiveMinimum = !0) : o.exclusiveMinimum = a : typeof i == "number" && (o.minimum = i), p ? h ? (o.maximum = u, o.exclusiveMaximum = !0) : o.exclusiveMaximum = u : typeof s == "number" && (o.maximum = s), c) {
    const m = /* @__PURE__ */ new Set();
    for (const y of c)
      Number.isFinite(y) && y !== 0 ? m.add(Math.abs(y)) : Y(e, t, o, r, `A multipleOf divisor of ${y} cannot be represented in JSON Schema`);
    const [v, ...g] = m;
    v !== void 0 && (o.multipleOf = v), g.length && (o.allOf = [...o.allOf ?? [], ...g.map((y) => ({ multipleOf: y }))]);
  }
}, Js = (e, t, n, r) => {
  n.type = "boolean";
}, Ks = (e, t, n, r) => {
  t.target === "openapi-3.0" ? (n.type = "string", n.nullable = !0, n.enum = [null]) : n.type = "null";
}, Bs = (e, t, n, r) => {
  n.not = {};
}, Vs = (e, t, n, r) => {
}, Ws = (e, t, n, r) => {
  const o = e._zod.def, i = Ce(o.entries);
  if (i.length === 0) {
    n.not = {};
    return;
  }
  i.every((s) => typeof s == "number") && (n.type = "number"), i.every((s) => typeof s == "string") && (n.type = "string"), n.enum = i;
}, Gs = (e, t, n, r) => {
  Y(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, qs = (e, t, n, r) => {
  Y(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, Ys = (e, t, n, r) => {
  const o = n, i = e._zod.def, { minimum: s, maximum: c } = N(e);
  typeof s == "number" && (o.minItems = s), typeof c == "number" && (o.maxItems = c), o.type = "array", o.items = S(i.element, t, {
    ...r,
    path: [...r.path, "items"]
  });
};
function Je(e) {
  const t = e._zod.def;
  return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? Je(t.out) : t.type === "catch" ? Je(t.innerType) : e._zod.optin;
}
const Xs = (e, t, n, r) => {
  const o = n, i = e._zod.def, s = i.shape;
  if (Object.getOwnPropertySymbols(s).length && Y(e, t, o, r, "Symbol keys cannot be represented in JSON Schema"))
    return;
  o.type = "object", o.properties = {};
  for (const a in s)
    K(o.properties, a, S(s[a], t, {
      ...r,
      path: [...r.path, "properties", a]
    }));
  const u = [];
  for (const a of Object.keys(s)) {
    const l = i.shape[a];
    (t.io === "input" ? Je(l) === void 0 : l._zod.optout === void 0) && u.push(a);
  }
  u.length > 0 && (o.required = u), i.catchall?._zod.def.type === "never" ? o.additionalProperties = !1 : i.catchall ? i.catchall && (o.additionalProperties = S(i.catchall, t, {
    ...r,
    path: [...r.path, "additionalProperties"]
  })) : t.io === "output" && (o.additionalProperties = !1);
}, Hs = (e, t, n, r) => {
  const o = e._zod.def, i = o.inclusive === !1, s = o.options.map((c, u) => S(c, t, {
    ...r,
    path: [...r.path, i ? "oneOf" : "anyOf", u]
  }));
  i ? n.oneOf = s : n.anyOf = s;
}, Qs = (e, t, n, r) => {
  const o = e._zod.def, i = S(o.left, t, {
    ...r,
    path: [...r.path, "allOf", 0]
  }), s = S(o.right, t, {
    ...r,
    path: [...r.path, "allOf", 1]
  }), c = (a) => "allOf" in a && Object.keys(a).length === 1, u = [
    ...c(i) ? i.allOf : [i],
    ...c(s) ? s.allOf : [s]
  ];
  n.allOf = u, t.intersections.push(u);
}, ec = (e, t, n, r) => {
  const o = e._zod.def, i = S(o.innerType, t, r), s = t.seen.get(e);
  t.target === "openapi-3.0" ? (s.ref = o.innerType, n.nullable = !0) : n.anyOf = [i, { type: "null" }];
}, tc = (e, t, n, r) => {
  const o = e._zod.def;
  S(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
}, nt = /* @__PURE__ */ Symbol();
function En(e, t, n, r, o) {
  let i = !1;
  const s = JSON.stringify(e, (c, u) => typeof u != "bigint" ? u : (i = !0, null));
  return i ? (Y(t, n, r, o, "BigInt defaults cannot be represented in JSON Schema"), nt) : JSON.parse(s);
}
const nc = (e, t, n, r) => {
  const o = e._zod.def;
  S(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
  const s = En(o.defaultValue, e, t, n, r);
  s !== nt && (n.default = s);
}, rc = (e, t, n, r) => {
  const o = e._zod.def;
  S(o.innerType, t, r);
  const i = t.seen.get(e);
  if (i.ref = o.innerType, t.io !== "input")
    return;
  const s = En(o.defaultValue, e, t, n, r);
  s !== nt && (n._prefault = s);
}, oc = (e, t, n, r) => {
  const o = e._zod.def;
  S(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
  let s;
  try {
    s = o.catchValue(void 0);
  } catch {
    Y(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
    return;
  }
  n.default = s;
}, ic = (e, t, n, r) => {
  const o = e._zod.def, i = o.in._zod.traits.has("$ZodTransform"), s = t.io === "input" ? i ? o.out : o.in : o.out;
  S(s, t, r);
  const c = t.seen.get(e);
  c.ref = s;
}, sc = (e, t, n, r) => {
  const o = e._zod.def;
  S(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType, n.readOnly = !0;
}, An = (e, t, n, r) => {
  const o = e._zod.def;
  S(o.innerType, t, r);
  const i = t.seen.get(e);
  i.ref = o.innerType;
}, Rt = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function le(e, t, n) {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    get() {
      const r = n(this);
      return Object.defineProperty(this, t, { value: r, configurable: !0, writable: !0 }), r;
    },
    set(r) {
      Object.defineProperty(this, t, { value: r, configurable: !0, writable: !0 });
    }
  });
}
const cc = (e, t) => {
  yr.init(e, t), e.name = "ZodError";
  const n = Object.getPrototypeOf(e);
  Rt.has(n) || (Rt.add(n), le(n, "format", (r) => (o) => kr(r, o)), le(n, "flatten", (r) => (o) => zr(r, o)), le(n, "addIssue", (r) => (o) => {
    r.issues.push(o), r.message = JSON.stringify(r.issues, De, 2);
  }), le(n, "addIssues", (r) => (o) => {
    r.issues.push(...o), r.message = JSON.stringify(r.issues, De, 2);
  }), Object.defineProperty(n, "isEmpty", {
    configurable: !0,
    enumerable: !1,
    get() {
      return this.issues.length === 0;
    }
  }));
}, A = /* @__PURE__ */ f("ZodError", cc, void 0, {
  Parent: Error
}), uc = /* @__PURE__ */ qe(A), ac = /* @__PURE__ */ Ye(A), fc = /* @__PURE__ */ Xe(A), lc = /* @__PURE__ */ He(A), dc = /* @__PURE__ */ Ir(A), pc = /* @__PURE__ */ Er(A), hc = /* @__PURE__ */ Ar(A), mc = /* @__PURE__ */ Tr(A), _c = /* @__PURE__ */ jr(A), gc = /* @__PURE__ */ Nr(A), vc = /* @__PURE__ */ Rr(A), bc = /* @__PURE__ */ Cr(A);
function yc() {
  R.localeError || M(xi());
}
function rt() {
  R.memoizer || M({ memoizer: Ri() });
}
const O = /* @__PURE__ */ f("ZodType", (e, t) => (yc(), $.init(e, t), e.def = t, e.type = t.type, e), {
  check(...e) {
    const t = this.def;
    return this.clone(E(t, {
      checks: [
        ...t.checks ?? [],
        ...e.map((n) => typeof n == "function" ? { _zod: { check: n, def: { check: "custom" }, onattach: [] } } : n)
      ]
    }), { parent: !0 });
  },
  with(...e) {
    return this.check(...e);
  },
  clone(e, t) {
    return U(this, e, t);
  },
  brand() {
    return this;
  },
  register(e, t) {
    return e.add(this, t), this;
  },
  refine(e, t) {
    return this.check(bu(e, t));
  },
  superRefine(e, t) {
    return this.check(yu(e, t));
  },
  overwrite(e) {
    return this.check(/* @__PURE__ */ q(e));
  },
  optional() {
    return xt(this);
  },
  exactOptional() {
    return su(this);
  },
  nullable() {
    return Ft(this);
  },
  nullish() {
    return xt(Ft(this));
  },
  nonoptional(e) {
    return du(this, e);
  },
  array() {
    return Hc(this);
  },
  or(e) {
    return tu([this, e]);
  },
  and(e) {
    return ru(this, e);
  },
  transform(e) {
    return Ut(this, iu(e));
  },
  default(e) {
    return au(this, e);
  },
  prefault(e) {
    return lu(this, e);
  },
  catch(e) {
    return hu(this, e);
  },
  pipe(e) {
    return Ut(this, e);
  },
  readonly() {
    return gu(this);
  },
  describe(e) {
    const t = this.clone();
    return ne.add(t, { description: e }), t;
  },
  meta(...e) {
    if (e.length === 0)
      return ne.get(this);
    const t = this.clone();
    return ne.add(t, e[0]), t;
  },
  isOptional() {
    return this.safeParse(void 0).success;
  },
  isNullable() {
    return this.safeParse(null).success;
  },
  apply(e, ...t) {
    return t.length === 0 ? e(this) : e(this, ...t);
  },
  // Overrides core's `~standard` to add `jsonSchema`. Must stay a prototype entry: redefining it per instance demotes instances to dictionary mode.
  get "~standard"() {
    return Xt(this, "~standard", {
      ...sn(this),
      jsonSchema: {
        input: we(this, "input"),
        output: we(this, "output")
      }
    });
  },
  set "~standard"(e) {
    F(this, "~standard", e);
  },
  parse: function e(t, n) {
    return uc(this, t, n, { callee: e });
  },
  parseAsync: async function e(t, n) {
    return await ac(this, t, n, { callee: e });
  },
  safeParse(e, t) {
    return fc(this, e, t);
  },
  async safeParseAsync(e, t) {
    return lc(this, e, t);
  },
  // `spa` is an alias: same function object as `safeParseAsync`, as before.
  get spa() {
    return this?.safeParseAsync;
  },
  set spa(e) {
    F(this, "spa", e);
  },
  validate(e, t) {
    return Zr(this, e, t);
  },
  validateAsync(e, t) {
    return Pr(this, e, t);
  },
  encode: function e(t, n) {
    return dc(this, t, n, { callee: e });
  },
  decode: function e(t, n) {
    return pc(this, t, n, { callee: e });
  },
  encodeAsync: async function e(t, n) {
    return await hc(this, t, n, { callee: e });
  },
  decodeAsync: async function e(t, n) {
    return await mc(this, t, n, { callee: e });
  },
  safeEncode(e, t) {
    return _c(this, e, t);
  },
  safeDecode(e, t) {
    return gc(this, e, t);
  },
  async safeEncodeAsync(e, t) {
    return vc(this, e, t);
  },
  async safeDecodeAsync(e, t) {
    return bc(this, e, t);
  },
  toJSONSchema(e) {
    return Cs(this, {})(e);
  },
  // Reads through to the registry on every access, so it must not cache.
  get description() {
    return ne.get(this)?.description;
  },
  // No setter: `schema._def = x` throws, as it did when `_def` was a non-writable own property.
  get _def() {
    return this._zod.def;
  }
}), Tn = /* @__PURE__ */ f(
  "_ZodString",
  (e, t) => {
    et.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ms(e, n, r);
  },
  /* @__PURE__ */ Ht({
    format: (e) => N(e).format ?? null,
    minLength: (e) => N(e).minimum ?? null,
    maxLength: (e) => N(e).maximum ?? null
  }, {
    regex(...e) {
      return this.check(/* @__PURE__ */ ys(...e));
    },
    includes(...e) {
      return this.check(/* @__PURE__ */ ks(...e));
    },
    startsWith(...e) {
      return this.check(/* @__PURE__ */ $s(...e));
    },
    endsWith(...e) {
      return this.check(/* @__PURE__ */ Os(...e));
    },
    min(...e) {
      return this.check(/* @__PURE__ */ ye(...e));
    },
    max(...e) {
      return this.check(/* @__PURE__ */ bn(...e));
    },
    length(...e) {
      return this.check(/* @__PURE__ */ yn(...e));
    },
    nonempty(...e) {
      return this.check(/* @__PURE__ */ ye(1, ...e));
    },
    lowercase(e) {
      return this.check(/* @__PURE__ */ ws(e));
    },
    uppercase(e) {
      return this.check(/* @__PURE__ */ zs(e));
    },
    trim() {
      return this.check(/* @__PURE__ */ Ss());
    },
    normalize(...e) {
      return this.check(/* @__PURE__ */ Zs(...e));
    },
    toLowerCase() {
      return this.check(/* @__PURE__ */ Ps());
    },
    toUpperCase() {
      return this.check(/* @__PURE__ */ Is());
    },
    slugify() {
      return this.check(/* @__PURE__ */ Es());
    }
  })
), wc = /* @__PURE__ */ f("ZodString", (e, t) => {
  et.init(e, t), Tn.init(e, t);
}, {
  email(e) {
    return this.check(/* @__PURE__ */ Li(Zc, e));
  },
  url(e) {
    return this.check(/* @__PURE__ */ Gi(Pc, e));
  },
  jwt(e) {
    return this.check(/* @__PURE__ */ as(Jc, e));
  },
  emoji(e) {
    return this.check(/* @__PURE__ */ qi(Ic, e));
  },
  guid(e) {
    return this.check(/* @__PURE__ */ Ji(Sc, e));
  },
  uuid(e) {
    return this.check(/* @__PURE__ */ Ki(de, e));
  },
  uuidv4(e) {
    return this.check(/* @__PURE__ */ Bi(de, e));
  },
  uuidv6(e) {
    return this.check(/* @__PURE__ */ Vi(de, e));
  },
  uuidv7(e) {
    return this.check(/* @__PURE__ */ Wi(de, e));
  },
  nanoid(e) {
    return this.check(/* @__PURE__ */ Yi(Ec, e));
  },
  cuid(e) {
    return this.check(/* @__PURE__ */ Xi(Ac, e));
  },
  cuid2(e) {
    return this.check(/* @__PURE__ */ Hi(Tc, e));
  },
  ulid(e) {
    return this.check(/* @__PURE__ */ Qi(jc, e));
  },
  base64(e) {
    return this.check(/* @__PURE__ */ ss(Uc, e));
  },
  base64url(e) {
    return this.check(/* @__PURE__ */ cs(Mc, e));
  },
  xid(e) {
    return this.check(/* @__PURE__ */ es(Nc, e));
  },
  ksuid(e) {
    return this.check(/* @__PURE__ */ ts(Rc, e));
  },
  ipv4(e) {
    return this.check(/* @__PURE__ */ ns(Cc, e));
  },
  ipv6(e) {
    return this.check(/* @__PURE__ */ rs(Dc, e));
  },
  cidrv4(e) {
    return this.check(/* @__PURE__ */ os(xc, e));
  },
  cidrv6(e) {
    return this.check(/* @__PURE__ */ is(Fc, e));
  },
  e164(e) {
    return this.check(/* @__PURE__ */ us(Lc, e));
  },
  datetime(e) {
    return this.check(/* @__PURE__ */ fs(zc, e));
  },
  date(e) {
    return this.check(/* @__PURE__ */ ls(kc, e));
  },
  time(e) {
    return this.check(/* @__PURE__ */ ds($c, e));
  },
  duration(e) {
    return this.check(/* @__PURE__ */ ps(Oc, e));
  }
});
function ie(e) {
  return /* @__PURE__ */ Mi(wc, e);
}
const k = /* @__PURE__ */ f("ZodStringFormat", (e, t) => {
  z.init(e, t), Tn.init(e, t);
}), zc = /* @__PURE__ */ f("ZodISODateTime", (e, t) => {
  Bo.init(e, t), k.init(e, t);
}), kc = /* @__PURE__ */ f("ZodISODate", (e, t) => {
  Vo.init(e, t), k.init(e, t);
}), $c = /* @__PURE__ */ f("ZodISOTime", (e, t) => {
  Wo.init(e, t), k.init(e, t);
}), Oc = /* @__PURE__ */ f("ZodISODuration", (e, t) => {
  Go.init(e, t), k.init(e, t);
}), Zc = /* @__PURE__ */ f("ZodEmail", (e, t) => {
  Ao.init(e, t), k.init(e, t);
}), Sc = /* @__PURE__ */ f("ZodGUID", (e, t) => {
  Io.init(e, t), k.init(e, t);
}), de = /* @__PURE__ */ f("ZodUUID", (e, t) => {
  Eo.init(e, t), k.init(e, t);
}), Pc = /* @__PURE__ */ f("ZodURL", (e, t) => {
  Do.init(e, t), k.init(e, t);
}), Ic = /* @__PURE__ */ f("ZodEmoji", (e, t) => {
  xo.init(e, t), k.init(e, t);
}), Ec = /* @__PURE__ */ f("ZodNanoID", (e, t) => {
  Fo.init(e, t), k.init(e, t);
}), Ac = /* @__PURE__ */ f("ZodCUID", (e, t) => {
  Uo.init(e, t), k.init(e, t);
}), Tc = /* @__PURE__ */ f("ZodCUID2", (e, t) => {
  Mo.init(e, t), k.init(e, t);
}), jc = /* @__PURE__ */ f("ZodULID", (e, t) => {
  Lo.init(e, t), k.init(e, t);
}), Nc = /* @__PURE__ */ f("ZodXID", (e, t) => {
  Jo.init(e, t), k.init(e, t);
}), Rc = /* @__PURE__ */ f("ZodKSUID", (e, t) => {
  Ko.init(e, t), k.init(e, t);
}), Cc = /* @__PURE__ */ f("ZodIPv4", (e, t) => {
  qo.init(e, t), k.init(e, t);
}), Dc = /* @__PURE__ */ f("ZodIPv6", (e, t) => {
  Xo.init(e, t), k.init(e, t);
}), xc = /* @__PURE__ */ f("ZodCIDRv4", (e, t) => {
  Ho.init(e, t), k.init(e, t);
}), Fc = /* @__PURE__ */ f("ZodCIDRv6", (e, t) => {
  ei.init(e, t), k.init(e, t);
}), Uc = /* @__PURE__ */ f("ZodBase64", (e, t) => {
  ti.init(e, t), k.init(e, t);
}), Mc = /* @__PURE__ */ f("ZodBase64URL", (e, t) => {
  ri.init(e, t), k.init(e, t);
}), Lc = /* @__PURE__ */ f("ZodE164", (e, t) => {
  oi.init(e, t), k.init(e, t);
}), Jc = /* @__PURE__ */ f("ZodJWT", (e, t) => {
  si.init(e, t), k.init(e, t);
}), jn = /* @__PURE__ */ f(
  "ZodNumber",
  (e, t) => {
    dn.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ls(e, n, r, o), e.isFinite = !0;
  },
  /* @__PURE__ */ Ht({
    minValue: (e) => {
      const { minimum: t, exclusiveMinimum: n } = N(e);
      return Math.max(t ?? Number.NEGATIVE_INFINITY, n ?? Number.NEGATIVE_INFINITY);
    },
    maxValue: (e) => {
      const { maximum: t, exclusiveMaximum: n } = N(e);
      return Math.min(t ?? Number.POSITIVE_INFINITY, n ?? Number.POSITIVE_INFINITY);
    },
    isInt: (e) => {
      const { isInt: t, multipleOf: n } = N(e);
      return !!t || !!n?.some(Number.isSafeInteger);
    },
    format: (e) => N(e).format ?? null
  }, {
    gt(e, t) {
      return this.check(/* @__PURE__ */ Zt(e, t));
    },
    gte(e, t) {
      return this.check(/* @__PURE__ */ Re(e, t));
    },
    min(e, t) {
      return this.check(/* @__PURE__ */ Re(e, t));
    },
    lt(e, t) {
      return this.check(/* @__PURE__ */ Ot(e, t));
    },
    lte(e, t) {
      return this.check(/* @__PURE__ */ Ne(e, t));
    },
    max(e, t) {
      return this.check(/* @__PURE__ */ Ne(e, t));
    },
    int(e) {
      return this.check(Ct(e));
    },
    safe(e) {
      return this.check(Ct(e));
    },
    positive(e) {
      return this.check(/* @__PURE__ */ Zt(0, e));
    },
    nonnegative(e) {
      return this.check(/* @__PURE__ */ Re(0, e));
    },
    negative(e) {
      return this.check(/* @__PURE__ */ Ot(0, e));
    },
    nonpositive(e) {
      return this.check(/* @__PURE__ */ Ne(0, e));
    },
    multipleOf(e, t) {
      return this.check(/* @__PURE__ */ St(e, t));
    },
    step(e, t) {
      return this.check(/* @__PURE__ */ St(e, t));
    },
    finite() {
      return this;
    }
  })
);
function ze(e) {
  return /* @__PURE__ */ hs(jn, e);
}
const Kc = /* @__PURE__ */ f("ZodNumberFormat", (e, t) => {
  ci.init(e, t), jn.init(e, t);
});
function Ct(e) {
  return /* @__PURE__ */ ms(Kc, e);
}
const Bc = /* @__PURE__ */ f("ZodBoolean", (e, t) => {
  ui.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Js(e, n, r);
});
function ke(e) {
  return /* @__PURE__ */ _s(Bc, e);
}
const Vc = /* @__PURE__ */ f("ZodNull", (e, t) => {
  ai.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ks(e, n, r);
});
function Wc(e) {
  return /* @__PURE__ */ gs(Vc, e);
}
const Gc = /* @__PURE__ */ f("ZodUnknown", (e, t) => {
  fi.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Vs();
});
function Dt() {
  return /* @__PURE__ */ vs(Gc);
}
const qc = /* @__PURE__ */ f("ZodNever", (e, t) => {
  li.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Bs(e, n, r);
});
function Yc(e) {
  return /* @__PURE__ */ bs(qc, e);
}
const Xc = /* @__PURE__ */ f("ZodArray", (e, t) => {
  rt(), hi.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ys(e, n, r, o), e.element = t.element;
}, {
  min(e, t) {
    return this.check(/* @__PURE__ */ ye(e, t));
  },
  nonempty(e) {
    return this.check(/* @__PURE__ */ ye(1, e));
  },
  max(e, t) {
    return this.check(/* @__PURE__ */ bn(e, t));
  },
  length(e, t) {
    return this.check(/* @__PURE__ */ yn(e, t));
  },
  unwrap() {
    return this.element;
  }
});
function Hc(e, t) {
  return /* @__PURE__ */ As(Xc, e, t);
}
const Qc = /* @__PURE__ */ f("ZodObject", (e, t) => {
  rt(), gi.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Xs(e, n, r, o), dr(e, "shape", (n) => n._zod.def.shape, !1);
}, {
  keyof() {
    return Nn(Object.keys(this._zod.def.shape));
  },
  catchall(e) {
    return this.clone(E(this._zod.def, { catchall: e }));
  },
  passthrough() {
    return this.clone(E(this._zod.def, { catchall: Dt() }));
  },
  loose() {
    return this.clone(E(this._zod.def, { catchall: Dt() }));
  },
  strict() {
    return this.clone(E(this._zod.def, { catchall: Yc() }));
  },
  strip() {
    return this.clone(E(this._zod.def, { catchall: void 0 }));
  },
  extend(e) {
    return tr(this, e);
  },
  safeExtend(e) {
    return nr(this, e);
  },
  merge(e) {
    return rr(this, e);
  },
  pick(e) {
    return Qn(this, e);
  },
  omit(e) {
    return er(this, e);
  },
  partial(...e) {
    return ct(Rn, this, e[0]);
  },
  exactPartial(...e) {
    return ct(Cn, this, e[0], "exactPartial");
  },
  required(...e) {
    return or(Dn, this, e[0]);
  }
});
function B(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ..._(t)
  };
  return new Qc(n);
}
const eu = /* @__PURE__ */ f("ZodUnion", (e, t) => {
  vi.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Hs(e, n, r, o), e.options = t.options;
});
function tu(e, t) {
  return new eu({
    type: "union",
    options: e,
    ..._(t)
  });
}
const nu = /* @__PURE__ */ f("ZodIntersection", (e, t) => {
  bi.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Qs(e, n, r, o);
});
function ru(e, t) {
  return new nu({
    type: "intersection",
    left: e,
    right: t
  });
}
const Ke = /* @__PURE__ */ f("ZodEnum", (e, t) => {
  yi.init(e, t), O.init(e, t), e._zod.processJSONSchema = (r, o, i) => Ws(e, r, o), e.enum = t.entries, e.options = [...e._zod.values];
  const n = new Set(Object.keys(t.entries));
  e.extract = (r, o) => {
    const i = {};
    for (const s of r)
      if (n.has(s))
        i[s] = t.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new Ke({
      ...t,
      checks: [],
      ..._(o),
      entries: i
    });
  }, e.exclude = (r, o) => {
    const i = { ...t.entries };
    for (const s of r)
      if (n.has(s))
        delete i[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new Ke({
      ...t,
      checks: [],
      ..._(o),
      entries: i
    });
  };
});
function Nn(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((r) => [r, r])) : e;
  return new Ke({
    type: "enum",
    entries: n,
    ..._(t)
  });
}
const ou = /* @__PURE__ */ f("ZodTransform", (e, t) => {
  rt(), wi.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => qs(e, n, r, o), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new Qt(e.constructor.name);
    n.addIssue = (i) => {
      if (typeof i == "string")
        n.issues.push(ce(i, n.value, t));
      else {
        const s = i;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), "input" in s || (s.input = n.value), s.inst ?? (s.inst = e), n.issues.push(ce(s));
      }
    };
    const o = t.transform(n.value, n);
    return o instanceof Promise ? o.then((i) => (n.value = i, n)) : (n.value = o, n);
  };
});
function iu(e) {
  return new ou({
    type: "transform",
    transform: e
  });
}
const Rn = /* @__PURE__ */ f("ZodOptional", (e, t) => {
  mn.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => An(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function xt(e) {
  return new Rn({
    type: "optional",
    innerType: e
  });
}
const Cn = /* @__PURE__ */ f("ZodExactOptional", (e, t) => {
  zi.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => An(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function su(e) {
  return new Cn({
    type: "optional",
    innerType: e
  });
}
const cu = /* @__PURE__ */ f("ZodNullable", (e, t) => {
  ki.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => ec(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Ft(e) {
  return new cu({
    type: "nullable",
    innerType: e
  });
}
const uu = /* @__PURE__ */ f("ZodDefault", (e, t) => {
  $i.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => nc(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function au(e, t) {
  return new uu({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Vt(t);
    }
  });
}
const fu = /* @__PURE__ */ f("ZodPrefault", (e, t) => {
  Oi.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => rc(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function lu(e, t) {
  return new fu({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : Vt(t);
    }
  });
}
const Dn = /* @__PURE__ */ f("ZodNonOptional", (e, t) => {
  Zi.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => tc(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function du(e, t) {
  return new Dn({
    type: "nonoptional",
    innerType: e,
    ..._(t)
  });
}
const pu = /* @__PURE__ */ f("ZodCatch", (e, t) => {
  Si.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => oc(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function hu(e, t) {
  return new pu({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : hr(t)
  });
}
const mu = /* @__PURE__ */ f("ZodPipe", (e, t) => {
  Pi.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => ic(e, n, r, o), e.in = t.in, e.out = t.out;
});
function Ut(e, t) {
  return new mu({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const _u = /* @__PURE__ */ f("ZodReadonly", (e, t) => {
  Ii.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => sc(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function gu(e) {
  return new _u({
    type: "readonly",
    innerType: e
  });
}
const vu = /* @__PURE__ */ f("ZodCustom", (e, t) => {
  Ei.init(e, t), O.init(e, t), e._zod.processJSONSchema = (n, r, o) => Gs(e, n, r, o);
});
function bu(e, t = {}) {
  return /* @__PURE__ */ Ts(vu, e, t);
}
function yu(e, t) {
  return /* @__PURE__ */ js(e, t);
}
const xn = 1e5, Fn = ie().regex(/^ses[a-zA-Z0-9_-]+$/).max(200), pe = B({
  sessionID: Fn,
  markdown: ie().max(xn),
  revision: ze().int().nonnegative(),
  automatic: ke(),
  updatedAt: ze(),
  source: Nn(["manual", "automatic", "initial"]),
  lastTurn: ie().optional(),
  error: ie().optional()
}), Mt = B({ enabled: ke(), revision: ze().int().nonnegative() }), ee = B({ sessionID: Fn }), wu = Ln({
  id: "session-document",
  methods: {
    preferences: { input: B({}), output: Mt },
    configure: { input: B({ enabled: ke() }), output: Mt },
    get: { input: ee, output: pe.nullable() },
    create: { input: ee, output: pe },
    save: {
      input: ee.extend({
        revision: ze().int().nonnegative(),
        markdown: ie().max(xn),
        automatic: ke()
      }),
      output: pe,
      errors: { conflict: pe }
    },
    refresh: { input: ee, output: Wc() }
  },
  events: {
    changed: { schema: ee },
    preferencesChanged: { schema: B({}) }
  }
});
export {
  wu as SessionDocuments
};
