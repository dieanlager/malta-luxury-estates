import React, { useState, useEffect, useCallback } from 'react';
import { Upload, X, Trash2, Link, GripVertical, Edit2, List, Plus, RefreshCw, Eye, EyeOff, Star } from 'lucide-react';

const ADMIN_KEY = 'malta2026admin';

interface Form {
  title: string; affiliate_url: string; price: string; location_text: string;
  beds: string; baths: string; sqm: string; listing_type: string;
  is_seafront: boolean; has_pool: boolean; has_garage: boolean;
  description: string; features: string; images: string[];
  status: string; seo_title: string; seo_description: string;
  featured: boolean; featured_position: string; featured_badge: string;
  slug: string;
}

interface PropRow {
  id: string; title: string; price: number; location_text: string;
  listing_type: string; status: string; listing_status: string;
  images: string[]; created_at: string; featured: boolean;
  bedrooms: number; bathrooms: number; slug: string;
  area_sqm: number; description: string; seo_title: string;
  seo_description: string; affiliate_url: string;
  is_seafront: boolean; has_pool: boolean; has_garage: boolean;
  features: any; featured_position: number | null; featured_badge: string;
}

const empty: Form = {
  title: '', affiliate_url: '', price: '0', location_text: '',
  beds: '0', baths: '0', sqm: '0', listing_type: 'sale',
  is_seafront: false, has_pool: false, has_garage: false,
  description: '', features: '', images: [],
  status: 'active', seo_title: '', seo_description: '',
  featured: false, featured_position: '', featured_badge: 'exclusive',
  slug: '',
};

function genSlug(text: string) {
  return (text || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function fmtPrice(p: number) {
  if (p >= 1000000) return 'â‚¬' + (p / 1000000).toFixed(1) + 'M';
  if (p >= 1000) return 'â‚¬' + (p / 1000).toFixed(0) + 'k';
  return 'â‚¬' + p.toLocaleString();
}

// Proxy external images through server to bypass hotlink protection
const proxyImg = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('data:') || url.includes('maltaluxuryrealestate.com') || url.startsWith('/')) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};
const AdminPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editId, setEditId] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [form, setForm] = useState<Form>(empty);
  const [uploadSlug, setUploadSlug] = useState('');
  const [scraping, setScraping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [blobPreviews, setBlobPreviews] = useState<string[]>([]);
  const [props, setProps] = useState<PropRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [confirmDel, setConfirmDel] = useState<PropRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const set = (k: keyof Form, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toast = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 5000);
  };

  const fetchProps = useCallback(async () => {
    setLoadingList(true);
    try {
      const r = await fetch('/api/admin/properties', { headers: { 'x-admin-key': ADMIN_KEY } });
      if (!r.ok) throw new Error(await r.text());
      setProps(await r.json());
    } catch (e: any) { toast('Blad ladowania: ' + e.message, false); }
    finally { setLoadingList(false); }
  }, []);

  useEffect(() => { fetchProps(); }, [fetchProps]);

  const startNew = () => {
    setEditId(null); setForm(empty); setUrl(''); setUploadSlug(''); setBlobPreviews([]);
    setView('form');
  };

  const startEdit = (p: PropRow) => {
    setEditId(p.id);
    const editSlug = p.slug || genSlug((p.location_text ? p.location_text + ' ' : '') + p.title);
    setUploadSlug(editSlug);
    setBlobPreviews([]);
    setForm({
      title: p.title,
      affiliate_url: p.affiliate_url || '',
      price: String(p.price),
      location_text: p.location_text || '',
      beds: String(p.bedrooms || 0),
      baths: String(p.bathrooms || 0),
      sqm: String(p.area_sqm || 0),
      listing_type: p.listing_type || 'sale',
      is_seafront: p.is_seafront || false,
      has_pool: p.has_pool || false,
      has_garage: p.has_garage || false,
      description: p.description || '',
      features: Array.isArray(p.features) ? p.features.join(', ') : (p.features || ''),
      images: p.images || [],
      status: p.status || 'active',
      seo_title: p.seo_title || '',
      seo_description: p.seo_description || '',
      featured: !!p.featured,
      featured_position: p.featured_position ? String(p.featured_position) : '',
      featured_badge: p.featured_badge || 'exclusive',
      slug: editSlug,
    });
    setView('form');
  };

  const handleScrape = async () => {
    if (!url.trim()) { toast('Wklej URL nieruchomosci', false); return; }
    setScraping(true);
    try {
      const r = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify({ url }),
      });
      if (!r.ok) throw new Error(await r.text());
      const d = await r.json();
      const scrapedSlug = genSlug((d.location_text ? d.location_text + ' ' : '') + (d.title || 'property'));
      setUploadSlug(scrapedSlug);
      setForm({
        ...empty,
        title: d.title || '', affiliate_url: url, price: String(d.price || 0),
        location_text: d.location_text || '', beds: String(d.beds || 0),
        baths: String(d.baths || 0), sqm: String(d.sqm || 0),
        listing_type: d.listing_type || 'sale', is_seafront: !!d.is_seafront,
        has_pool: !!d.has_pool, has_garage: !!d.has_garage,
        description: d.description || '',
        features: Array.isArray(d.features) ? d.features.join(', ') : '',
        images: [], status: 'active',
        seo_title: (d.title || '').slice(0, 60),
        seo_description: (d.description || '').slice(0, 150),
        featured: false, featured_position: '', featured_badge: 'exclusive',
        slug: scrapedSlug,
      });
      setBlobPreviews([]);
      toast('Dane pobrane. Wgraj wlasne zdjecia ponizej.');
    } catch (e: any) { toast('Blad: ' + e.message, false); }
    finally { setScraping(false); }
  };

  const resizeToWebP = (file: File): Promise<Blob> => new Promise((resolve, reject) => {
    const objUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const maxW = 1920;
      const scale = img.width > maxW ? maxW / img.width : 1;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => { URL.revokeObjectURL(objUrl); blob ? resolve(blob) : reject(new Error('Blob failed')); }, 'image/webp', 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('Load failed')); };
    img.src = objUrl;
  });

  const uploadPhoto = async (blob: Blob, slug: string, filename: string): Promise<string> => {
    const r = await fetch('/api/admin/upload-photo?slug=' + encodeURIComponent(slug) + '&filename=' + encodeURIComponent(filename), {
      method: 'POST', headers: { 'x-admin-key': ADMIN_KEY, 'Content-Type': 'image/webp' }, body: blob,
    });
    if (!r.ok) throw new Error('Upload failed: ' + r.status);
    return (await r.json()).url;
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files);
    if (!fileArr.length) return;
    setUploading(true);
    const slug = uploadSlug || genSlug(form.title || 'property');
    if (!uploadSlug) setUploadSlug(slug);
    const blobs = fileArr.map(f => URL.createObjectURL(f));
    setBlobPreviews(prev => [...prev, ...blobs]);
    const serverUrls: string[] = [];
    let errors = 0;
    for (let i = 0; i < fileArr.length; i++) {
      try {
        const webp = await resizeToWebP(fileArr[i]);
        const filename = 'photo-' + Date.now() + '-' + i + '.webp';
        serverUrls.push(await uploadPhoto(webp, slug, filename));
        URL.revokeObjectURL(blobs[i]);
      } catch (e: any) { errors++; console.error('Upload error:', e); }
    }
    setBlobPreviews(prev => prev.slice(0, prev.length - blobs.length));
    setForm(f => ({ ...f, images: [...f.images, ...serverUrls] }));
    setUploading(false);
    if (errors > 0) toast('Wgrano ' + serverUrls.length + ', blad ' + errors, serverUrls.length > 0);
    else toast('Wgrano ' + serverUrls.length + ' zdjec');
  };

  const moveImage = (from: number, to: number) => {
    setForm(f => {
      const imgs = [...f.images];
      const [item] = imgs.splice(from, 1);
      imgs.splice(to, 0, item);
      return { ...f, images: imgs };
    });
  };

  const handlePublish = async () => {
    if (!form.title) { toast('Wpisz tytul', false); return; }
    if (Number(form.price) <= 0) { toast('Cena > 0', false); return; }
    if (!form.location_text) { toast('Lokalizacja wymagana', false); return; }
    setPublishing(true);
    try {
      const payload: any = {
        id: editId || undefined, title: form.title, affiliate_url: form.affiliate_url,
        price: Number(form.price), location_text: form.location_text,
        beds: Number(form.beds), baths: Number(form.baths), sqm: Number(form.sqm),
        listing_type: form.listing_type, is_seafront: form.is_seafront,
        has_pool: form.has_pool, has_garage: form.has_garage,
        description: form.description,
        features: form.features ? form.features.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        images: form.images, status: form.status,
        seo_title: form.seo_title || null, seo_description: form.seo_description || null,
        featured: form.featured,
        featured_position: form.featured_position ? Number(form.featured_position) : null,
        featured_badge: form.featured_badge || null,
        slug: form.slug || undefined,
      };
      const isEdit = !!editId;
      const r = await fetch(isEdit ? '/api/admin/update' : '/api/admin/publish', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      const d = await r.json();
      toast(isEdit ? 'Zaktualizowano!' : 'Opublikowano! ID: ' + d.id);
      setForm(empty); setUrl(''); setUploadSlug(''); setEditId(null); setBlobPreviews([]);
      await fetchProps();
      setView('list');
    } catch (e: any) { toast('Blad: ' + e.message, false); }
    finally { setPublishing(false); }
  };

  const handleDelete = async (p: PropRow) => {
    setDeleting(true);
    try {
      const r = await fetch('/api/admin/delete?id=' + p.id, { method: 'DELETE', headers: { 'x-admin-key': ADMIN_KEY } });
      if (!r.ok) throw new Error(await r.text());
      toast('Usunieto: ' + p.title);
      setConfirmDel(null);
      await fetchProps();
    } catch (e: any) { toast('Blad: ' + e.message, false); }
    finally { setDeleting(false); }
  };

  const toggleStatus = async (p: PropRow) => {
    const newStatus = (p.status === 'active' || p.listing_status === 'active') ? 'draft' : 'active';
    try {
      const r = await fetch('/api/admin/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY },
        body: JSON.stringify({ id: p.id, title: p.title, price: p.price, location_text: p.location_text, status: newStatus, images: p.images }),
      });
      if (!r.ok) throw new Error(await r.text());
      toast(newStatus === 'active' ? 'Aktywowano' : 'Ukryto');
      await fetchProps();
    } catch (e: any) { toast('Blad: ' + e.message, false); }
  };

  const inp = 'w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none text-sm';
  const card = 'bg-slate-800 border border-slate-700 rounded-xl p-6 mb-4';
  const lbl = 'block text-slate-300 text-xs font-semibold uppercase tracking-wide mb-1';

  return (
    <div className="min-h-screen bg-slate-900 pt-28 pb-10 px-4">
      {msg && (
        <div className={'fixed top-4 right-4 z-50 max-w-sm px-5 py-3 rounded-lg text-white font-medium shadow-lg text-sm ' + (msg.ok ? 'bg-emerald-600' : 'bg-red-600')}>
          {msg.text}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400 mt-1 text-sm">Malta Luxury Real Estate</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setView('list'); fetchProps(); }} className={'px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition ' + (view === 'list' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600')}>
              <List size={15} /> Moje oferty ({props.length})
            </button>
            <button onClick={startNew} className={'px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition ' + (view === 'form' && !editId ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600')}>
              <Plus size={15} /> Nowa oferta
            </button>
          </div>
        </div>

        {view === 'list' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-sm">{props.length} ofert w bazie</p>
              <button onClick={fetchProps} disabled={loadingList} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition">
                <RefreshCw size={13} className={loadingList ? 'animate-spin' : ''} /> Odswiez
              </button>
            </div>
            {loadingList && <p className="text-slate-400 text-sm text-center py-8">Ladowanie...</p>}
            {!loadingList && props.length === 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                <p className="text-slate-400 text-sm mb-4">Brak ofert. Dodaj pierwsza nieruchomosc!</p>
                <button onClick={startNew} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-sm transition">+ Nowa oferta</button>
              </div>
            )}
            <div className="space-y-3">
              {props.map(p => {
                const isActive = p.status === 'active' || p.listing_status === 'active';
                const thumb = p.images?.[0];
                return (
                  <div key={p.id} className="bg-slate-800 border border-slate-700 rounded-xl flex overflow-hidden hover:border-slate-500 transition">
                    <div className="w-24 h-20 flex-shrink-0 bg-slate-700">
                      {thumb
                        ? <img src={proxyImg(thumb)} alt="" className="w-full h-full object-cover bg-slate-700" onError={(e:any) => { (e.target as HTMLImageElement).style.opacity="0.3"; }} />
                        : <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">Brak</div>}
                    </div>
                    <div className="flex-1 px-4 py-3 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{p.title}</p>
                          <p className="text-slate-400 text-xs">{p.location_text} &bull; {fmtPrice(p.price)} &bull; {p.listing_type === 'rent' ? 'Wynajem' : 'Sprzedaz'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (isActive ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-700 text-slate-400')}>
                              {isActive ? 'Aktywna' : 'Ukryta'}
                            </span>
                            {p.featured && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900 text-amber-300 flex items-center gap-1"><Star size={9} /> Wyrozniona</span>}
                            <span className="text-slate-600 text-xs">{new Date(p.created_at).toLocaleDateString('pl-PL')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => toggleStatus(p)} title={isActive ? 'Ukryj' : 'Aktywuj'} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition">
                            {isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button onClick={() => startEdit(p)} title="Edytuj" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => setConfirmDel(p)} title="Usun" className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'form' && (
          <div>
            {editId && (
              <div className="mb-4 px-4 py-3 bg-amber-900 bg-opacity-40 border border-amber-700 rounded-xl text-amber-300 text-sm flex items-center gap-2">
                <Edit2 size={14} /> Tryb edycji oferty.
                <button onClick={() => { setView('list'); setEditId(null); }} className="ml-auto text-xs underline">Anuluj</button>
              </div>
            )}

            {!editId && (
              <div className={card}>
                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">Step 1 - Wklej URL oferty</p>
                <p className="text-slate-400 text-sm mb-4">Pobiera dane automatycznie z Alliance.mt lub innej strony.</p>
                <div className="flex gap-2">
                  <input type="url" placeholder="https://alliance.mt/property/..." value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleScrape()} className={inp + ' flex-1'} />
                  <button onClick={handleScrape} disabled={scraping} className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold rounded text-sm transition flex items-center gap-2">
                    <Link size={14} />
                    {scraping ? 'Pobieranie...' : 'Scrape'}
                  </button>
                </div>
              </div>
            )}

            <div className={card}>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">{editId ? 'Edytuj dane' : 'Step 2 - Szczegoly oferty'}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className={lbl}>Tytul</label>
                  <input type="text" value={form.title} onChange={e => {
                    const t = e.target.value;
                    setForm(f => ({
                      ...f,
                      title: t,
                      seo_title: f.seo_title === f.title.slice(0, 60) || !f.seo_title ? t.slice(0, 60) : f.seo_title,
                      slug: genSlug((f.location_text ? f.location_text + ' ' : '') + t),
                    }));
                  }} placeholder="2-bedroom apartment in Sliema..." className={inp} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>URL slug <span className="text-slate-500 font-normal normal-case tracking-normal">(auto-generowany, mozesz edytowac)</span></label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs whitespace-nowrap">/properties/</span>
                    <input
                      className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                      value={form.slug || ''}
                      onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') }))}
                      placeholder="auto-generated-from-location-title"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Affiliate URL</label>
                  <input type="url" value={form.affiliate_url} onChange={e => set('affiliate_url', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Cena (EUR)</label>
                  <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Lokalizacja</label>
                  <input type="text" value={form.location_text} onChange={e => set('location_text', e.target.value)} placeholder="Sliema, Malta" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Sypialnie</label>
                  <input type="number" value={form.beds} onChange={e => set('beds', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Lazienki</label>
                  <input type="number" value={form.baths} onChange={e => set('baths', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Powierzchnia m2</label>
                  <input type="number" value={form.sqm} onChange={e => set('sqm', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Typ</label>
                  <select value={form.listing_type} onChange={e => set('listing_type', e.target.value)} className={inp}>
                    <option value="sale">Na sprzedaz</option>
                    <option value="rent">Wynajem</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-4">
                {([['is_seafront', 'Sea View / Seafront'], ['has_pool', 'Basen'], ['has_garage', 'Garaz / Parking']] as [keyof Form, string][]).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
                    <input type="checkbox" checked={form[k] as boolean} onChange={e => set(k, e.target.checked)} className="accent-amber-500" />
                    {label}
                  </label>
                ))}
              </div>

              <div className="mb-4">
                <label className={lbl}>Opis</label>
                <textarea value={form.description} onChange={e => {
                  const t = e.target.value;
                  setForm(f => ({
                    ...f, description: t,
                    seo_description: f.seo_description === f.description.slice(0, 150) || !f.seo_description ? t.slice(0, 150) : f.seo_description,
                  }));
                }} rows={5} className={inp} />
              </div>

              <div className="mb-4">
                <label className={lbl}>Cechy (przecinek)</label>
                <input type="text" value={form.features} onChange={e => set('features', e.target.value)} placeholder="Sea Views, Garage, En-suite, Air Conditioning" className={inp} />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={lbl}>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} className={inp}>
                    <option value="active">Aktywna (widoczna)</option>
                    <option value="draft">Draft (ukryta)</option>
                    <option value="paused">Wstrzymana</option>
                  </select>
                </div>
                <div></div>
                <div className="col-span-2">
                  <label className={lbl}>SEO Title ({form.seo_title.length}/60)</label>
                  <input type="text" maxLength={60} value={form.seo_title} onChange={e => set('seo_title', e.target.value)} placeholder="Dla Google..." className={inp} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>SEO Description ({form.seo_description.length}/150)</label>
                  <textarea maxLength={150} value={form.seo_description} onChange={e => set('seo_description', e.target.value)} rows={2} className={inp} />
                </div>
              </div>

              <div className="border border-slate-600 rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="accent-amber-500 w-4 h-4" />
                  <span className="text-white font-semibold text-sm">Wyrozniona oferta (Featured)</span>
                </label>
                {form.featured && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={lbl}>Pozycja (1 = pierwsza)</label>
                      <input type="number" min="1" value={form.featured_position} onChange={e => set('featured_position', e.target.value)} placeholder="1" className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Badge</label>
                      <select value={form.featured_badge} onChange={e => set('featured_badge', e.target.value)} className={inp}>
                        <option value="exclusive">Exclusive</option>
                        <option value="premium">Premium</option>
                        <option value="new">New</option>
                        <option value="hot-deal">Hot Deal</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={card}>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">{editId ? 'Zdjecia' : 'Step 3 - Zdjecia'}</p>
              <p className="text-slate-400 text-sm mb-4">
                Wgrywane od razu jako WebP. Przeciagnij kafelki aby zmienic kolejnosc.
                {uploading && <span className="text-amber-400 ml-2">Wgrywanie...</span>}
              </p>
              <label
                className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-slate-600 rounded-lg hover:border-amber-500 cursor-pointer transition mb-4"
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files); }}
              >
                <Upload size={24} className="text-slate-400" />
                <span className="text-slate-300 text-sm">Przeciagnij zdjecia lub kliknij</span>
                <span className="text-slate-500 text-xs">JPG, PNG, HEIC â€” resize do 1920px WebP</span>
                <input type="file" multiple accept="image/*" onChange={e => { if (e.target.files) processFiles(e.target.files); }} disabled={uploading} className="hidden" />
              </label>

              {(form.images.length > 0 || blobPreviews.length > 0) && (
                <div>
                  <p className="text-slate-400 text-xs mb-2">Przeciagnij aby zmienic kolejnosc. Pierwsze = okladka.</p>
                  <div className="grid grid-cols-4 gap-2">
                    {form.images.map((img, i) => (
                      <div
                        key={img + i}
                        draggable
                        onDragStart={() => setDragIdx(i)}
                        onDragOver={e => { e.preventDefault(); setDragOver(i); }}
                        onDrop={e => { e.preventDefault(); if (dragIdx !== null && dragIdx !== i) moveImage(dragIdx, i); setDragIdx(null); setDragOver(null); }}
                        onDragEnd={() => { setDragIdx(null); setDragOver(null); }}
                        className={'relative group cursor-grab rounded-lg overflow-hidden border-2 transition ' + (dragOver === i ? 'border-amber-400 scale-105' : 'border-transparent')}
                      >
                        <img src={proxyImg(img)} alt="" className="w-full h-20 object-cover bg-slate-700" onError={(e:any) => { (e.target as HTMLImageElement).style.opacity="0.3"; }} />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                          <GripVertical size={16} className="text-white opacity-0 group-hover:opacity-100 transition" />
                        </div>
                        <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))} className="absolute top-1 right-1 bg-black bg-opacity-70 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition z-10">
                          <X size={11} className="text-white" />
                        </button>
                        {i === 0 && <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-xs px-1 rounded text-[10px]">Cover</span>}
                        <span className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-[10px] px-1 rounded">{i + 1}</span>
                      </div>
                    ))}
                    {blobPreviews.map((blob, i) => (
                      <div key={'blob-' + i} className="relative rounded-lg overflow-hidden border-2 border-amber-600 opacity-60">
                        <img src={blob} alt="" className="w-full h-20 object-cover" referrerPolicy="no-referrer" onError={(e:any) => { e.target.style.background="#374151"; e.target.src=""; }} />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                          <span className="text-white text-xs">Wgrywanie...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={card}>
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">{editId ? 'Zapisz' : 'Step 4 - Publikuj'}</p>
              {form.images.length === 0 && !uploading && (
                <p className="text-yellow-500 text-xs mb-3">Uwaga: brak zdjec.</p>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setView('list'); setEditId(null); }} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium text-sm transition">
                  Anuluj
                </button>
                <button onClick={handlePublish} disabled={publishing || uploading} className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-lg text-base transition">
                  {publishing ? 'Zapisywanie...' : editId ? 'Zapisz zmiany' : 'Publikuj oferte'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {confirmDel && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-white font-bold text-lg mb-2">Usunac oferte?</h3>
            <p className="text-slate-300 text-sm mb-6"><strong>{confirmDel.title}</strong><br /><span className="text-slate-500 text-xs">Tej operacji nie mozna cofnac.</span></p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition">Anuluj</button>
              <button onClick={() => handleDelete(confirmDel)} disabled={deleting} className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded font-bold transition flex items-center justify-center gap-2">
                <Trash2 size={14} />
                {deleting ? 'Usuwanie...' : 'Usun'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

