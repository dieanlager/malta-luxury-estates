'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Upload, X, Trash2, Link2, GripVertical, Edit2, Plus,
  RefreshCw, Eye, EyeOff, Star, Loader2, ArrowLeft, ChevronLeft, LogOut,
} from 'lucide-react';

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
  if (p >= 1_000_000) return 'â‚¬' + (p / 1_000_000).toFixed(1) + 'M';
  if (p >= 1_000) return 'â‚¬' + Math.round(p / 1_000) + 'k';
  return 'â‚¬' + p.toLocaleString('en-GB');
}

// Supabase storage URLs are public â€” load directly. Only proxy scraped external images.
function proxyImg(url: string): string {
  if (!url) return '';
  if (
    url.startsWith('data:') ||
    url.startsWith('/') ||
    url.includes('supabase.co') ||
    url.includes('maltaluxuryrealestate.com')
  ) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

// Strip [AFFILIATE_URL:â€¦] and [FEATURES:â€¦] annotations stored inside description column
function parseDescription(raw: string, affiliateFallback: string): { desc: string; affiliateUrl: string; features: string } {
  let s = raw || '';
  let affiliateUrl = affiliateFallback || '';

  const affMatch = s.match(/^\[AFFILIATE_URL:(https?:\/\/[^\]]+)\]\n?/);
  if (affMatch) { affiliateUrl = affMatch[1]; s = s.replace(affMatch[0], ''); }

  const featMatch = s.match(/\[FEATURES:([^\]]+)\]\n?/);
  let features = '';
  if (featMatch) { features = featMatch[1]; s = s.replace(featMatch[0], ''); }

  return { desc: s.trim(), affiliateUrl, features };
}

// â”€â”€â”€ Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const inp = 'w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:border-gold/50 focus:outline-none text-sm transition-colors';
const lbl = 'block text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1.5';
const card = 'glass-card border border-white/10 rounded-2xl p-6 mb-4';
const goldBtn = 'flex items-center justify-center gap-2 px-5 py-2.5 bg-gold text-luxury-black font-bold rounded-xl hover:bg-white transition-colors text-sm disabled:opacity-40';
const ghostBtn = 'flex items-center justify-center gap-2 px-5 py-2.5 border border-white/10 text-white/60 font-medium rounded-xl hover:border-white/20 hover:text-white transition-colors text-sm';

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
  const [adminKey, setAdminKey] = useState<string>(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem('mlre_admin_key') || '' : ''
  );
  const [keyInput, setKeyInput] = useState('');

  const set = (k: keyof Form, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toast = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 5000); };

  const fetchProps = useCallback(async () => {
    setLoadingList(true);
    try {
      const r = await fetch('/api/admin/properties', { headers: { 'x-admin-key': adminKey } });
      if (!r.ok) throw new Error(await r.text());
      setProps(await r.json());
    } catch (e: any) { toast('BÅ‚Ä…d Å‚adowania: ' + e.message, false); }
    finally { setLoadingList(false); }
  }, [adminKey]);

  useEffect(() => { if (adminKey) fetchProps(); }, [fetchProps, adminKey]);

  // Handle ?edit=ID URL param â€” open edit form directly
  useEffect(() => {
    if (!adminKey || props.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const editParam = params.get('edit');
    if (editParam) {
      const found = props.find(p => p.id === editParam);
      if (found) startEdit(found);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props, adminKey]);

  const startNew = () => {
    setEditId(null); setForm(empty); setUrl(''); setUploadSlug(''); setBlobPreviews([]);
    setView('form');
  };

  const startEdit = (p: PropRow) => {
    setEditId(p.id);
    const editSlug = p.slug || genSlug((p.location_text ? p.location_text + ' ' : '') + p.title);
    setUploadSlug(editSlug);
    setBlobPreviews([]);

    // Strip [AFFILIATE_URL:â€¦] and [FEATURES:â€¦] from raw description
    const { desc, affiliateUrl, features: parsedFeatures } = parseDescription(p.description || '', p.affiliate_url || '');

    // Features may also come from the DB features column
    const featureStr = parsedFeatures ||
      (Array.isArray(p.features) ? p.features.join(', ') : (p.features || ''));

    setForm({
      title: p.title,
      affiliate_url: affiliateUrl,
      price: String(p.price),
      location_text: p.location_text || '',
      beds: String(p.bedrooms || 0),
      baths: String(p.bathrooms || 0),
      sqm: String(p.area_sqm || 0),
      listing_type: p.listing_type || 'sale',
      is_seafront: p.is_seafront || false,
      has_pool: p.has_pool || false,
      has_garage: p.has_garage || false,
      description: desc,
      features: featureStr,
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
    if (!url.trim()) { toast('Wklej URL nieruchomoÅ›ci', false); return; }
    setScraping(true);
    try {
      const r = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
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
        listing_type: 'sale',
        is_seafront: !!d.is_seafront, has_pool: !!d.has_pool, has_garage: !!d.has_garage,
        description: d.description || '',
        features: Array.isArray(d.features) ? d.features.join(', ') : '',
        images: [], status: 'active',
        seo_title: (d.title || '').slice(0, 60),
        seo_description: (d.description || '').slice(0, 150),
        featured: false, featured_position: '', featured_badge: 'exclusive',
        slug: scrapedSlug,
      });
      setBlobPreviews([]);
      toast('Dane pobrane. Wgraj wÅ‚asne zdjÄ™cia poniÅ¼ej.');
    } catch (e: any) { toast('BÅ‚Ä…d: ' + e.message, false); }
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
      canvas.toBlob(
        blob => { URL.revokeObjectURL(objUrl); blob ? resolve(blob) : reject(new Error('Blob failed')); },
        'image/webp', 0.82
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error('Load failed')); };
    img.src = objUrl;
  });

  const uploadPhoto = async (blob: Blob, slug: string, filename: string): Promise<string> => {
    const r = await fetch(
      '/api/admin/upload-photo?slug=' + encodeURIComponent(slug) + '&filename=' + encodeURIComponent(filename),
      { method: 'POST', headers: { 'x-admin-key': adminKey, 'Content-Type': 'image/webp' }, body: blob }
    );
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
      } catch (e: any) { errors++; }
    }
    setBlobPreviews(prev => prev.slice(0, prev.length - blobs.length));
    setForm(f => ({ ...f, images: [...f.images, ...serverUrls] }));
    setUploading(false);
    if (errors > 0) toast('Wgrano ' + serverUrls.length + ', bÅ‚Ä…d ' + errors, serverUrls.length > 0);
    else toast('Wgrano ' + serverUrls.length + ' zdjÄ™Ä‡');
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
    if (!form.title) { toast('Wpisz tytuÅ‚', false); return; }
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
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      toast(isEdit ? 'Zaktualizowano!' : 'Opublikowano!');
      setForm(empty); setUrl(''); setUploadSlug(''); setEditId(null); setBlobPreviews([]);
      await fetchProps();
      setView('list');
    } catch (e: any) { toast('BÅ‚Ä…d: ' + e.message, false); }
    finally { setPublishing(false); }
  };

  const handleDelete = async (p: PropRow) => {
    setDeleting(true);
    try {
      const r = await fetch('/api/admin/delete?id=' + p.id, { method: 'DELETE', headers: { 'x-admin-key': adminKey } });
      if (!r.ok) throw new Error(await r.text());
      toast('UsuniÄ™to: ' + p.title);
      setConfirmDel(null);
      await fetchProps();
    } catch (e: any) { toast('BÅ‚Ä…d: ' + e.message, false); }
    finally { setDeleting(false); }
  };

  const toggleStatus = async (p: PropRow) => {
    const isActive = p.status === 'active' || p.listing_status === 'active';
    const newStatus = isActive ? 'paused' : 'active';
    try {
      const r = await fetch('/api/admin/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ id: p.id, updates: { status: newStatus, listing_status: newStatus } }),
      });
      if (!r.ok) throw new Error(await r.text());
      toast(newStatus === 'active' ? 'Aktywowano' : 'Wstrzymano');
      await fetchProps();
    } catch (e: any) { toast('BÅ‚Ä…d: ' + e.message, false); }
  };

  // â”€â”€ Auth screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (!adminKey) {
    return (
      <main className="min-h-screen bg-luxury-black flex items-center justify-center px-6">
        <div className="glass-card border border-white/10 rounded-2xl p-8 w-full max-w-sm">
          <h1 className="font-serif text-2xl text-white mb-1">Admin Panel</h1>
          <p className="text-white/60 text-sm mb-6">Malta Luxury Real Estate</p>
          <input
            type="password" value={keyInput} onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && keyInput) { sessionStorage.setItem('mlre_admin_key', keyInput); setAdminKey(keyInput); } }}
            placeholder="Admin key" autoFocus
            className={inp + ' mb-3'}
          />
          <button
            onClick={() => { if (keyInput) { sessionStorage.setItem('mlre_admin_key', keyInput); setAdminKey(keyInput); } }}
            className={goldBtn + ' w-full py-3'}
          >
            Zaloguj
          </button>
        </div>
      </main>
    );
  }

  // â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="min-h-screen bg-luxury-black pt-24 pb-16 px-4">
      {/* Toast */}
      {msg && (
        <div className={`fixed top-6 right-6 z-50 max-w-sm px-5 py-3 rounded-xl text-sm font-medium shadow-xl transition-all ${msg.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {msg.text}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-white">Admin Panel</h1>
            <p className="text-white/60 text-sm mt-1">Malta Luxury Real Estate</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setView('list'); fetchProps(); }}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition ${view === 'list' ? 'bg-gold/10 border border-gold/30 text-gold' : 'border border-white/10 text-white/50 hover:text-white hover:border-white/20'}`}
            >
              Oferty ({props.length})
            </button>
            <button
              onClick={startNew}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition ${view === 'form' && !editId ? 'bg-gold text-luxury-black' : 'bg-gold/10 border border-gold/30 text-gold hover:bg-gold hover:text-luxury-black'}`}
            >
              <Plus size={13} /> Nowa oferta
            </button>
            <button
              onClick={() => { sessionStorage.removeItem('mlre_admin_key'); setAdminKey(''); setKeyInput(''); }}
              title="Wyloguj"
              className="ml-2 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-white/60 hover:text-red-400 hover:border-red-500/30 text-xs font-bold uppercase tracking-widest transition"
            >
              <LogOut size={13} /> Wyloguj
            </button>
          </div>
        </div>

        {/* â”€â”€ LIST VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {view === 'list' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/60 text-sm tabular-nums">{props.length} ofert w bazie</p>
              <button onClick={fetchProps} disabled={loadingList} className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition">
                <RefreshCw size={12} className={loadingList ? 'animate-spin' : ''} /> OdÅ›wieÅ¼
              </button>
            </div>

            {loadingList && (
              <div className="flex items-center justify-center h-32 text-white/60">
                <Loader2 size={20} className="animate-spin mr-2" /> Åadowanieâ€¦
              </div>
            )}

            {!loadingList && props.length === 0 && (
              <div className="glass-card border border-white/10 rounded-2xl p-12 text-center">
                <p className="text-white/60 text-sm mb-4">Brak ofert. Dodaj pierwszÄ… nieruchomoÅ›Ä‡!</p>
                <button onClick={startNew} className={goldBtn}>+ Nowa oferta</button>
              </div>
            )}

            <div className="space-y-2">
              {props.map(p => {
                const isActive = p.status === 'active' || p.listing_status === 'active';
                const thumb = p.images?.[0];
                return (
                  <div key={p.id} className="glass-card border border-white/10 rounded-xl flex overflow-hidden hover:border-white/20 transition-colors">
                    <div className="w-20 h-16 flex-shrink-0 bg-white/5">
                      {thumb
                        ? <img src={proxyImg(thumb)} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.opacity = '0.2'; }} />
                        : <div className="w-full h-full flex items-center justify-center text-white/70 text-xs">â€”</div>}
                    </div>
                    <div className="flex-1 px-4 py-3 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{p.title}</p>
                          <p className="text-white/60 text-xs mt-0.5">{p.location_text} Â· {fmtPrice(p.price)} Â· {p.listing_type === 'rent' ? 'Wynajem' : 'SprzedaÅ¼'}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${isActive ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/60 border-white/10'}`}>
                            {isActive ? 'Active' : 'Paused'}
                          </span>
                          {p.featured && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/20 font-bold uppercase tracking-wider flex items-center gap-1"><Star size={8} fill="currentColor" /> Featured</span>}
                          <button onClick={() => toggleStatus(p)} title={isActive ? 'Wstrzymaj' : 'Aktywuj'} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            {isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button onClick={() => startEdit(p)} title="Edytuj" className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => setConfirmDel(p)} title="UsuÅ„" className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                            <Trash2 size={14} />
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

        {/* â”€â”€ FORM VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {view === 'form' && (
          <div>
            {/* Edit mode banner */}
            {editId && (
              <div className="mb-5 px-4 py-3 bg-gold/10 border border-gold/20 rounded-xl text-gold text-sm flex items-center gap-2">
                <Edit2 size={14} /> Tryb edycji oferty.
                <button onClick={() => { setView('list'); setEditId(null); }} className="ml-auto text-xs text-white/60 hover:text-white transition-colors underline">
                  Anuluj
                </button>
              </div>
            )}

            {/* Step 1 â€” URL Scrape (new listings only) */}
            {!editId && (
              <div className={card}>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold mb-1">Krok 1 â€” URL oferty</p>
                <p className="text-white/60 text-xs mb-4">Automatycznie pobiera dane z Alliance.mt lub innej strony partnera.</p>
                <div className="flex gap-2">
                  <input type="url" placeholder="https://alliance.mt/property/..." value={url}
                    onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleScrape()}
                    className={inp + ' flex-1'} />
                  <button onClick={handleScrape} disabled={scraping} className={goldBtn}>
                    {scraping ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                    {scraping ? 'Pobieranieâ€¦' : 'Pobierz'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 â€” Details */}
            <div className={card}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold mb-5">
                {editId ? 'Edytuj dane' : 'Krok 2 â€” SzczegÃ³Å‚y'}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Title */}
                <div className="col-span-2">
                  <label className={lbl}>TytuÅ‚</label>
                  <input type="text" value={form.title} onChange={e => {
                    const t = e.target.value;
                    setForm(f => ({
                      ...f, title: t,
                      seo_title: f.seo_title === f.title.slice(0, 60) || !f.seo_title ? t.slice(0, 60) : f.seo_title,
                      slug: genSlug((f.location_text ? f.location_text + ' ' : '') + t),
                    }));
                  }} placeholder="2-bedroom apartment in Sliemaâ€¦" className={inp} />
                </div>

                {/* Slug */}
                <div className="col-span-2">
                  <label className={lbl}>URL slug <span className="text-white/70 font-normal normal-case tracking-normal">(auto-generowany)</span></label>
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-xs whitespace-nowrap font-mono">/properties/</span>
                    <input className={inp + ' font-mono'}
                      value={form.slug || ''}
                      onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') }))}
                      placeholder="auto-generated-from-location-title"
                    />
                  </div>
                </div>

                {/* Affiliate URL â€” hidden label, internal use */}
                <div className="col-span-2">
                  <label className={lbl}>Affiliate URL <span className="text-white/70 font-normal normal-case tracking-normal">(link partnera â€” widoczny tylko w panelu)</span></label>
                  <input type="url" value={form.affiliate_url} onChange={e => set('affiliate_url', e.target.value)} className={inp} placeholder="https://alliance.mt/property/â€¦" />
                </div>

                {/* Price */}
                <div>
                  <label className={lbl}>Cena (EUR)</label>
                  <input type="number" value={form.price} onChange={e => set('price', e.target.value)} className={inp} />
                </div>

                {/* Location */}
                <div>
                  <label className={lbl}>Lokalizacja</label>
                  <input type="text" value={form.location_text} onChange={e => set('location_text', e.target.value)} placeholder="Sliema, Malta" className={inp} />
                </div>

                {/* Beds */}
                <div>
                  <label className={lbl}>Sypialnie</label>
                  <input type="number" value={form.beds} onChange={e => set('beds', e.target.value)} className={inp} />
                </div>

                {/* Baths */}
                <div>
                  <label className={lbl}>Åazienki</label>
                  <input type="number" value={form.baths} onChange={e => set('baths', e.target.value)} className={inp} />
                </div>

                {/* Sqm */}
                <div>
                  <label className={lbl}>Powierzchnia mÂ²</label>
                  <input type="number" value={form.sqm} onChange={e => set('sqm', e.target.value)} className={inp} />
                </div>

                {/* Type â€” default sale */}
                <div>
                  <label className={lbl}>Typ</label>
                  <select value={form.listing_type} onChange={e => set('listing_type', e.target.value)} className={inp}>
                    <option value="sale">Na sprzedaÅ¼</option>
                    <option value="rent">Wynajem</option>
                  </select>
                </div>
              </div>

              {/* Feature checkboxes */}
              <div className="flex flex-wrap gap-4 mb-5">
                {([['is_seafront', 'Sea View / Seafront'], ['has_pool', 'Basen'], ['has_garage', 'GaraÅ¼ / Parking']] as [keyof Form, string][]).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2 text-white/50 text-sm cursor-pointer hover:text-white transition-colors">
                    <input type="checkbox" checked={form[k] as boolean} onChange={e => set(k, e.target.checked)} className="accent-gold w-3.5 h-3.5" />
                    {label}
                  </label>
                ))}
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className={lbl}>Opis</label>
                <textarea value={form.description} onChange={e => {
                  const t = e.target.value;
                  setForm(f => ({
                    ...f, description: t,
                    seo_description: f.seo_description === f.description.slice(0, 150) || !f.seo_description ? t.slice(0, 150) : f.seo_description,
                  }));
                }} rows={6} className={inp} />
              </div>

              {/* Features */}
              <div className="mb-5">
                <label className={lbl}>Cechy (oddzielone przecinkiem)</label>
                <input type="text" value={form.features} onChange={e => set('features', e.target.value)}
                  placeholder="Sea Views, Garage, En-suite, Air Conditioning" className={inp} />
              </div>

              {/* Status + SEO */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className={lbl}>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} className={inp}>
                    <option value="active">Aktywna (widoczna)</option>
                    <option value="draft">Draft (ukryta)</option>
                    <option value="paused">Wstrzymana</option>
                  </select>
                </div>
                <div />
                <div className="col-span-2">
                  <label className={lbl}>SEO Title ({form.seo_title.length}/60)</label>
                  <input type="text" maxLength={60} value={form.seo_title} onChange={e => set('seo_title', e.target.value)} className={inp} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>SEO Description ({form.seo_description.length}/150)</label>
                  <textarea maxLength={150} value={form.seo_description} onChange={e => set('seo_description', e.target.value)} rows={2} className={inp} />
                </div>
              </div>

              {/* Featured */}
              <div className="border border-white/10 rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer mb-3">
                  <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="accent-gold w-4 h-4" />
                  <span className="text-white text-sm font-medium flex items-center gap-2">
                    <Star size={14} className="text-gold" fill={form.featured ? 'currentColor' : 'none'} />
                    WyrÃ³Å¼niona oferta (Featured)
                  </span>
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

            {/* Step 3 â€” Images */}
            <div className={card}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold mb-1">
                {editId ? 'ZdjÄ™cia' : 'Krok 3 â€” ZdjÄ™cia'}
              </p>
              <p className="text-white/60 text-xs mb-4">
                Konwertowane automatycznie do WebP 1920px. PrzeciÄ…gnij kafelki Å¼eby zmieniÄ‡ kolejnoÅ›Ä‡. Pierwsze = okÅ‚adka.
                {uploading && <span className="text-gold ml-2">Wgrywanieâ€¦</span>}
              </p>

              {/* Drop zone */}
              <label
                className="flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-white/10 rounded-xl hover:border-gold/40 cursor-pointer transition-colors mb-5"
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files); }}
              >
                <Upload size={22} className="text-white/60" />
                <span className="text-white/50 text-sm">PrzeciÄ…gnij zdjÄ™cia lub kliknij</span>
                <span className="text-white/70 text-xs">JPG, PNG, HEIC â€” resize do 1920px WebP</span>
                <input type="file" multiple accept="image/*" onChange={e => { if (e.target.files) processFiles(e.target.files); }} disabled={uploading} className="hidden" />
              </label>

              {/* Image grid */}
              {(form.images.length > 0 || blobPreviews.length > 0) && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {form.images.map((img, i) => (
                    <div
                      key={img + i}
                      draggable
                      onDragStart={() => setDragIdx(i)}
                      onDragOver={e => { e.preventDefault(); setDragOver(i); }}
                      onDrop={e => { e.preventDefault(); if (dragIdx !== null && dragIdx !== i) moveImage(dragIdx, i); setDragIdx(null); setDragOver(null); }}
                      onDragEnd={() => { setDragIdx(null); setDragOver(null); }}
                      className={`relative group cursor-grab rounded-xl overflow-hidden border-2 aspect-[4/3] transition-all ${dragOver === i ? 'border-gold scale-105' : i === 0 ? 'border-gold/40' : 'border-white/10'} ${dragIdx === i ? 'opacity-50' : ''}`}
                    >
                      <img
                        src={proxyImg(img)} alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover bg-white/5"
                        onError={e => { (e.target as HTMLImageElement).style.opacity = '0.1'; }}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <GripVertical size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {/* Remove button */}
                      <button
                        onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600"
                      >
                        <X size={11} className="text-white" />
                      </button>
                      {/* Labels */}
                      {i === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 bg-gold text-luxury-black text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                          OkÅ‚adka
                        </span>
                      )}
                      <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded tabular-nums">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                  {/* Upload previews */}
                  {blobPreviews.map((blob, i) => (
                    <div key={'blob-' + i} className="relative rounded-xl overflow-hidden border-2 border-gold/40 aspect-[4/3] opacity-60">
                      <img src={blob} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 size={16} className="animate-spin text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 4 â€” Publish */}
            <div className={card}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold mb-4">
                {editId ? 'Zapisz zmiany' : 'Krok 4 â€” Publikuj'}
              </p>
              {form.images.length === 0 && !uploading && (
                <p className="text-amber-400/70 text-xs mb-4">Uwaga: brak zdjÄ™Ä‡ dla tej oferty.</p>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setView('list'); setEditId(null); }} className={ghostBtn}>
                  <ChevronLeft size={14} /> Anuluj
                </button>
                <button onClick={handlePublish} disabled={publishing || uploading} className={goldBtn + ' flex-1 py-3'}>
                  {publishing && <Loader2 size={14} className="animate-spin" />}
                  {publishing ? 'Zapisywanieâ€¦' : editId ? 'Zapisz zmiany' : 'Opublikuj ofertÄ™'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-serif text-xl text-white mb-2">UsunÄ…Ä‡ ofertÄ™?</h3>
            <p className="text-white/50 text-sm mb-1"><strong className="text-white">{confirmDel.title}</strong></p>
            <p className="text-white/60 text-xs mb-6">Tej operacji nie moÅ¼na cofnÄ…Ä‡.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)} className={ghostBtn + ' flex-1'}>Anuluj</button>
              <button onClick={() => handleDelete(confirmDel)} disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? 'Usuwanieâ€¦' : 'UsuÅ„'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
