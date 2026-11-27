"use client";

import { useState, type FormEvent } from "react";

type Category = { id: string; name: string; slug: string; status: string };
type Variant = { id: string; name: string; sku: string; price: string; status: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  status: string;
  category: Category | null;
  variants: Variant[];
};
type CatalogData = { categories: Category[]; products: Product[] };

export function CatalogManager({
  initial,
  canManage,
}: {
  initial: CatalogData;
  canManage: boolean;
}) {
  const [catalog, setCatalog] = useState(initial);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function refresh() {
    const response = await fetch("/api/catalog", { cache: "no-store" });
    if (response.ok) setCatalog(await response.json());
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await mutate(event.currentTarget, "/api/catalog/categories");
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await mutate(event.currentTarget, "/api/catalog/products");
  }

  async function mutate(form: HTMLFormElement, url: string) {
    setPending(true);
    setError("");
    setNotice("");
    try {
      const data = Object.fromEntries(new FormData(form));
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Request failed.");
      form.reset();
      await refresh();
      setNotice(url.includes("/categories")
        ? "Category created successfully."
        : "Product created successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Request failed.");
    } finally {
      setPending(false);
    }
  }

  async function addVariant(event: FormEvent<HTMLFormElement>, productId: string) {
    event.preventDefault();
    await mutateVariant(event.currentTarget, productId);
  }

  async function mutateVariant(form: HTMLFormElement, productId: string) {
    setPending(true);
    setError("");
    setNotice("");
    try {
      const data = Object.fromEntries(new FormData(form));
      const response = await fetch(`/api/catalog/products/${productId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Variant creation failed.");
      form.reset();
      await refresh();
      setNotice("Variant created successfully.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Variant creation failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="catalog-page">
      <div className="catalog-head">
        <div><span className="app-eyebrow">Catalog</span><h1>Products</h1></div>
        <span className="app-status">{catalog.products.length} products</span>
      </div>
      {error ? <p className="catalog-error" role="alert">{error}</p> : null}
      {notice ? <p className="catalog-success" role="status">{notice}</p> : null}
      {canManage ? (
        <div className="catalog-grid">
          <form className="catalog-panel" onSubmit={submitCategory}>
            <h2>New category</h2>
            <label><span>Name</span><input name="name" required minLength={2} maxLength={120} /></label>
            <label><span>Slug <small>optional</small></span><input name="slug" /></label>
            <button type="submit" disabled={pending}>Add category</button>
            {catalog.categories.length > 0 ? (
              <div className="catalog-category-list">
                {catalog.categories.map((category) => <span key={category.id}>{category.name}</span>)}
              </div>
            ) : null}
          </form>
          <form className="catalog-panel" onSubmit={submitProduct}>
            <h2>New product</h2>
            <label><span>Name</span><input name="name" required minLength={2} maxLength={120} /></label>
            <label><span>Base price (NGN)</span><input name="basePrice" required inputMode="decimal" placeholder="0.00" /></label>
            <label><span>Category</span><select name="categoryId" defaultValue=""><option value="">Uncategorized</option>{catalog.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <button type="submit" disabled={pending}>Add product</button>
          </form>
        </div>
      ) : (
        <p className="catalog-read-only" role="status">
          You have read-only access. Contact a workspace administrator to make changes.
        </p>
      )}
      <section className="catalog-products" aria-label="Products">
        {catalog.products.length === 0 ? (
          <div className="catalog-empty">
            <h2>No products yet</h2>
            <p>{canManage
              ? "Add your first product to start the catalog."
              : "Ask a workspace administrator to add the first product."}</p>
          </div>
        ) : catalog.products.map((product) => (
          <article className="catalog-product" key={product.id}>
            <div className="catalog-product-head">
              <div><span>{product.category?.name || "Uncategorized"}</span><h2>{product.name}</h2></div>
              <strong>NGN {product.basePrice}</strong>
            </div>
            <div className="catalog-variants">
              {product.variants.map((variant) => <span key={variant.id}>{variant.name} · {variant.sku} · NGN {variant.price}</span>)}
              {canManage ? (
                <form onSubmit={(event) => addVariant(event, product.id)}>
                  <input name="name" required placeholder="Variant name" aria-label="Variant name" />
                  <input name="sku" required placeholder="SKU" aria-label="SKU" />
                  <input name="price" required inputMode="decimal" placeholder="Price" aria-label="Variant price" />
                  <button type="submit" disabled={pending}>Add</button>
                </form>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
