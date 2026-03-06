import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbSchema } from '../lib/seo/schemas';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    const BASE_URL = 'https://maltaluxuryrealestate.com';

    const schemaItems = items.map((item) => ({
        name: item.label,
        url: item.href ? `${BASE_URL}${item.href}` : BASE_URL,
    }));

    return (
        <>
            <script type="application/ld+json">
                {JSON.stringify(generateBreadcrumbSchema(schemaItems))}
            </script>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/40 flex-wrap">
                <Link
                    to="/"
                    className="flex items-center gap-1 hover:text-gold transition-colors"
                >
                    <Home size={12} />
                    <span>Home</span>
                </Link>
                {items.slice(1).map((item, index) => (
                    <React.Fragment key={index}>
                        <ChevronRight size={10} className="text-white/20" />
                        {item.href ? (
                            <Link
                                to={item.href}
                                className="hover:text-gold transition-colors font-medium"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-white/60 font-medium">{item.label}</span>
                        )}
                    </React.Fragment>
                ))}
            </nav>
        </>
    );
};
