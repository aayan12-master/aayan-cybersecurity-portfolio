import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Save, Briefcase, CheckCircle } from 'lucide-react';
import '../admin-shared.css';

const TrainingEditor = () => {
  const { data, updateTraining } = useData();
  const [form, setForm] = useState({ ...data.training });
  const [saved, setSaved] = useState(false);

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTraining(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Training</h1>
        <p>Edit your professional training / course details.</p>
      </div>

      <div className="admin-card">
        <h2><Briefcase size={16} /> Training Details</h2>
        <form onSubmit={handleSave} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Institute / Academy Name</label>
              <input value={form.institute} onChange={e => set('institute', e.target.value)} placeholder="Skill Rise Academy" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Hyderabad, Telangana, India" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duration</label>
              <input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="7-8 Months" />
            </div>
            <div className="form-group">
              <label>Training Mode</label>
              <select value={form.mode} onChange={e => set('mode', e.target.value)}>
                <option value="Offline Classroom Training">Offline Classroom Training</option>
                <option value="Online Training">Online Training</option>
                <option value="Hybrid Training">Hybrid Training</option>
                <option value="Self-Paced">Self-Paced</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Planned">Planned</option>
            </select>
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

export default TrainingEditor;
