import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Save, BookOpen, CheckCircle } from 'lucide-react';
import '../admin-shared.css';

const AboutEditor = () => {
  const { data, updateAbout } = useData();
  const [form, setForm] = useState({ ...data.about });
  const [saved, setSaved] = useState(false);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAbout(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>About Section</h1>
        <p>Edit your personal bio.</p>
      </div>

      <div className="admin-card">
        <h2><BookOpen size={16} /> About Content</h2>
        <form onSubmit={handleSave} className="admin-form">
          <div className="form-group">
            <label>Section Heading</label>
            <input value={form.heading} onChange={e => set('heading', e.target.value)} placeholder="About Me" />
          </div>

          <div className="form-group">
            <label>Bio / About Text (supports multiple paragraphs, use double newline)</label>
            <textarea
              rows={10}
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              placeholder="Write your bio here..."
            />
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

export default AboutEditor;
