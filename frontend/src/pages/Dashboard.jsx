// src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import Navbar from '../components/Navbar';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', imageUrl: null });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      alert('Failed to fetch products');
    }
  };

  useEffect(() => {
    if (user) fetchProducts();
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleEdit = (product) => {
    setEditing(product.productId);
    setFormData({ name: product.name, description: product.description, price: product.price, imageUrl: null });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      delete payload.imageUrl;
      await api.put(`/products/${editing}`, payload);
      setEditing(null);
      fetchProducts();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', formData.name);
    form.append('description', formData.description);
    form.append('price', formData.price);
    form.append('imageUrl', formData.imageUrl);
    try {
      await api.post('/products', form);
      setFormData({ name: '', description: '', price: '', imageUrl: null });
      setEditing(null);
      fetchProducts();
    } catch (err) {
      alert('Add failed');
    }
  };

  const renderForm = () => (
    <div className="modal">
      <div className="modal-content">
        <form onSubmit={editing === 'add' ? handleAdd : handleUpdate}>
          <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Name" required />
          <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Description" required />
          <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="Price" required />
          {editing === 'add' && <input type="file" onChange={e => setFormData({ ...formData, imageUrl: e.target.files[0] })} required />}
          <div className="form-actions">
            <button type="submit">{editing === 'add' ? 'Add' : 'Update'}</button>
            <button type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar onAddClick={() => setEditing('add')} />
      <div className="dashboard">
        <h1>Welcome, {user.email}</h1>
        {editing && renderForm()}

        <div className="product-grid">
          {products.map(p => (
            <div key={p.productId} className="product-card">
              <img src={`http://localhost:5000${p.imageUrl}`} alt={p.name} />
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p>${p.price}</p>
              <div className="card-actions">
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.productId)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
