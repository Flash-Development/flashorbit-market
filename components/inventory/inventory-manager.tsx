"use client";

import { useState, type FormEvent } from "react";

type Balance = {
  quantity: number;
  reservedQuantity: number;
  reorderPoint: number;
};

type Variant = {
  id: string;
  name: string;
  sku: string;
  product: { name: string };
  inventoryBalance: Balance | null;
};

export function InventoryManager({
  initial,
  canManage,
}: {
  initial: Variant[];
  canManage: boolean;
}) {
  const [variants, setVariants] = useState(initial);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function adjust(event: FormEvent<HTMLFormElement>, variantId: string) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    try {
      const data = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch(`/api/inventory/${variantId}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delta: Number(data.delta),
          reason: String(data.reason || ""),
          reorderPoint: data.reorderPoint
            ? Number(data.reorderPoint)
            : undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Stock adjustment failed.");
      setVariants((current) => current.map((variant) => variant.id === variantId
        ? {
            ...variant,
            inventoryBalance: {
              quantity: result.quantity,
              reservedQuantity: result.reservedQuantity,
              reorderPoint: result.reorderPoint,
            },
          }
        : variant));
      setNotice(`Adjustment applied. ${result.quantity} units available.`);
      event.currentTarget.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Stock adjustment failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="inventory-page">
      <div className="catalog-head">
        <div><span className="app-eyebrow">Stock</span><h1>Inventory</h1></div>
        <span className="app-status">{variants.length} variants</span>
      </div>
      {error ? <p className="catalog-error" role="alert">{error}</p> : null}
      {notice ? <p className="inventory-success" role="status">{notice}</p> : null}
      {!canManage ? (
        <p className="catalog-read-only" role="status">
          You have read-only access. Contact a workspace administrator to adjust stock.
        </p>
      ) : null}
      {variants.length === 0 ? (
        <div className="catalog-empty">
          <h2>No inventory variants yet</h2>
          <p>{canManage
            ? "Add a variant to a product to begin tracking stock."
            : "Ask a workspace administrator to add a product variant."}</p>
        </div>
      ) : (
        <div className="inventory-table" role="table" aria-label="Inventory balances">
          <div className="inventory-row inventory-row--head" role="row">
            <span role="columnheader">Product / variant</span>
            <span role="columnheader">Available</span>
            <span role="columnheader">Reserved</span>
            <span role="columnheader">Reorder at</span>
            <span role="columnheader">{canManage ? "Adjust" : "Access"}</span>
          </div>
          {variants.map((variant) => (
            <div className={`inventory-row${canManage ? "" : " inventory-row--read-only"}`} role="row" key={variant.id}>
              <div role="cell"><strong>{variant.product.name}</strong><small>{variant.name} · {variant.sku}</small></div>
              <div className="inventory-value" role="cell">
                <span className="inventory-mobile-label">Available</span>
                <strong>{variant.inventoryBalance?.quantity ?? 0}</strong>
              </div>
              <div className="inventory-value" role="cell">
                <span className="inventory-mobile-label">Reserved</span>
                <span>{variant.inventoryBalance?.reservedQuantity ?? 0}</span>
              </div>
              <div className="inventory-value" role="cell">
                <span className="inventory-mobile-label">Reorder at</span>
                <span>{variant.inventoryBalance?.reorderPoint ?? 0}</span>
              </div>
              {canManage ? (
                <form role="cell" onSubmit={(event) => adjust(event, variant.id)}>
                  <input name="delta" type="number" step="1" required aria-label={`Quantity change for ${variant.name}`} />
                  <input name="reason" maxLength={500} placeholder="Reason" aria-label={`Reason for ${variant.name}`} />
                  <input name="reorderPoint" type="number" min="0" step="1" placeholder="Reorder" aria-label={`Reorder point for ${variant.name}`} />
                  <button type="submit" disabled={pending}>Apply</button>
                </form>
              ) : <span role="cell">Read only</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
