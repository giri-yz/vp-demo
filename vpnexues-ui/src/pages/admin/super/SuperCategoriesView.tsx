import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as adminCategoriesApi from '../../../api/adminCategoriesApi';
import { listProducts } from '../../../api/adminProductsApi';
import type { Category } from '../../../types';
import Modal from '../../../components/admin/Modal';
import { useToast } from '../../../components/admin/Toast';
import { getErrorMessage } from '../../../utils/errors';
import styles from '../css/SuperAdminDashboard.module.css';
import ScrollReveal from '../../../components/admin/ScrollReveal';

export default function SuperCategoriesView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  function load() {
    setLoading(true);
    adminCategoriesApi
      .listCategories()
      .then(async (cats) => {
        setCategories(cats);
        setError('');
        const countsEntries = await Promise.all(
          cats.map(async (c) => {
            try {
              const res = await listProducts({ category: c.name, size: 1 });
              return [c.id, res.totalElements] as const;
            } catch {
              return [c.id, -1] as const;
            }
          }),
        );
        setCounts(Object.fromEntries(countsEntries));
      })
      .catch((err: unknown) => setError(getErrorMessage(err, 'Could not load categories.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openEdit(cat: Category) {
    setName(cat.name);
    setEmoji(cat.emoji ?? '');
    setEditActive(cat.active);
    setFormError('');
    setEditing(cat);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Name is required.');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminCategoriesApi.updateCategory(editing.id, { name: name.trim(), emoji: emoji.trim() || null, active: editActive });
        notify('Category updated.');
      } else {
        await adminCategoriesApi.createCategory({ name: name.trim(), emoji: emoji.trim() || undefined });
        notify('Category added.');
      }
      setCreating(false);
      setEditing(null);
      setName('');
      setEmoji('');
      load();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, 'Something went wrong.'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: string, label: string) {
    if (!window.confirm(`Delete ${label}?`)) return;
    try {
      await adminCategoriesApi.deleteCategory(id);
      load();
      notify('Category deleted.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Could not delete category.'));
    }
  }

  return (
    <div>
      <ScrollReveal>
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <h1 className={styles.bannerTitle}>Categories</h1>
            <p className={styles.bannerSubtitle}>Product categories with live product counts</p>
          </div>
          <div className={styles.bannerActions}>
            <button type="button" className={styles.bannerBtn} onClick={() => { setFormError(''); setCreating(true); }}>
              Add Category
            </button>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        {loading ? (
          <div className={styles.panel}>
            <div className={styles.panelBody}><p className={styles.placeholder}>Loading...</p></div>
          </div>
        ) : error ? (
          <div className={styles.panel}>
            <div className={styles.panelBody}>
              <p className={styles.placeholder}>{error}</p>
              <button type="button" className={styles.viewButton} onClick={load}>Retry</button>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className={styles.panel}>
            <div className={styles.panelBody}><p className={styles.placeholder}>No categories yet.</p></div>
          </div>
        ) : (
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <div key={cat.id} className={styles.categoryCard}>
                <span className={styles.categoryEmoji}>{cat.emoji ?? '📦'}</span>
                <span className={styles.categoryName}>{cat.name}</span>
                <span className={styles.categoryCount}>
                  {counts[cat.id] === undefined ? '…' : counts[cat.id] < 0 ? 'count unavailable' : `${counts[cat.id]} products`}
                  {!cat.active && ' · inactive'}
                </span>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
                  <button type="button" className={styles.viewButton} onClick={() => openEdit(cat)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.viewButton}
                    onClick={(e) => { e.stopPropagation(); void deleteCategory(cat.id, cat.name); }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollReveal>

      {(creating || editing) && (
        <Modal title={editing ? `Edit ${editing.name}` : 'Add Category'} onClose={() => { setCreating(false); setEditing(null); }}>
          {formError && <p style={{ color: '#DC2626', fontSize: 13 }}>{formError}</p>}
          <form onSubmit={(e) => void handleSubmit(e)}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px 12px' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Emoji</label>
              <input value={emoji} onChange={(e) => setEmoji(e.target.value)} style={{ width: '100%', padding: '8px 12px' }} />
            </div>
            {editing && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13 }}><input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} /> Active</label>
              </div>
            )}
            <div style={{ textAlign: 'right' }}>
              <button type="submit" className={styles.viewButton} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
