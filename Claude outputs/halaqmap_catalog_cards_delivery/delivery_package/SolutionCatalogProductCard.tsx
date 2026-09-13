import { Link } from "react-router-dom";
import "./SolutionCatalogProductCard.css";

type SolutionCatalogProduct = {
  code: string;
  name: string;
  latinName: string;
  imageSrc: string;
  category: string;
  summary: string;
  to: string;
};

type SolutionCatalogProductCardProps = {
  product: SolutionCatalogProduct;
  onOpen?: (product: SolutionCatalogProduct) => void;
};

export function SolutionCatalogProductCard({
  product,
  onOpen,
}: SolutionCatalogProductCardProps) {
  const content = (
    <article className="solution-card">
      <img
        className="solution-card__image"
        src={product.imageSrc}
        alt={`صورة ${product.name}`}
        loading="lazy"
      />
      <div className="solution-card__wash" aria-hidden="true" />
      <div className="solution-card__meta">
        <span className="solution-card__code">{product.code}</span>
        <span className="solution-card__category">{product.category}</span>
      </div>
      <div className="solution-card__content">
        <span className="solution-card__latin">{product.latinName}</span>
        <h3 className="solution-card__title">
          <span className="solution-card__title-classic">
            {product.name.replace(/[0-9]/g, "")}
          </span>
          {product.name.match(/[0-9]/)?.[0] ? (
            <span className="solution-card__title-modern">
              {product.name.match(/[0-9]/)?.[0]}
            </span>
          ) : null}
        </h3>
        <p className="solution-card__summary">{product.summary}</p>
      </div>
    </article>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        className="solution-card-button"
        onClick={() => onOpen(product)}
        aria-label={`فتح تفاصيل ${product.name}`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={product.to}
      className="solution-card-link"
      aria-label={`فتح ${product.name}`}
    >
      {content}
    </Link>
  );
}
