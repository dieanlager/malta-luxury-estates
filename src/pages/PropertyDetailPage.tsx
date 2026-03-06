import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    MapPin, Bed, Bath, Maximize, ArrowLeft, Share2, Heart,
    ChevronLeft, ChevronRight, Phone, MessageSquare, Shield,
    Award, TrendingUp, Compass, Waves, CheckCircle2, Info
} from 'lucide-react';
import { getPropertyById } from '../lib/data';
import { Property } from '../types';
import { usePageMeta } from '../lib/seo/meta';
import { InvestmentPassportButton } from '../components/InvestmentPassport';
import { PriceHistoryButton } from '../components/PriceHistory';
import { EPCButton } from '../components/EPCCalculator';
import { NoiseAnalysisButton } from '../components/NoiseAnalysis';
import { DynamicMap } from '../components/DynamicMap';
import { ROICalculator } from '../components/ROICalculator';
import { ImgWithPlaceholder } from '../components/ImgWithPlaceholder';

export const PropertyDetailPage = ({ onContact }: { onContact: (id: string, title: string) => void }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | null>(null);
    const [activeImage, setActiveImage] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperty = async () => {
            if (id) {
                const data = await getPropertyById(id);
                if (data) {
                    setProperty(data);
                }
                setLoading(false);
            }
        };
        fetchProperty();
        window.scrollTo(0, 0);
    }, [id]);

    usePageMeta({
        title: property ? `${property.title} | Luxury Estate Malta` : 'Property Details',
        description: property?.description?.substring(0, 160) || 'View luxury property details in Malta.',
        canonicalPath: `/properties/${id}`
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-luxury-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-luxury-black pt-40 px-6 text-center">
                <h2 className="text-3xl font-serif mb-4">Property Not Found</h2>
                <p className="text-white/40 mb-8">The estate you are looking for might have been sold or removed.</p>
                <Link to="/properties/all" className="gold-gradient text-luxury-black px-8 py-3 rounded-full font-bold">
                    View All Listings
                </Link>
            </div>
        );
    }

    const nextImage = () => setActiveImage((prev) => (prev + 1) % property.images.length);
    const prevImage = () => setActiveImage((prev) => (prev - 1 + property.images.length) % property.images.length);

    return (
        <main className="min-h-screen bg-luxury-black pt-24 pb-20">
            {/* Navigation & Actions */}
            <div className="max-w-7xl mx-auto px-6 mb-8 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white/60 hover:text-gold transition-colors text-xs font-bold uppercase tracking-widest"
                >
                    <ArrowLeft size={16} /> Back to Search
                </button>
                <div className="flex gap-4">
                    <button
                        aria-label="Share this property"
                        className="p-3 bg-white/5 rounded-full border border-white/10 hover:border-gold/30 transition-all text-white/60 hover:text-gold shadow-lg"
                    >
                        <Share2 size={18} />
                    </button>
                    <button
                        aria-label="Add to favorites"
                        className="p-3 bg-white/5 rounded-full border border-white/10 hover:border-gold/30 transition-all text-white/60 hover:text-red-400 shadow-lg"
                    >
                        <Heart size={18} />
                    </button>
                </div>
            </div>

            {/* Hero Gallery */}
            <section className="max-w-[1600px] mx-auto px-6 mb-16">
                <div className="relative h-[600px] rounded-[3rem] overflow-hidden group shadow-2xl border border-white/5">
                    <AnimatePresence mode="wait">
                        <ImgWithPlaceholder
                            key={activeImage}
                            src={property.images[activeImage]}
                            alt={property.title}
                            priority
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </AnimatePresence>

                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/60 via-transparent to-transparent" />

                    {/* Controls */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={prevImage}
                            aria-label="Previous image"
                            className="w-14 h-14 rounded-full bg-luxury-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-gold hover:text-luxury-black transition-all"
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <button
                            onClick={nextImage}
                            aria-label="Next image"
                            className="w-14 h-14 rounded-full bg-luxury-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-gold hover:text-luxury-black transition-all"
                        >
                            <ChevronRight size={28} />
                        </button>
                    </div>

                    {/* Thumbnails Overlay */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 px-6 py-3 bg-luxury-black/40 backdrop-blur-xl rounded-2xl border border-white/10 max-w-[90%] overflow-x-auto">
                        {property.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                aria-label={`View image ${idx + 1}`}
                                className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeImage === idx ? 'border-gold p-0.5' : 'border-transparent opacity-60'}`}
                            >
                                <ImgWithPlaceholder
                                    src={img}
                                    className="w-full h-full object-cover"
                                    alt={`Thumbnail of ${property.title} - ${idx + 1}`}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="absolute top-8 left-8 flex gap-3">
                        <span className="px-4 py-2 bg-gold text-luxury-black text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                            For {property.type}
                        </span>
                        {property.isSeafront && (
                            <span className="px-4 py-2 bg-blue-500/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10">
                                Seafront
                            </span>
                        )}
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Left Column: Details */}
                <div className="lg:col-span-2">
                    {/* Title & Price Header */}
                    <div className="mb-12">
                        <div className="flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-[0.3em] mb-4">
                            <MapPin size={14} /> {property.locationName}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">{property.title}</h1>
                        <div className="flex flex-wrap items-baseline gap-4 mb-8">
                            <span className="text-5xl font-serif text-gold-gradient italic">
                                €{property.price.toLocaleString()}
                            </span>
                            <span className="text-white/40 text-sm italic">Estimated Mortgage: €{Math.round(property.price * 0.005).toLocaleString()}/mo</span>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-6 py-8 border-y border-white/10">
                            <div className="flex flex-col gap-1">
                                <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Bedrooms</span>
                                <div className="flex items-center gap-2">
                                    <Bed className="text-gold" size={20} />
                                    <span className="text-xl font-bold">{property.beds}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 border-x border-white/5 px-6">
                                <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Bathrooms</span>
                                <div className="flex items-center gap-2">
                                    <Bath className="text-gold" size={20} />
                                    <span className="text-xl font-bold">{property.baths}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Living Area</span>
                                <div className="flex items-center gap-2">
                                    <Maximize className="text-gold" size={20} />
                                    <span className="text-xl font-bold">{property.sqm} <span className="text-sm font-normal text-white/40">sqm</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
                            About this <span className="text-gold italic">Estate</span>
                        </h2>
                        <p className="text-white/60 leading-relaxed text-lg mb-8">
                            {property.description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {property.features.map((feat, i) => (
                                <div key={i} className="flex items-center gap-3 text-white/80">
                                    <CheckCircle2 size={16} className="text-gold" />
                                    <span className="text-sm">{feat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Intelligence Tools Section */}
                    <div className="mb-12 p-8 glass-card border-gold/10 rounded-3xl">
                        <h3 className="text-xl font-serif mb-6 flex items-center gap-2 italic">
                            <Shield className="text-gold" size={20} />
                            Luxury <span className="text-gold">Intelligence</span> Suite
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <InvestmentPassportButton property={property} variant="page" />
                            <PriceHistoryButton property={property} variant="page" />
                            <EPCButton property={property} variant="page" />
                            <NoiseAnalysisButton property={property} variant="page" />
                        </div>
                    </div>

                    {/* ROI Calculator */}
                    <div className="mb-12">
                        <ROICalculator property={property} />
                    </div>

                    {/* Location Map */}
                    <div className="mb-12 h-[400px] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl relative">
                        <DynamicMap
                            properties={[property]}
                            center={[14.45, 35.91]}
                            zoom={13}
                        />
                        <div className="absolute bottom-6 left-6 bg-luxury-black/80 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Exact Location</p>
                            <p className="text-sm font-serif">Available upon request</p>
                        </div>
                    </div>

                    {/* Neighbourhood Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-2xl border border-white/5">
                            <Award className="text-blue-400 mb-4" size={24} />
                            <h4 className="font-serif mb-2">Exclusive Area</h4>
                            <p className="text-xs text-white/40 leading-relaxed">Located in a high-demand premium district with proven value retention.</p>
                        </div>
                        <div className="glass-card p-6 rounded-2xl border border-white/5">
                            <TrendingUp className="text-emerald-400 mb-4" size={24} />
                            <h4 className="font-serif mb-2">+4.2% Growth</h4>
                            <p className="text-xs text-white/40 leading-relaxed">Regional capital growth outperforming the national average in 2026.</p>
                        </div>
                        <div className="glass-card p-6 rounded-2xl border border-white/5">
                            <Waves className="text-cyan-400 mb-4" size={24} />
                            <h4 className="font-serif mb-2">Lifestyle Hub</h4>
                            <p className="text-xs text-white/40 leading-relaxed">Proximity to yacht marinas, high-end dining, and primary beaches.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Enquiry Card */}
                    <div className="sticky top-32 glass-card p-8 rounded-[2.5rem] border-gold/30 shadow-2xl border">
                        {property.agency && (
                            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-white/10 border border-white/5">
                                    <img src={property.agency.logo} className="w-full h-full object-contain" alt={property.agency.name} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Listing Expert</p>
                                    <h4 className="font-serif text-lg">{property.agency.name}</h4>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={() => onContact(property.id, property.title)}
                                className="w-full py-5 gold-gradient text-luxury-black rounded-2xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
                            >
                                <Phone size={14} /> Enquire Now
                            </button>
                            <button
                                aria-label="Contact specialist via WhatsApp"
                                className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
                            >
                                <MessageSquare size={14} /> WhatsApp Specialist
                            </button>
                        </div>

                        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                            <Info className="text-blue-400 shrink-0 mt-0.5" size={16} />
                            <p className="text-[10px] text-blue-100/60 leading-relaxed">
                                A verified MLE specialist will respond within 4 business hours. No spam, just bespoke assistance.
                            </p>
                        </div>

                        <div className="mt-8 flex flex-col gap-3">
                            <div className="flex justify-between text-xs py-2 border-b border-white/5">
                                <span className="text-white/40">Property ID</span>
                                <span className="font-mono text-gold tracking-tighter">MLE-#{property.id.padStart(4, '0')}</span>
                            </div>
                            <div className="flex justify-between text-xs py-2 border-b border-white/5">
                                <span className="text-white/40">Status</span>
                                <span className="text-emerald-400">Available</span>
                            </div>
                            <div className="flex justify-between text-xs py-2">
                                <span className="text-white/40">Property Type</span>
                                <span>{property.propertyType}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};
