import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
});

const emptyForm = {
  id: "",
  name: "",
  description: "",
  price: "",
  quantity: "",
};

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/products");
      setProducts(response.data);
      setError("");
    } catch {
      setError("Could not load products. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    const query = filter.trim().toLowerCase();
    const filtered = query
      ? products.filter(
          (product) =>
            String(product.id).includes(query) ||
            product.name?.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query)
        )
      : products;

    return [...filtered].sort((first, second) => {
      const firstValue = first[sortField];
      const secondValue = second[sortField];
      const comparison =
        typeof firstValue === "number" || typeof secondValue === "number"
          ? Number(firstValue) - Number(secondValue)
          : String(firstValue ?? "").localeCompare(String(secondValue ?? ""));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [products, filter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const product = {
      ...form,
      id: Number(form.id),
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    try {
      if (editId !== null) {
        await api.put(`/product?id=${editId}`, product);
        setMessage("Product updated successfully.");
      } else {
        await api.post("/product", product);
        setMessage("Product added successfully.");
      }
      resetForm();
      await fetchProducts();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not save the product.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
    });
    setEditId(product.id);
    setMessage("");
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    setLoading(true);
    setMessage("");
    setError("");
    try {
      await api.delete(`/product?id=${id}`);
      setMessage("Product deleted successfully.");
      if (editId === id) resetForm();
      await fetchProducts();
    } catch {
      setError("Could not delete the product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(value) || 0);

  const sortIndicator = (field) =>
    sortField === field ? (sortDirection === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="/" aria-label="Inventory home">
            <span className="brand-mark" aria-hidden="true">▦</span>
            <span>Inventory</span>
          </a>
          <button
            className="button button-outline"
            type="button"
            onClick={fetchProducts}
            disabled={loading}
          >
            <span aria-hidden="true">↻</span> Refresh
          </button>
        </div>
      </header>

      <main className="page-content">
        <section className="page-heading">
          <div>
            <p className="eyebrow">INVENTORY MANAGEMENT</p>
            <h1>Product inventory</h1>
            <p className="page-subtitle">Manage your product catalog and keep stock levels up to date.</p>
          </div>
          <span className="updated-indicator"><span /> Inventory dashboard</span>
        </section>

        {(message || error) && (
          <div className={error ? "notice notice-error" : "notice notice-success"} role="status">
            <span>{error || message}</span>
            <button
              type="button"
              className="notice-close"
              aria-label="Dismiss notification"
              onClick={() => {
                setMessage("");
                setError("");
              }}
            >
              ×
            </button>
          </div>
        )}

        <section className="workspace-grid">
          <aside className="panel form-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">{editId !== null ? "UPDATE DETAILS" : "PRODUCT CATALOG"}</p>
                <h2>{editId !== null ? "Edit product" : "Add a product"}</h2>
              </div>
              <span className="panel-heading-icon" aria-hidden="true">{editId !== null ? "✎" : "+"}</span>
            </div>

            <form className="product-form" onSubmit={handleSubmit}>
              <label>
                Product ID
                <input
                  type="number"
                  name="id"
                  placeholder="e.g. 101"
                  value={form.id}
                  onChange={handleChange}
                  min="1"
                  required
                  disabled={editId !== null}
                />
              </label>
              <label>
                Product name
                <input
                  type="text"
                  name="name"
                  placeholder="Enter product name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Description
                <input
                  type="text"
                  name="description"
                  placeholder="Add a short description"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </label>
              <div className="form-row">
                <label>
                  Price
                  <div className="input-with-prefix">
                    <span>$</span>
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      value={form.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </label>
                <label>
                  Quantity
                  <input
                    type="number"
                    name="quantity"
                    placeholder="0"
                    value={form.quantity}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </label>
              </div>
              <div className="form-actions">
                <button className="button button-primary" type="submit" disabled={loading}>
                  {loading ? "Saving..." : editId !== null ? "Save changes" : "Add product"}
                </button>
                {editId !== null && (
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            <div className="form-hint">
              <span aria-hidden="true">i</span>
              Product ID must be unique.
            </div>
          </aside>

          <section className="panel inventory-panel">
            <div className="inventory-heading">
              <div>
                <p className="eyebrow">PRODUCT CATALOG</p>
                <h2>Products <span className="count-pill">{filteredProducts.length}</span></h2>
              </div>
              <label className="search-box">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  placeholder="Search products..."
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  aria-label="Search products"
                />
              </label>
            </div>

            <div className="table-container">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>
                      <button type="button" onClick={() => handleSort("id")}>
                        ID{sortIndicator("id")}
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => handleSort("name")}>
                        Product{sortIndicator("name")}
                      </button>
                    </th>
                    <th>Description</th>
                    <th>
                      <button type="button" onClick={() => handleSort("price")}>
                        Price{sortIndicator("price")}
                      </button>
                    </th>
                    <th>
                      <button type="button" onClick={() => handleSort("quantity")}>
                        Stock status{sortIndicator("quantity")}
                      </button>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && products.length === 0 ? (
                    <tr><td colSpan={6} className="table-state">Loading inventory...</td></tr>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="id-cell">#{product.id}</td>
                        <td className="name-cell">{product.name}</td>
                        <td className="desc-cell" title={product.description}>
                          {product.description || "—"}
                        </td>
                        <td className="price-cell">{currency(product.price)}</td>
                        <td>
                          <span
                            className={`stock-badge ${
                              Number(product.quantity) <= 0
                                ? "stock-out"
                                : Number(product.quantity) < 10
                                  ? "stock-low"
                                  : "stock-available"
                            }`}
                          >
                            {Number(product.quantity) <= 0
                              ? "Out of stock"
                              : Number(product.quantity) < 10
                                ? `${product.quantity} left`
                                : "In stock"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-button"
                              type="button"
                              onClick={() => handleEdit(product)}
                              aria-label={`Edit ${product.name}`}
                              title="Edit product"
                            >
                              ✎
                            </button>
                            <button
                              className="icon-button icon-button-delete"
                              type="button"
                              onClick={() => handleDelete(product.id)}
                              aria-label={`Delete ${product.name}`}
                              title="Delete product"
                            >
                              ×
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="table-state">
                        {filter ? "No products match your search." : "No products yet. Add your first product to get started."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="table-footer">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
