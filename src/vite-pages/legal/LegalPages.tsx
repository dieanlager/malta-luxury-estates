import React, { useEffect } from 'react';
import { Shield, Lock, Eye, FileText, Scale, Globe } from 'lucide-react';
import { motion } from 'motion/react';

import { useTranslation } from 'react-i18next';

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

export const PrivacyPolicy = () => {
    const { t } = useTranslation(['legal', 'seo']);
    return (
        <LegalLayout
            title={t('seo:privacy.title')}
            subtitle={t('seo:privacy.subtitle')}
            icon={Lock}
        >
            <section className="mb-12">
                <h2 className="text-2xl font-serif text-white mb-6">{t('legal:privacy.intro.title')}</h2>
                <p className="mb-4">
                    {t('legal:privacy.intro.content')}
                </p>
                <div className="bg-gold/5 border border-gold/10 p-6 rounded-2xl mb-6">
                    <p className="text-sm font-medium text-white mb-2">{t('legal:privacy.controller.title')}</p>
                    <p className="text-sm italic whitespace-pre-line">
                        {t('legal:privacy.controller.details')}
                    </p>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-serif text-white mb-6">{t('legal:privacy.collect.title')}</h2>
                <p className="mb-4">{t('legal:privacy.collect.intro')}</p>
                <ul className="list-disc pl-6 space-y-4 mb-4">
                    <li>{t('legal:privacy.collect.points.contact')}</li>
                    <li>{t('legal:privacy.collect.points.preferences')}</li>
                    <li>{t('legal:privacy.collect.points.technical')}</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-serif text-white mb-6">{t('legal:privacy.use.title')}</h2>
                <p className="mb-4">{t('legal:privacy.use.intro')}</p>
                <ul className="list-disc pl-6 space-y-4 mb-4">
                    <li>{t('legal:privacy.use.points.communication')}</li>
                    <li>{t('legal:privacy.use.points.improvement')}</li>
                    <li>{t('legal:privacy.use.points.legal')}</li>
                </ul>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-serif text-white mb-6">{t('legal:privacy.rights.title')}</h2>
                <p className="mb-4">{t('legal:privacy.rights.intro')}</p>
                <ul className="list-disc pl-6 space-y-4 mb-4">
                    <li>{t('legal:privacy.rights.points.access')}</li>
                    <li>{t('legal:privacy.rights.points.rectification')}</li>
                    <li>{t('legal:privacy.rights.points.erasure')}</li>
                    <li>{t('legal:privacy.rights.points.object')}</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-serif text-white mb-6">{t('legal:privacy.contact.title')}</h2>
                <p>
                    {t('legal:privacy.contact.content')}<br />
                    <strong className="text-gold">info@maltaluxuryrealestate.com</strong>
                </p>
            </section>
        </LegalLayout>
    );
};

export const TermsOfService = () => {
    const { t } = useTranslation(['legal', 'seo']);
    return (
        <LegalLayout
            title={t('seo:terms.title')}
            subtitle={t('seo:terms.subtitle')}
            icon={Scale}
        >
            <section className="mb-12">
                <h2 className="text-2xl font-serif text-white mb-6">{t('legal:terms.nature.title')}</h2>
                <p className="mb-4">
                    {t('legal:terms.nature.content')}
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-serif text-white mb-6">{t('legal:terms.liability.title')}</h2>
                <p className="mb-4">
                    {t('legal:terms.liability.content')}
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-serif text-white mb-6">{t('legal:terms.ip.title')}</h2>
                <p className="mb-4">
                    {t('legal:terms.ip.content')}
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-serif text-white mb-6">{t('legal:terms.law.title')}</h2>
                <p>
                    {t('legal:terms.law.content')}
                </p>
            </section>
        </LegalLayout>
    );
};

export const CookiePolicy = () => {
    const { t } = useTranslation(['legal', 'seo']);
    return (
        <LegalLayout
            title={t('seo:cookies.title')}
            subtitle={t('seo:cookies.subtitle')}
            icon={Globe}
        >
            <section className="mb-12">
                <h2 className="text-2xl font-serif text-white mb-6">{t('legal:cookies.definition.title')}</h2>
                <p>
                    {t('legal:cookies.definition.content')}
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-serif text-white mb-6">{t('legal:cookies.essential.title')}</h2>
                <p className="mb-4">
                    {t('legal:cookies.essential.content')}
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-2xl font-serif text-white mb-6">{t('legal:cookies.third_party.title')}</h2>
                <p className="mb-4">{t('legal:cookies.third_party.intro')}</p>
                <ul className="list-disc pl-6 space-y-4 mb-4">
                    <li>{t('legal:cookies.third_party.points.mapbox')}</li>
                    <li>{t('legal:cookies.third_party.points.analytics')}</li>
                </ul>
            </section>

            <section>
                <h2 className="text-2xl font-serif text-white mb-6">{t('legal:cookies.preferences.title')}</h2>
                <p>
                    {t('legal:cookies.preferences.content')}
                </p>
            </section>
        </LegalLayout>
    );
};
