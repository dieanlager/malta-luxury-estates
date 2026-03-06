import React, { useEffect } from 'react';
import { Shield, Lock, Eye, FileText, Scale, Globe } from 'lucide-react';
import { motion } from 'motion/react';

const LegalLayout = ({ children, title, subtitle, icon: Icon }: { children: React.ReactNode, title: string, subtitle: string, icon: any }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pt-32 pb-24 px-6 min-h-screen bg-luxury-black">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mb-6 border border-gold/20">
                        <Icon className="text-gold" size={32} />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">{title}</h1>
                    <p className="text-white/40 uppercase tracking-widest text-xs font-bold">{subtitle}</p>
                </div>

                <div className="glass-card rounded-[2.5rem] p-8 md:p-16 border border-white/5 bg-white/5 backdrop-blur-3xl text-white/70 leading-relaxed font-light article-prose">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const PrivacyPolicy = () => (
    <LegalLayout
        title="Privacy Policy"
        subtitle="Data Protection & GDPR Compliance"
        icon={Lock}
    >
        <section className="mb-12">
            <h2 className="text-2xl font-serif text-white mb-6">1. Introduction</h2>
            <p className="mb-4">
                Welcome to <strong>Malta Luxury Real Estate</strong>. We are committed to protecting your personal data and your privacy.
                This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website
                and use our services.
            </p>
            <div className="bg-gold/5 border border-gold/10 p-6 rounded-2xl mb-6">
                <p className="text-sm font-medium text-white mb-2">Data Controller Information:</p>
                <p className="text-sm italic">
                    Brand House Dawid Ziobro<br />
                    VAT ID: PL6381513187<br />
                    Address: Strachocin 31, 57-550 Stronie Śląskie, Poland
                </p>
            </div>
        </section>

        <section className="mb-12">
            <h2 className="text-2xl font-serif text-white mb-6">2. Data We Collect</h2>
            <p className="mb-4">We collect information that you provide directly to us through forms and interactions on our site:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Contact Information:</strong> Name, email address, and phone number when you inquire about a property.</li>
                <li><strong>Preferences:</strong> Information about properties you save to your favorites.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, and device information collected via analytics cookies.</li>
            </ul>
        </section>

        <section className="mb-12">
            <h2 className="text-2xl font-serif text-white mb-6">3. How We Use Your Data</h2>
            <p className="mb-4">We process your data for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>To facilitate communication between you and real estate agencies (performance of a contract).</li>
                <li>To improve our website performance and user experience (legitimate interest).</li>
                <li>To comply with legal obligations in Malta and the European Union.</li>
            </ul>
        </section>

        <section className="mb-12">
            <h2 className="text-2xl font-serif text-white mb-6">4. Your Rights (GDPR)</h2>
            <p className="mb-4">Under the General Data Protection Regulation (GDPR), you have the followings rights:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>The right to access and receive a copy of your data.</li>
                <li>The right to rectification of inaccurate data.</li>
                <li>The right to erasure ("right to be forgotten").</li>
                <li>The right to object to processing based on legitimate interests.</li>
            </ul>
        </section>

        <section>
            <h2 className="text-2xl font-serif text-white mb-6">5. Contact Information</h2>
            <p>
                For any questions regarding this policy or to exercise your data rights, please contact us at:<br />
                <strong className="text-gold">info@maltaluxuryrealestate.com</strong>
            </p>
        </section>
    </LegalLayout>
);

export const TermsOfService = () => (
    <LegalLayout
        title="Terms of Service"
        subtitle="User Agreement & Platform Rules"
        icon={Scale}
    >
        <section className="mb-12">
            <h2 className="text-2xl font-serif text-white mb-6">1. Platform Nature</h2>
            <p className="mb-4">
                <strong>Malta Luxury Real Estate</strong> is a specialized advertising platform and marketplace.
                We are <strong>not</strong> a real estate broker. We provide a space for sellers, agencies, and developers to showcase
                luxury properties to potential buyers.
            </p>
        </section>

        <section className="mb-12">
            <h2 className="text-2xl font-serif text-white mb-6">2. Limitation of Liability</h2>
            <p className="mb-4">
                While we strive for accuracy, the property data on our site is provided by third-party agencies.
                Malta Luxury Real Estate cannot be held liable for inaccuracies, changes in pricing, or the withdrawal of
                properties from the market. Users are advised to verify all details with the listing agency.
            </p>
        </section>

        <section className="mb-12">
            <h2 className="text-2xl font-serif text-white mb-6">3. Intellectual Property</h2>
            <p className="mb-4">
                All branding, design elements, and content generated by Malta Luxury Real Estate are intellectual property
                owned by <strong>Brand House Dawid Ziobro</strong>. Reproduction without express written consent is prohibited.
            </p>
        </section>

        <section className="mb-12">
            <h2 className="text-2xl font-serif text-white mb-6">4. Governing Law</h2>
            <p>
                This agreement is governed by the laws of <strong>Malta</strong>. Any disputes arising from the use
                of this platform shall be subject to the jurisdiction of the Maltese courts.
            </p>
        </section>
    </LegalLayout>
);

export const CookiePolicy = () => (
    <LegalLayout
        title="Cookie Policy"
        subtitle="Our Use of Tracking Technologies"
        icon={Globe}
    >
        <section className="mb-12">
            <h2 className="text-2xl font-serif text-white mb-6">1. What are Cookies?</h2>
            <p>
                Cookies are small text files stored on your device that help us provide a seamless user experience.
                They allow us to remember your preferences and analyze how our site is used.
            </p>
        </section>

        <section className="mb-12">
            <h2 className="text-2xl font-serif text-white mb-6">2. Essential Cookies</h2>
            <p className="mb-4">
                These cookies are necessary for the website to function. Without them, features like "Saved Favorites"
                or map functionalities cannot operate correctly.
            </p>
        </section>

        <section className="mb-12">
            <h2 className="text-2xl font-serif text-white mb-6">3. Third-Party Services</h2>
            <p className="mb-4">We use controlled third-party tools that may set cookies:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Mapbox:</strong> Used to display interactive property locations on the archipelago.</li>
                <li><strong>Google Analytics:</strong> (Anonymized) Used to understand how visitors interact with our content.</li>
            </ul>
        </section>

        <section>
            <h2 className="text-2xl font-serif text-white mb-6">4. Managing Preferences</h2>
            <p>
                You can disable cookies through your browser settings. However, please note that some features
                of the platform may not function as intended without them.
            </p>
        </section>
    </LegalLayout>
);
