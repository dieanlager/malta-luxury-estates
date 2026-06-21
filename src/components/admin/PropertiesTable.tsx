'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search, Star, Eye, EyeOff, Trash2, Pencil,
  ChevronLeft, ChevronRight, X, Square, SquareCheck,
  Filter, AlertTriangle, Loader2,
} from 'lucide-react';

const PAGE_SIZE = 50;

interface PropRow {
  id: string;
  slug: string | null;
  title: string;
  price: number | null;
  location_text: string | null;
  listing_type: 'sale' | 'rent';
  status: string | null;
  listing_status: string | null;
  images: string[] | null;
  agency_name: string | null;
  featured: boolean | null;
  featured_badge: string | null;
  created_at: string;
  property_type: string | null;
  bedrooms: number | null;
}

function fmtPrice(p: number | null) {
  if (!p) return '—';
  if (p >= 1_000_000) return `€${(p / 1_000_000).toFixed(1)}M`;
  if (p >= 1_000) return `€${Math.round(p / 1000)}k`;
  return `€${p.toLocaleString('en-GB')}`;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
}

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? 'active';
  const map: Record<string, { label: string; cls: string }> = {
    active:  { label: 'Active',  cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    draft:   { label: 'Draft',   cls: 'bg-white/5 text-white/60 border-white/10' },
    paused:  { label: 'Paused',  cls: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    hidden:  { label: 'Hidden',  cls: 'bg-white/5 text-white/60 border-white/10' },
  };
  const { label, cls } = map[s] ?? map.active;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {label}
    </span>
  );
}

export function PropertiesTable({ adminKey }: { adminKey: string }) {
  const [rows, setRows] = useState<PropRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [page, setPage] = useState(0);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [bulkWorking, setBulkWorking] = useState(false);

  const headers = useCallback(
    () => ({ 'x-admin-key': adminKey, 'content-type': 'application/json' }),
    [adminKey],
  );

  useEffect(() => {
    fetch('/api/admin/properties', { headers: headers() })
      .then(r => r.json())
      .then((d: PropRow[]) => { setRows(d); setLoading(false); })
      .catch(() => { setFetchError('Failed to load properties'); setLoading(false); });
  }, [headers]);

  const filtered = useMemo(() => {
    let r = rows;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.location_text ?? '').toLowerCase().includes(q) ||
        (p.agency_name ?? '').toLowerCase().includes(q),
      );
    }
    if (filterStatus !== 'all') {
      r = r.filter(p => (p.status ?? p.listing_status ?? 'active') === filterStatus);
    }
    if (filterType !== 'all') r = r.filter(p => p.listing_type === filterType);
    if (filterFeatured === 'yes') r = r.filter(p => !!p.featured);
    if (filterFeatured === 'no') r = r.filter(p => !p.featured);
    return r;
  }, [rows, search, filterStatus, filterType, filterFeatured]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  useEffect(() => { setPage(0); setSelected(new Set()); }, [search, filterStatus, filterType, filterFeatured]);

  const toggleStatus = useCallback(async (id: string, current: string | null) => {
    const next = (current ?? 'active') === 'active' ? 'paused' : 'active';
    setActionLoading(s => new Set(s).add(id));
    const res = await fetch('/api/admin/toggle', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ id, updates: { status: next, listing_status: next } }),
    });
    if (res.ok) setRows(rs => rs.map(r => r.id === id ? { ...r, status: next, listing_status: next } : r));
    setActionLoading(s => { const n = new Set(s); n.delete(id); return n; });
  }, [headers]);

  const toggleFeatured = useCallback(async (id: string, current: boolean | null) => {
    const next = !current;
    setActionLoading(s => new Set(s).add(id + '_f'));
    const res = await fetch('/api/admin/toggle', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ id, updates: { featured: next } }),
    });
    if (res.ok) setRows(rs => rs.map(r => r.id === id ? { ...r, featured: next } : r));
    setActionLoading(s => { const n = new Set(s); n.delete(id + '_f'); return n; });
  }, [headers]);

  const deleteSingle = useCallback(async (id: string) => {
    setActionLoading(s => new Set(s).add(id + '_d'));
    const res = await fetch(`/api/admin/delete?id=${id}`, { method: 'DELETE', headers: headers() });
    if (res.ok) {
      setRows(rs => rs.filter(r => r.id !== id));
      setSelected(s => { const n = new Set(s); n.delete(id); return n; });
    }
    setActionLoading(s => { const n = new Set(s); n.delete(id + '_d'); return n; });
    setDeleteConfirm(null);
  }, [headers]);

  const executeBulk = useCallback(async () => {
    if (!bulkAction || selected.size === 0) return;
    const ids = [...selected];
    setBulkWorking(true);
    const res = await fetch('/api/admin/bulk', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ action: bulkAction, ids }),
    });
    if (res.ok) {
      if (bulkAction === 'delete') {
        setRows(rs => rs.filter(r => !selected.has(r.id)));
      } else {
        const next = bulkAction === 'activate' ? 'active' : 'paused';
        setRows(rs => rs.map(r => selected.has(r.id) ? { ...r, status: next, listing_status: next } : r));
      }
      setSelected(new Set());
      setBulkAction('');
    }
    setBulkWorking(false);
  }, [bulkAction, selected, headers]);

  const allPageSelected = paginated.length > 0 && paginated.every(r => selected.has(r.id));
  const someSelected = paginated.some(r => selected.has(r.id));

  const togglePageSelect = () => {
    if (allPageSelected) {
      setSelected(s => { const n = new Set(s); paginated.forEach(r => n.delete(r.id)); return n; });
    } else {
      setSelected(s => { const n = new Set(s); paginated.forEach(r => n.add(r.id)); return n; });
    }
  };
  const toggleOne = (id: string) =>
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-white/60">
      <Loader2 size={24} className="animate-spin mr-3" /> Loading properties…
    </div>
  );
  if (fetchError) return (
    <div className="flex items-center justify-center h-64 text-red-400 gap-2">
      <AlertTriangle size={20} /> {fetchError}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, location, agency…"
            className="w-full pl-9 pr-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/60 focus:outline-none focus:border-gold/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none focus:border-gold/50 transition-colors">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="paused">Paused</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none focus:border-gold/50 transition-colors">
          <option value="all">Sale &amp; Rent</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
        <select value={filterFeatured} onChange={e => setFilterFeatured(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none focus:border-gold/50 transition-colors">
          <option value="all">All Listings</option>
          <option value="yes">Featured only</option>
          <option value="no">Not Featured</option>
        </select>
        <span className="text-xs text-white/60 ml-auto tabular-nums">
          {filtered.length} propert{filtered.length === 1 ? 'y' : 'ies'}
        </span>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-4 px-4 py-3 bg-gold/10 border border-gold/20 rounded-xl">
          <span className="text-sm text-gold font-bold tabular-nums">{selected.size} selected</span>
          <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 focus:outline-none focus:border-gold/50">
            <option value="">Choose action…</option>
            <option value="activate">Set Active</option>
            <option value="pause">Set Paused</option>
            <option value="delete">Delete selected</option>
          </select>
          <button onClick={executeBulk} disabled={!bulkAction || bulkWorking}
            className="flex items-center gap-2 px-4 py-1.5 bg-gold text-luxury-black text-sm font-bold rounded-lg disabled:opacity-40 hover:bg-white transition-colors">
            {bulkWorking && <Loader2 size={13} className="animate-spin" />}
            Apply
          </button>
          <button onClick={() => { setSelected(new Set()); setBulkAction(''); }}
            className="ml-auto text-white/60 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="glass-card border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="w-10 px-4 py-3.5 text-left">
                  <button onClick={togglePageSelect} className="text-white/60 hover:text-gold transition-colors">
                    {allPageSelected
                      ? <SquareCheck size={16} className="text-gold" />
                      : someSelected
                        ? <SquareCheck size={16} className="text-white/60" />
                        : <Square size={16} />}
                  </button>
                </th>
                <th className="w-[52px]" />
                <th className="px-3 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/60 font-bold">Title</th>
                <th className="px-3 py-3.5 text-right text-[10px] uppercase tracking-widest text-white/60 font-bold">Price</th>
                <th className="px-3 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/60 font-bold hidden md:table-cell">Location</th>
                <th className="px-3 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/60 font-bold hidden lg:table-cell">Type</th>
                <th className="px-3 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/60 font-bold">Status</th>
                <th className="px-3 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/60 font-bold hidden xl:table-cell">Agency</th>
                <th className="px-3 py-3.5 text-left text-[10px] uppercase tracking-widest text-white/60 font-bold hidden lg:table-cell">Added</th>
                <th className="px-4 py-3.5 text-right text-[10px] uppercase tracking-widest text-white/60 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(row => {
                const isSelected = selected.has(row.id);
                const isActing   = actionLoading.has(row.id);
                const isFActing  = actionLoading.has(row.id + '_f');
                const isDActing  = actionLoading.has(row.id + '_d');
                const effStatus  = row.status ?? row.listing_status ?? 'active';
                const thumb      = row.images?.[0] ?? null;
                return (
                  <tr key={row.id}
                    className={`border-b border-white/5 last:border-0 transition-colors ${isSelected ? 'bg-gold/5' : 'hover:bg-white/[0.02]'}`}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleOne(row.id)} className="text-white/60 hover:text-gold transition-colors">
                        {isSelected ? <SquareCheck size={16} className="text-gold" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="py-3 pl-2 pr-0">
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-white/5 relative flex-shrink-0">
                        {thumb
                          ? <Image src={thumb} alt="" fill sizes="48px" className="object-cover" />
                          : <div className="w-full h-full bg-white/5" />}
                      </div>
                    </td>
                    <td className="px-3 py-3 max-w-[200px] lg:max-w-[280px]">
                      <div className="font-medium text-white text-sm line-clamp-1">{row.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {row.property_type && (
                          <span className="text-[10px] text-white/60">
                            {row.property_type}{row.bedrooms ? ` · ${row.bedrooms}bd` : ''}
                          </span>
                        )}
                        {row.featured && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider text-gold">
                            <Star size={8} fill="currentColor" /> {row.featured_badge ?? 'featured'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-serif text-gold whitespace-nowrap">{fmtPrice(row.price)}</td>
                    <td className="px-3 py-3 text-white/50 text-sm hidden md:table-cell whitespace-nowrap max-w-[140px] truncate">
                      {row.location_text ?? '—'}
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <span className={`text-[10px] uppercase tracking-wider font-bold ${row.listing_type === 'rent' ? 'text-blue-400' : 'text-emerald-400'}`}>
                        {row.listing_type === 'rent' ? 'Rent' : 'Sale'}
                      </span>
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={effStatus} /></td>
                    <td className="px-3 py-3 text-white/60 text-xs hidden xl:table-cell truncate max-w-[120px]">
                      {row.agency_name ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-white/60 text-xs hidden lg:table-cell whitespace-nowrap">
                      {fmtDate(row.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => toggleStatus(row.id, effStatus)} disabled={isActing}
                          title={effStatus === 'active' ? 'Set Paused' : 'Set Active'}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 ${effStatus === 'active' ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-white/25 hover:bg-white/5 hover:text-white/60'}`}>
                          {isActing ? <Loader2 size={14} className="animate-spin" /> : effStatus === 'active' ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => toggleFeatured(row.id, row.featured)} disabled={isFActing}
                          title={row.featured ? 'Remove Featured' : 'Mark as Featured'}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 ${row.featured ? 'text-gold hover:bg-gold/10' : 'text-white/25 hover:bg-white/5 hover:text-white/60'}`}>
                          {isFActing ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} fill={row.featured ? 'currentColor' : 'none'} />}
                        </button>
                        <Link href={`/admin?edit=${row.id}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/25 hover:text-white hover:bg-white/5 transition-colors"
                          title="Edit property">
                          <Pencil size={14} />
                        </Link>
                        {deleteConfirm === row.id ? (
                          <div className="flex items-center gap-1 ml-1">
                            <button onClick={() => deleteSingle(row.id)} disabled={isDActing}
                              className="px-2 py-1 text-[10px] bg-red-500/20 text-red-400 rounded font-bold hover:bg-red-500/30 disabled:opacity-40 whitespace-nowrap transition-colors">
                              {isDActing ? <Loader2 size={11} className="animate-spin inline" /> : 'Confirm'}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-[10px] text-white/60 hover:text-white rounded transition-colors">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(row.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {paginated.length === 0 && (
          <div className="text-center py-16 text-white/60">
            <Filter size={32} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">No properties match your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60 tabular-nums">
            Showing {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0}
              className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold disabled:opacity-30 transition-colors">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`w-9 h-9 rounded-lg border text-sm font-bold transition-colors ${i === safePage ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-white/60 hover:border-gold/50 hover:text-white/60'}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={safePage === totalPages - 1}
              className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold disabled:opacity-30 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
