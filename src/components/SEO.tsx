import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  jsonLd?: Record<string, any>;
}

const SEO = ({ title, description, canonical, jsonLd }: SEOProps) => {
  const href = canonical || (typeof window !== "undefined" ? window.location.href : undefined);
  const json = jsonLd ? JSON.stringify(jsonLd) : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {href && <link rel="canonical" href={href} />}
      {json && <script type="application/ld+json">{json}</script>}
    </Helmet>
  );
};

export default SEO;
