import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Lock, LogOut, Plus, Save, Trash2 } from 'lucide-react';
import { COURSES, SECTIONS } from '../data/courses';
import {
  DEFAULT_CONTENT,
  LIST_TITLES,
  mergeContent,
  setContent,
  type Content,
  type LinkItem,
  type ListKey,
  type SectionKey,
} from '../data/content';

/**
 * ====== لوحة الأدمن (مخفية: #/admin، مش مربوطة بأي رابط بالموقع) ======
 *
 * الموقع ثابت على GitHub Pages، فمافي سيرفر. الحماية الحقيقية هي "توكن" GitHub:
 *  - بتعمل توكن (Fine-grained) إله صلاحية Contents: Read and write على مستودع الموقع بس.
 *  - أول مرة بتدخل التوكن + بتختار باسوورد. التوكن بينحفظ بمتصفحك مشفّر بالباسوورد (AES-GCM).
 *  - بعدها بتدخل بالباسوورد بس. أي حدا بيفتح الصفحة بدون التوكن ما بيقدر يعدّل شي.
 *  - الحفظ = commit على ملف public/content.json، والموقع بيتحدّث بعد ~1-2 دقيقة.
 */

const STORE_KEY = 'sm-admin-v1';
const enc = new TextEncoder();
const dec = new TextDecoder();

type Settings = { repo: string; branch: string; path: string };
type Stored = Settings & { salt: string; iv: string; ct: string };

// ---------- تشفير التوكن ----------
const toB64 = (u: Uint8Array) => {
  let s = '';
  u.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
};
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function deriveKey(password: string, salt: Uint8Array) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 250000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptToken(token: string, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, enc.encode(token)));
  return { salt: toB64(salt), iv: toB64(iv), ct: toB64(ct) };
}

async function decryptToken(s: Stored, password: string) {
  const key = await deriveKey(password, fromB64(s.salt));
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(s.iv) as BufferSource }, key, fromB64(s.ct) as BufferSource);
  return dec.decode(pt);
}

function readStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

// ---------- GitHub API ----------
const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
});
const fileUrl = (s: Settings) => `https://api.github.com/repos/${s.repo}/contents/${s.path}`;

async function checkRepo(s: Settings, token: string) {
  const r = await fetch(`https://api.github.com/repos/${s.repo}`, { headers: headers(token), cache: 'no-store' });
  if (r.status === 401) throw new Error('التوكن غلط أو منتهي.');
  if (r.status === 404) throw new Error('المستودع مش موجود، أو التوكن ما معه صلاحية عليه. تأكد من الاسم (owner/repo).');
  if (!r.ok) throw new Error(`خطأ من GitHub (${r.status}).`);
  const j = await r.json();
  if (j.permissions && !j.permissions.push) throw new Error('التوكن ما معه صلاحية كتابة (Contents: Read and write).');
}

async function loadFile(s: Settings, token: string): Promise<{ sha?: string; content: Content }> {
  const r = await fetch(`${fileUrl(s)}?ref=${encodeURIComponent(s.branch)}`, { headers: headers(token), cache: 'no-store' });
  if (r.status === 404) return { content: DEFAULT_CONTENT };
  if (!r.ok) throw new Error(`تعذّر تحميل المحتوى (${r.status}).`);
  const j = await r.json();
  const text = dec.decode(fromB64(String(j.content).replace(/\s/g, '')));
  return { sha: j.sha, content: mergeContent(JSON.parse(text)) };
}

async function saveFile(s: Settings, token: string, content: Content, sha?: string): Promise<string> {
  const body = {
    message: 'Update site content from admin panel',
    content: toB64(enc.encode(JSON.stringify(content, null, 2) + '\n')),
    branch: s.branch,
    ...(sha ? { sha } : {}),
  };
  const r = await fetch(fileUrl(s), {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (r.status === 409 || r.status === 422) throw new Error('الملف تغيّر على GitHub من مكان ثاني. حدّث الصفحة وحمّل المحتوى من جديد.');
  if (r.status === 401 || r.status === 403 || r.status === 404) throw new Error('GitHub رفض الحفظ: تأكد من صلاحيات التوكن.');
  if (!r.ok) throw new Error(`فشل الحفظ (${r.status}).`);
  const j = await r.json();
  return j.content.sha as string;
}

// ---------- تنظيف الروابط قبل الحفظ ----------
function cleanHref(v: string): string {
  const t = (v ?? '').trim();
  if (!t) return '';
  if (/^(javascript|data|vbscript):/i.test(t)) throw new Error('رابط غير مسموح: ' + t);
  if (/^(https?:\/\/|#|\/|mailto:|tel:)/i.test(t)) return t;
  return 'https://' + t;
}

function cleanContent(c: Content): Content {
  const courses: Content['courses'] = {};
  Object.entries(c.courses).forEach(([id, links]) => {
    const out: Partial<Record<SectionKey, string>> = {};
    Object.entries(links).forEach(([k, v]) => {
      const h = cleanHref(v ?? '');
      if (h) out[k as SectionKey] = h;
    });
    if (Object.keys(out).length) courses[id] = out;
  });
  const lists = { ...c.lists };
  (Object.keys(lists) as ListKey[]).forEach((k) => {
    lists[k] = lists[k]
      .filter((i) => i.label.trim())
      .map((i) => ({ label: i.label.trim(), href: cleanHref(i.href), ...(i.desc?.trim() ? { desc: i.desc.trim() } : {}) }));
  });
  return {
    courses,
    hub: { moodle: cleanHref(c.hub.moodle), portal: cleanHref(c.hub.portal) },
    social: {
      youtube: cleanHref(c.social.youtube),
      whatsapp: cleanHref(c.social.whatsapp),
      instagram: cleanHref(c.social.instagram),
      facebook: cleanHref(c.social.facebook),
    },
    lists,
  };
}

// ---------- الصفحة ----------
export default function AdminPage() {
  const [stored, setStored] = useState<Stored | null>(readStored);
  const [session, setSession] = useState<{ token: string; settings: Settings } | null>(null);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'لوحة الإدارة';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    return () => {
      document.title = prevTitle;
      meta.remove();
    };
  }, []);

  return (
    <div dir="rtl" lang="ar" className="sm-page w-full" style={{ minHeight: '100vh' }}>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="sm-title text-4xl sm:text-5xl">لوحة الإدارة</h1>
        <div className="mt-6">
          {session ? (
            <Editor session={session} onLogout={() => setSession(null)} />
          ) : stored ? (
            <Login
              stored={stored}
              onOk={(token) => setSession({ token, settings: { repo: stored.repo, branch: stored.branch, path: stored.path } })}
              onReset={() => {
                if (confirm('هيك بتنمسح إعدادات اللوحة من هالمتصفح (بتحتاج تدخل التوكن من جديد). متأكد؟')) {
                  localStorage.removeItem(STORE_KEY);
                  setStored(null);
                }
              }}
            />
          ) : (
            <Setup
              onDone={(s, token) => {
                setStored(readStored());
                setSession({ token, settings: { repo: s.repo, branch: s.branch, path: s.path } });
              }}
            />
          )}
        </div>
        <p className="mt-10 text-sm font-semibold" style={{ color: 'var(--sm-mid)' }}>
          <a href="#/" style={{ color: 'inherit' }}>← رجوع للموقع</a>
        </p>
      </div>
    </div>
  );
}

function Notice({ kind, children }: { kind: 'err' | 'ok' | 'info'; children: React.ReactNode }) {
  const color = kind === 'err' ? '#b3261e' : kind === 'ok' ? '#1b7a3d' : 'var(--sm-mid)';
  return (
    <div className="sm-card" style={{ borderColor: color, boxShadow: 'none', color, fontWeight: 700, fontSize: 15 }}>
      {children}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs" style={{ color: 'var(--sm-mid)' }}>{hint}</span>}
    </label>
  );
}

// ---------- أول مرة: إعداد التوكن والباسوورد ----------
function Setup({ onDone }: { onDone: (s: Settings, token: string) => void }) {
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [token, setToken] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    setErr('');
    const r = repo.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/\/$/, '');
    if (!/^[\w.-]+\/[\w.-]+$/.test(r)) return setErr('اكتب المستودع بشكل owner/repo.');
    if (!token.trim()) return setErr('أدخل التوكن.');
    if (pw.length < 8) return setErr('الباسوورد لازم يكون 8 أحرف أو أكثر.');
    if (pw !== pw2) return setErr('الباسوورد وتأكيده مش متطابقين.');
    if (!window.crypto?.subtle) return setErr('المتصفح ما بيدعم التشفير (لازم الموقع يكون على https).');
    setBusy(true);
    try {
      const s: Settings = { repo: r, branch: branch.trim() || 'main', path: 'public/content.json' };
      await checkRepo(s, token.trim());
      const e = await encryptToken(token.trim(), pw);
      localStorage.setItem(STORE_KEY, JSON.stringify({ ...s, ...e } satisfies Stored));
      onDone(s, token.trim());
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'صار خطأ.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4">
      <Notice kind="info">
        <span>
          إعداد أول مرة. الحماية الحقيقية هي التوكن: بدونه حدا ما بيقدر يحفظ تعديل. الباسوورد بيشفّر التوكن على متصفحك بس.
        </span>
      </Notice>
      <details className="sm-card" style={{ display: 'block', boxShadow: 'none' }}>
        <summary className="cursor-pointer font-bold">كيف بعمل التوكن؟</summary>
        <ol className="mt-3 list-decimal pr-5 text-sm" style={{ lineHeight: 2 }}>
          <li>GitHub ← Settings ← Developer settings ← Personal access tokens ← Fine-grained tokens ← Generate new token.</li>
          <li>Repository access: Only select repositories، واختر مستودع الموقع.</li>
          <li>Permissions ← Repository permissions ← Contents: Read and write.</li>
          <li>حط مدة انتهاء (مثلاً سنة)، وانسخ التوكن وألصقه تحت.</li>
        </ol>
      </details>
      <Field label="المستودع" hint="مثال: username/smurfs-site">
        <input className="sm-input" dir="ltr" value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="owner/repo" />
      </Field>
      <Field label="الفرع (branch)">
        <input className="sm-input" dir="ltr" value={branch} onChange={(e) => setBranch(e.target.value)} />
      </Field>
      <Field label="توكن GitHub">
        <input className="sm-input" dir="ltr" type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_..." />
      </Field>
      <Field label="اختر باسوورد للوحة">
        <input className="sm-input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
      </Field>
      <Field label="أكّد الباسوورد">
        <input className="sm-input" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
      </Field>
      {err && <Notice kind="err">{err}</Notice>}
      <div>
        <button type="button" className="sm-btn" disabled={busy} onClick={submit}>
          <Lock size={18} /> {busy ? 'جاري التحقق...' : 'تفعيل ودخول'}
        </button>
      </div>
    </div>
  );
}

// ---------- تسجيل الدخول ----------
function Login({ stored, onOk, onReset }: { stored: Stored; onOk: (token: string) => void; onReset: () => void }) {
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!pw || busy) return;
    setBusy(true);
    setErr('');
    try {
      onOk(await decryptToken(stored, pw));
    } catch {
      await new Promise((r) => setTimeout(r, 1200)); // تبطيء المحاولات الخاطئة
      setErr('الباسوورد غلط.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <Field label="الباسوورد">
        <input className="sm-input" type="password" autoFocus autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
      </Field>
      {err && <Notice kind="err">{err}</Notice>}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="sm-btn" disabled={busy || !pw}>
          <Lock size={18} /> {busy ? '...' : 'دخول'}
        </button>
        <button type="button" className="text-sm font-bold underline" style={{ color: 'var(--sm-mid)' }} onClick={onReset}>
          نسيت الباسوورد / إعادة الإعداد
        </button>
      </div>
    </form>
  );
}

// ---------- المحرّر ----------
type Tab = 'courses' | 'hub' | 'social' | ListKey;
const TABS: { key: Tab; label: string }[] = [
  { key: 'courses', label: 'روابط المواد' },
  { key: 'hub', label: 'الرئيسية' },
  { key: 'social', label: 'السوشيال' },
  ...(Object.keys(LIST_TITLES) as ListKey[]).map((k) => ({ key: k as Tab, label: LIST_TITLES[k] })),
];

function Editor({ session, onLogout }: { session: { token: string; settings: Settings }; onLogout: () => void }) {
  const { token, settings } = session;
  const [draft, setDraft] = useState<Content>(DEFAULT_CONTENT);
  const [base, setBase] = useState(JSON.stringify(DEFAULT_CONTENT));
  const [sha, setSha] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'err' | 'ok'; text: string } | null>(null);
  const [tab, setTab] = useState<Tab>('courses');

  useEffect(() => {
    let alive = true;
    loadFile(settings, token)
      .then((r) => {
        if (!alive) return;
        setDraft(r.content);
        setBase(JSON.stringify(r.content));
        setSha(r.sha);
      })
      .catch((e) => alive && setMsg({ kind: 'err', text: e instanceof Error ? e.message : 'تعذّر التحميل.' }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [settings, token]);

  const dirty = JSON.stringify(draft) !== base;
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const save = async () => {
    setMsg(null);
    setBusy(true);
    try {
      const cleaned = cleanContent(draft);
      const newSha = await saveFile(settings, token, cleaned, sha);
      setSha(newSha);
      setDraft(cleaned);
      setBase(JSON.stringify(cleaned));
      setContent(cleaned);
      setMsg({ kind: 'ok', text: 'انحفظ على GitHub. التغيير بيظهر للزوار بعد دقيقة أو دقيقتين (لما يخلص النشر).' });
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof Error ? e.message : 'فشل الحفظ.' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Notice kind="info">جاري تحميل المحتوى...</Notice>;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="sm-btn" disabled={busy || !dirty} onClick={save}>
          <Save size={18} /> {busy ? 'جاري الحفظ...' : 'حفظ التعديلات'}
        </button>
        <button
          type="button"
          className="sm-btn sm-btn-ghost"
          onClick={() => {
            if (!dirty || confirm('في تعديلات ما انحفظت. تطلع بدون حفظ؟')) onLogout();
          }}
        >
          <LogOut size={18} /> خروج
        </button>
        {dirty && <span className="text-sm font-bold" style={{ color: '#b3261e' }}>● تعديلات غير محفوظة</span>}
      </div>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className="sm-nav-link"
            aria-current={tab === t.key ? 'page' : undefined}
            style={{ border: '2px solid var(--sm-blue)', background: tab === t.key ? undefined : '#fff', cursor: 'pointer' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'courses' && <CoursesTab draft={draft} setDraft={setDraft} />}
      {tab === 'hub' && (
        <div className="grid gap-4">
          <Field label="رابط منصة مودل">
            <input className="sm-input" dir="ltr" value={draft.hub.moodle} onChange={(e) => setDraft({ ...draft, hub: { ...draft.hub, moodle: e.target.value } })} placeholder="https://..." />
          </Field>
          <Field label="رابط بوابة الطالب">
            <input className="sm-input" dir="ltr" value={draft.hub.portal} onChange={(e) => setDraft({ ...draft, hub: { ...draft.hub, portal: e.target.value } })} placeholder="https://..." />
          </Field>
        </div>
      )}
      {tab === 'social' && (
        <div className="grid gap-4">
          {(
            [
              ['youtube', 'يوتيوب'],
              ['whatsapp', 'واتساب'],
              ['instagram', 'انستغرام'],
              ['facebook', 'فيسبوك'],
            ] as const
          ).map(([k, label]) => (
            <Field key={k} label={label} hint="اتركه فاضي لإخفاء الرابط (بتضل الأيقونة باهتة).">
              <input className="sm-input" dir="ltr" value={draft.social[k]} onChange={(e) => setDraft({ ...draft, social: { ...draft.social, [k]: e.target.value } })} placeholder="https://..." />
            </Field>
          ))}
        </div>
      )}
      {tab !== 'courses' && tab !== 'hub' && tab !== 'social' && (
        <ListTab listKey={tab} draft={draft} setDraft={setDraft} />
      )}
    </div>
  );
}

function CoursesTab({ draft, setDraft }: { draft: Content; setDraft: (c: Content) => void }) {
  const [id, setId] = useState(COURSES[0]?.id ?? '');
  const links = draft.courses[id] ?? {};
  const filled = useMemo(() => Object.values(draft.courses).filter((l) => Object.values(l).some(Boolean)).length, [draft.courses]);

  return (
    <div className="grid gap-4">
      <Field label="المادة" hint={`${filled} من ${COURSES.length} مادة فيها روابط.`}>
        <select className="sm-input" value={id} onChange={(e) => setId(e.target.value)}>
          {COURSES.map((c) => (
            <option key={c.id} value={c.id}>
              {Object.values(draft.courses[c.id] ?? {}).some(Boolean) ? '✓ ' : ''}
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      {SECTIONS.map((s) => (
        <Field key={s.key} label={s.title}>
          <input
            className="sm-input"
            dir="ltr"
            value={links[s.key] ?? ''}
            placeholder="https://..."
            onChange={(e) => setDraft({ ...draft, courses: { ...draft.courses, [id]: { ...links, [s.key]: e.target.value } } })}
          />
        </Field>
      ))}
    </div>
  );
}

function ListTab({ listKey, draft, setDraft }: { listKey: ListKey; draft: Content; setDraft: (c: Content) => void }) {
  const items = draft.lists[listKey];
  const set = (next: LinkItem[]) => setDraft({ ...draft, lists: { ...draft.lists, [listKey]: next } });
  const update = (i: number, patch: Partial<LinkItem>) => set(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    set(next);
  };

  return (
    <div className="grid gap-4">
      {items.length === 0 && <Notice kind="info">القائمة فاضية. اضغط "إضافة عنصر".</Notice>}
      {items.map((it, i) => (
        <div key={i} className="sm-card" style={{ display: 'grid', gap: 10, boxShadow: 'none' }}>
          <input className="sm-input" value={it.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="الاسم" />
          <input className="sm-input" value={it.desc ?? ''} onChange={(e) => update(i, { desc: e.target.value })} placeholder="وصف قصير (اختياري)" />
          <input className="sm-input" dir="ltr" value={it.href} onChange={(e) => update(i, { href: e.target.value })} placeholder="https://..." />
          <div className="flex gap-2">
            <button type="button" className="sm-btn sm-btn-ghost" style={{ padding: '6px 12px' }} onClick={() => move(i, -1)} aria-label="فوق">
              <ArrowUp size={16} />
            </button>
            <button type="button" className="sm-btn sm-btn-ghost" style={{ padding: '6px 12px' }} onClick={() => move(i, 1)} aria-label="تحت">
              <ArrowDown size={16} />
            </button>
            <button type="button" className="sm-btn sm-btn-ghost" style={{ padding: '6px 12px', color: '#b3261e' }} onClick={() => set(items.filter((_, j) => j !== i))} aria-label="حذف">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      <div>
        <button type="button" className="sm-btn" onClick={() => set([...items, { label: '', href: '' }])}>
          <Plus size={18} /> إضافة عنصر
        </button>
      </div>
    </div>
  );
}
