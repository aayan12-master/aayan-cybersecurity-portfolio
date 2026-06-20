import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Save, User, CheckCircle } from 'lucide-react';
import '../admin-shared.css';

const HeroEditor = () => {
  const { data, updateHero } = useData();
  const [form, setForm] = useState({ ...data.hero });
  const [saved, setSaved] = useState(false);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateHero(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Hero Section</h1>
        <p>Edit the main hero section displayed at the top of your portfolio.</p>
      </div>

      <div className="admin-card">
        <h2><User size={16} /> Hero Content</h2>
        <form onSubmit={handleSave} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Aayan G. Sayyad" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="aayansayyad168@gmail.com" />
            </div>
          </div>

          <div className="form-group">
            <label>Title (one-liner shown below name)</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Cyber Security Student | Cyber Security Enthusiast" />
          </div>

          <div className="form-group">
            <label>Subtitle (multi-line, use newline to separate)</label>
            <textarea rows={3} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Cyber Security Student&#10;Cyber Security Enthusiast" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Ahmednagar, Maharashtra, India" />
            </div>
            <div className="form-group">
              <label>Hero Stat Value</label>
              <input value={form.heroStatValue || ''} onChange={e => set('heroStatValue', e.target.value)} placeholder="2-3" />
            </div>
          </div>

          <div className="form-group">
            <label>Hero Stat Label</label>
            <input value={form.heroStatLabel || ''} onChange={e => set('heroStatLabel', e.target.value)} placeholder="Hours Daily Learning Journey" />
          </div>

          <div className="form-group">
            <label>Hero Description (intro card text)</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Training Badge Text</label>
            <input value={form.trainingBadge} onChange={e => set('trainingBadge', e.target.value)} placeholder="Skill Rise Academy" />
          </div>

          <div className="admin-save-bar">
            {saved && (
              <span className="save-success"><CheckCircle size={15} /> Saved successfully!</span>
            )}
            <button type="submit" className="btn-admin-primary" style={{ marginLeft: 'auto' }}>
              <Save size={15} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroEditor;
