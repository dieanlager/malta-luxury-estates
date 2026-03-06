import React from 'react';

interface SchemaScriptProps {
    data: object | object[];
}

export const SchemaScript: React.FC<SchemaScriptProps> = ({ data }) => {
    const schemas = Array.isArray(data) ? data : [data];

    return (
        <>
            {schemas.map((schema, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
        </>
    );
};
