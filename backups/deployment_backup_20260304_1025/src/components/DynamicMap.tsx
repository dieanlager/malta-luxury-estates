import React, { useState, useMemo, useEffect } from 'react';
import { PROPERTIES } from '../constants';
import { Property } from '../types';
import { MapPin, Home, Bath, Square, ArrowRight, X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const TOKEN_VALID = MAPBOX_TOKEN && MAPBOX_TOKEN !== 'PASTE_YOUR_TOKEN_HERE' && MAPBOX_TOKEN.startsWith('pk.');

// ─── Malta island locations (for SVG fallback pins) ────────────────────
const MALTA_LOCATIONS: Record<string, { x: number; y: number; label: string }> = {
    valletta: { x: 56.5, y: 48.5, label: 'Valletta' },
    sliema: { x: 53.5, y: 43.5, label: 'Sliema' },
    'st-julians': { x: 51.5, y: 41.0, label: "St. Julian's" },
    mellieha: { x: 21.0, y: 18.0, label: 'Mellieħa' },
    victoria: { x: 22.0, y: 53.0, label: 'Victoria (Gozo)' },
    mdina: { x: 38.0, y: 46.0, label: 'Mdina' },
    marsaskala: { x: 72.0, y: 64.0, label: 'Marsaskala' },
    'three-cities': { x: 62.0, y: 51.0, label: 'Three Cities' },
};

// ─── SVG Fallback Map ────────────────────────────────────────────────────────
const MaltaSVGFallback = ({
    selectedProperty,
    setSelectedProperty,
    propertiesWithCoords,
}: {
    selectedProperty: Property | null;
    setSelectedProperty: (p: Property | null) => void;
    propertiesWithCoords: Property[];
}) => {
    // Group properties by location for summary pins
    const locationGroups = useMemo(() => {
        const groups: Record<string, Property[]> = {};
        propertiesWithCoords.forEach(p => {
            // Derive key from locationName: "Sliema" → "sliema", "St. Julian's" → "st-julians"
            const key = p.locationName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            if (!groups[key]) groups[key] = [];
            groups[key].push(p);
        });
        return groups;
    }, [propertiesWithCoords]);

    return (
        <div className="relative w-full h-full bg-[#0d1117]">
            {/* Subtle grid background */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage: 'linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            {/* SVG Map of Malta + Gozo */}
            <svg
                viewBox="0 0 100 80"
                className="absolute inset-0 w-full h-full"
                style={{ filter: 'drop-shadow(0 0 30px rgba(201,168,76,0.08))' }}
            >
                <defs>
                    <radialGradient id="seaGrad" cx="50%" cy="50%" r="70%">
                        <stop offset="0%" stopColor="#1a2332" />
                        <stop offset="100%" stopColor="#0d1117" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="0.4" result="coloredBlur" />
                        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* Sea background */}
                <rect width="100" height="80" fill="url(#seaGrad)" />

                {/* Subtle sea texture lines */}
                {[15, 25, 35, 55, 65].map(y => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y}
                        stroke="#C9A84C" strokeWidth="0.08" strokeOpacity="0.15" strokeDasharray="2,8" />
                ))}

                {/* ── Malta Island ── */}
                <path
                    d="M28 38 L32 34 L40 31 L50 30 L58 31 L65 34 L70 38 L73 44 L72 52 L68 58 L62 63 L54 66 L46 66 L38 63 L32 58 L28 50 L27 44 Z"
                    fill="#1e2d1e"
                    stroke="#C9A84C"
                    strokeWidth="0.4"
                    strokeOpacity="0.5"
                    filter="url(#glow)"
                />
                {/* Malta internal detail */}
                <path d="M35 45 L45 42 L55 43 L62 48 L60 55 L50 58 L40 56 L35 50 Z"
                    fill="#162416" fillOpacity="0.5" stroke="none" />

                {/* ── Gozo Island ── */}
                <path
                    d="M10 44 L16 40 L24 39 L30 41 L32 46 L30 52 L24 55 L16 55 L10 51 Z"
                    fill="#1a271a"
                    stroke="#C9A84C"
                    strokeWidth="0.3"
                    strokeOpacity="0.4"
                    filter="url(#glow)"
                />

                {/* ── Comino ── */}
                <path d="M32 42 L35 41 L36 44 L33 45 Z"
                    fill="#1e2a1e" stroke="#C9A84C" strokeWidth="0.2" strokeOpacity="0.3" />

                {/* ── Location Labels ── */}
                {Object.entries(MALTA_LOCATIONS).map(([slug, loc]) => (
                    <text key={slug} x={loc.x} y={loc.y + 3.5}
                        fontSize="2.2" textAnchor="middle" fill="#C9A84C" fillOpacity="0.35"
                        fontFamily="serif" fontStyle="italic">
                        {loc.label}
                    </text>
                ))}

                {/* ── Property Pins ── */}
                {Object.entries(locationGroups).map(([slug, props]) => {
                    const loc = MALTA_LOCATIONS[slug];
                    if (!loc) return null;
                    const count = props.length;
                    const avgPrice = props.reduce((s, p) => s + p.price, 0) / count;
                    const isSelected = selectedProperty && props.some(p => p.id === selectedProperty.id);

                    return (
                        <g key={slug} style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedProperty(isSelected ? null : props[0])}>
                            {/* Pulse ring */}
                            <circle cx={loc.x} cy={loc.y} r={isSelected ? 3.5 : 2.5}
                                fill="none" stroke="#C9A84C" strokeWidth="0.4" strokeOpacity={isSelected ? 0.8 : 0.4}
                                style={{ animation: 'ping 2s infinite' }} />
                            {/* Pin dot */}
                            <circle cx={loc.x} cy={loc.y} r={isSelected ? 2.2 : 1.6}
                                fill={isSelected ? '#C9A84C' : 'rgba(201,168,76,0.7)'}
                                stroke="#0d1117" strokeWidth="0.3"
                                filter="url(#glow)" />
                            {/* Price label */}
                            <rect x={loc.x - 6} y={loc.y - 6} width="12" height="4" rx="2"
                                fill={isSelected ? '#C9A84C' : 'rgba(13,17,23,0.85)'}
                                stroke="#C9A84C" strokeWidth="0.3" />
                            <text x={loc.x} y={loc.y - 3.2} fontSize="2" textAnchor="middle"
                                fill={isSelected ? '#0d1117' : '#C9A84C'} fontWeight="bold" fontFamily="sans-serif">
                                €{(avgPrice / 1000000).toFixed(1)}M{count > 1 ? ` ×${count}` : ''}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* ── Map Label ── */}
            <div className="absolute top-8 left-8 pointer-events-none">
                <div className="bg-luxury-black/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-xl">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold mb-1">Interactive</p>
                    <h2 className="text-2xl font-serif text-white">Live Market View</h2>
                </div>
            </div>

            {/* ── Token Missing Notice ── */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-center pointer-events-none">
                <div className="flex items-center gap-2 bg-luxury-black/70 backdrop-blur-sm border border-gold/20 text-[10px] text-white/40 px-4 py-2 rounded-full uppercase tracking-widest">
                    <AlertTriangle size={11} className="text-gold/60" />
                    Full map available after adding VITE_MAPBOX_TOKEN to .env.local
                </div>
            </div>

            {/* ── Property Popup (overlay) ── */}
            {selectedProperty && (
                <div className="absolute top-8 right-8 w-72 bg-luxury-black border border-gold/30 rounded-2xl overflow-hidden shadow-2xl z-10">
                    <div className="relative aspect-video">
                        <img src={selectedProperty.images[0]} alt={selectedProperty.title}
                            className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                        <button onClick={() => setSelectedProperty(null)}
                            className="absolute top-2 right-2 bg-black/50 p-1 rounded-full hover:bg-black/80 transition-colors">
                            <X size={16} />
                        </button>
                        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/80 to-transparent" />
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-serif text-base leading-tight text-white">{selectedProperty.title}</h3>
                            <span className="text-gold font-bold text-sm">€{(selectedProperty.price / 1000000).toFixed(1)}M</span>
                        </div>
                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-4">{selectedProperty.locationName}</p>
                        <div className="flex gap-4 mb-4 border-t border-white/5 pt-4">
                            <div className="flex items-center gap-1 text-xs text-white/60">
                                <Home size={11} className="text-gold" /> {selectedProperty.beds}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-white/60">
                                <Bath size={11} className="text-gold" /> {selectedProperty.baths}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-white/60">
                                <Square size={11} className="text-gold" /> {selectedProperty.sqm}m²
                            </div>
                        </div>
                        <Link to={`/properties/${selectedProperty.id}`}
                            className="flex items-center justify-center gap-2 w-full py-2 bg-gold/10 hover:bg-gold/20 text-gold rounded-xl transition-all text-[11px] font-bold uppercase tracking-widest border border-gold/20">
                            View Details <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main DynamicMap (Mapbox or SVG fallback) ────────────────────────────────
export const DynamicMap = () => {
    const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);
    const [mapError, setMapError] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    const propertiesWithCoords = useMemo(() =>
        PROPERTIES.filter(p => p.lat && p.lng),
        []
    );

    // Dynamically import Mapbox only if token is valid
    useEffect(() => {
        if (!TOKEN_VALID) return;

        import('react-map-gl/mapbox').then(mod => {
            setMapComponent(() => mod.Map);
        }).catch(() => setMapError(true));
    }, []);

    const showFallback = !TOKEN_VALID || mapError;

    return (
        <div className="w-full h-[600px] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative group/map">
            {showFallback ? (
                <MaltaSVGFallback
                    selectedProperty={selectedProperty}
                    setSelectedProperty={setSelectedProperty}
                    propertiesWithCoords={propertiesWithCoords}
                />
            ) : MapComponent ? (
                <MapBoxView
                    MapComp={MapComponent}
                    selectedProperty={selectedProperty}
                    setSelectedProperty={setSelectedProperty}
                    propertiesWithCoords={propertiesWithCoords}
                    onError={() => setMapError(true)}
                />
            ) : (
                // Loading state
                <div className="w-full h-full bg-[#0d1117] flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
};

// ─── Mapbox View (only rendered when token is valid) ─────────────────────────
const MapBoxView = ({
    MapComp,
    selectedProperty,
    setSelectedProperty,
    propertiesWithCoords,
    onError,
}: {
    MapComp: React.ComponentType<any>;
    selectedProperty: Property | null;
    setSelectedProperty: (p: Property | null) => void;
    propertiesWithCoords: Property[];
    onError: () => void;
}) => {
    const [MapModules, setMapModules] = useState<any>(null);

    useEffect(() => {
        import('react-map-gl/mapbox').then(mod => {
            setMapModules(mod);
        }).catch(onError);
    }, []);

    if (!MapModules) return null;

    const { Marker, Popup, NavigationControl, FullscreenControl } = MapModules;

    return (
        <>
            <style>{`@import url('https://api.mapbox.com/mapbox-gl-js/v3.1.2/mapbox-gl.css');`}</style>
            <MapComp
                initialViewState={{ latitude: 35.9122, longitude: 14.5042, zoom: 11 }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                mapboxAccessToken={MAPBOX_TOKEN}
                onError={onError}
            >
                <NavigationControl position="top-right" />
                <FullscreenControl position="top-right" />

                {propertiesWithCoords.map(property => (
                    <Marker
                        key={property.id}
                        latitude={property.lat!}
                        longitude={property.lng!}
                        anchor="bottom"
                        onClick={(e: any) => {
                            e.originalEvent.stopPropagation();
                            setSelectedProperty(property);
                        }}
                    >
                        <div className="group cursor-pointer">
                            <div className="bg-gold text-luxury-black px-3 py-1 rounded-full text-xs font-bold shadow-lg transform transition-transform group-hover:scale-110 border border-white/20">
                                €{(property.price / 1000000).toFixed(1)}M
                            </div>
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gold mx-auto" />
                        </div>
                    </Marker>
                ))}

                {selectedProperty && (
                    <Popup
                        latitude={selectedProperty.lat!}
                        longitude={selectedProperty.lng!}
                        anchor="bottom"
                        onClose={() => setSelectedProperty(null)}
                        closeButton={false}
                        maxWidth="320px"
                    >
                        <div className="bg-luxury-black text-white rounded-2xl overflow-hidden border border-gold/30 shadow-2xl">
                            <div className="relative aspect-video">
                                <img src={selectedProperty.images[0]} alt={selectedProperty.title} className="w-full h-full object-cover" />
                                <button onClick={() => setSelectedProperty(null)}
                                    className="absolute top-2 right-2 bg-black/50 p-1 rounded-full hover:bg-black/80 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-serif text-lg leading-tight">{selectedProperty.title}</h3>
                                    <span className="text-gold font-bold">€{(selectedProperty.price / 1000000).toFixed(1)}M</span>
                                </div>
                                <p className="text-white/50 text-[10px] uppercase tracking-wider mb-4">{selectedProperty.locationName}</p>
                                <div className="flex gap-4 mb-4 border-t border-white/5 pt-4">
                                    <div className="flex items-center gap-1.5 text-xs text-white/70"><Home size={12} className="text-gold" />{selectedProperty.beds}</div>
                                    <div className="flex items-center gap-1.5 text-xs text-white/70"><Bath size={12} className="text-gold" />{selectedProperty.baths}</div>
                                    <div className="flex items-center gap-1.5 text-xs text-white/70"><Square size={12} className="text-gold" />{selectedProperty.sqm}m²</div>
                                </div>
                                <Link to={`/properties/${selectedProperty.id}`}
                                    className="flex items-center justify-center gap-2 w-full py-2 bg-gold/10 hover:bg-gold/20 text-gold rounded-xl transition-all text-xs font-bold uppercase tracking-widest border border-gold/20">
                                    View Details <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </Popup>
                )}
            </MapComp>

            {/* Decorative Label */}
            <div className="absolute top-8 left-8 pointer-events-none">
                <div className="bg-luxury-black/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-xl">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold mb-1">Interactive</p>
                    <h2 className="text-2xl font-serif text-white">Live Market View</h2>
                </div>
            </div>
        </>
    );
};
