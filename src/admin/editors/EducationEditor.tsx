import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Save, GraduationCap, CheckCircle } from 'lucide-react';
import '../admin-shared.css';

const EducationEditor = () => {
  const { data, updateEducation } = useData();
  const [form, setForm] = useState({ ...data.education });
  const [saved, setSaved] = useState(false);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateEducation(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Education</h1>
        <p>Edit your academic education details.</p>
      </div>

      <div className="admin-card">
        <h2><GraduationCap size={16} /> Education Details</h2>
        <form onSubmit={handleSave} className="admin-form">
          <div className="form-group">
            <label>Degree / Qualification</label>
            <input
              value={form.degree}
              onChange={e => set('degree', e.target.value)}
              placeholder="Bachelor of Science (B.Sc.) in Computer Science"
            />
          </div>
          <div className="form-group">
            <label>College / University Name</label>
            <input
              value={form.college}
              onChange={e => set('college', e.target.value)}
              placeholder="Marutraoji Ghule Patil College"
            />
          </div>
          <div className="form-group">
            <label>Completion Year</label>
            <input
              value={form.completionYear}
              onChange={e => set('completionYear', e.target.value)}
              placeholder="2026"
            />
          </div>

          <div className="admin-save-bar">
            {saved && <span className="save-success"><CheckCircle size={15} /> Saved successfully!</span>}
            <button type="submit" className="btn-admin-primary" style={{ marginLeft: 'auto' }}>
              <Save size={15} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EducationEditor;
