import React from 'react';
import { Helmet } from 'react-helmet';

interface SeoProps {
  title?: string;
  description?: string;
}

export const Seo: React.FC<SeoProps> = ({ title = 'Smart Graph Analyzer', description = 'Ferramenta inteligente de análise gráfica com visão computacional.' }) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
  </Helmet>
); 