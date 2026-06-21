import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Save, User, CheckCircle, Eye, EyeOff, Upload, Loader, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import '../admin-shared.css';

const HeroEditor = () => {
  const { data, updateHero } = useData();
  const [form, setForm] = useState({ ...data.hero });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess('');

    // 1. Validation: File extension (.jpg, .jpeg, .png, .webp)
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      setUploadError('Invalid file type. Only .jpg, .jpeg, .png, and .webp images are allowed.');
      return;
    }

    // 2. Validation: Maximum size (5 MB)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setUploadError('File size exceeds the 5 MB limit.');
      return;
    }

    setUploading(true);

    try {
      // 3. Delete previous file if it exists and was uploaded to Supabase Storage
      const currentUrl = form.profilePhotoUrl;
      if (currentUrl && currentUrl.includes('portfolio-assets')) {
        try {
          const urlParts = currentUrl.split('/');
          const oldFilename = urlParts[urlParts.length - 1];
          if (oldFilename) {
            await supabase.storage.from('portfolio-assets').remove([oldFilename]);
            console.log('[Supabase Storage] Deleted old profile image:', oldFilename);
          }
        } catch (err) {
          console.error('[Supabase Storage Exception] Failed to clean up old image:', err);
        }
      }

      // 4. Upload the new file
      const newFilename = `profile-${Date.now()}.${fileExtension}`;
      const { error: uploadErr } = await supabase.storage
        .from('portfolio-assets')
        .upload(newFilename, file, { cacheControl: '3600', upsert: true });

      if (uploadErr) {
        setUploadError(`Upload failed: ${uploadErr.message}`);
        return;
      }

      // 5. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio-assets')
        .getPublicUrl(newFilename);

      // 6. Update local form state (previews before saving)
      setForm(f => ({ ...f, profilePhotoUrl: publicUrl }));
      setUploadSuccess('Profile photo uploaded successfully!');
    } catch (err: any) {
      setUploadError(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

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

          <div className="form-row">
            <div className="form-group">
              <label>Profile Badge Title</label>
              <input value={form.badgeTitle || ''} onChange={e => set('badgeTitle', e.target.value)} placeholder="Training" />
            </div>
            <div className="form-group">
              <label>Profile Badge Subtitle</label>
              <input value={form.badgeSubtitle || ''} onChange={e => set('badgeSubtitle', e.target.value)} placeholder="Skill Rise Academy" />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <label>Profile Badge Visibility</label>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, showProfileBadge: f.showProfileBadge === undefined ? false : !f.showProfileBadge }))}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: form.showProfileBadge !== false ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.08)',
                border: `1px solid ${form.showProfileBadge !== false ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.2)'}`,
                color: form.showProfileBadge !== false ? '#4ade80' : '#f87171',
                borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem',
                transition: 'all 0.2s', width: 'fit-content'
              }}
            >
              {form.showProfileBadge !== false
                ? <><Eye size={15} /> Visible (On Homepage)</>
                : <><EyeOff size={15} /> Hidden (On Homepage)</>
              }
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Resume / CV URL</label>
              <input
                type="text"
                value={form.resumeUrl || ''}
                onChange={e => set('resumeUrl', e.target.value)}
                placeholder="Google Drive, Dropbox, Supabase, or /Aayan_Sayyad_Resume.pdf"
              />
            </div>
            <div className="form-group">
              <label>Resume Button Text</label>
              <input
                value={form.resumeButtonText || ''}
                onChange={e => set('resumeButtonText', e.target.value)}
                placeholder="Download Resume"
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <label>Resume Button Visibility</label>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, showResumeButton: !f.showResumeButton }))}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: form.showResumeButton ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.08)',
                border: `1px solid ${form.showResumeButton ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.2)'}`,
                color: form.showResumeButton ? '#4ade80' : '#f87171',
                borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem',
                transition: 'all 0.2s', width: 'fit-content'
              }}
            >
              {form.showResumeButton
                ? <><Eye size={15} /> Visible (On Homepage)</>
                : <><EyeOff size={15} /> Hidden (On Homepage)</>
              }
            </button>
          </div>

          <div className="form-group" style={{ borderTop: '1px solid var(--a-border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
            <label>Profile Picture</label>
            
            {/* Current Photo Preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid var(--a-border)',
                background: '#0b0b10',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {form.profilePhotoUrl ? (
                  <img
                    src={form.profilePhotoUrl}
                    alt="Profile Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--a-text-muted)' }}>No Photo</span>
                )}
              </div>
              
              {/* Upload Action */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="btn-admin-primary" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem',
                  margin: 0,
                  width: 'fit-content'
                }}>
                  {uploading ? (
                    <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
                  ) : (
                    <><Upload size={15} /> Choose Photo</>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleFileChange}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--a-text-muted)' }}>
                  Supports JPEG, PNG, WEBP. Max size 5 MB.
                </span>
              </div>
            </div>

            {uploadError && (
              <div className="login-error" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={15} aria-hidden="true" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div style={{
                background: 'rgba(74, 222, 128, 0.08)',
                border: '1px solid rgba(74, 222, 128, 0.2)',
                borderRadius: '8px',
                padding: '0.7rem 0.9rem',
                color: '#4ade80',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <CheckCircle size={15} aria-hidden="true" />
                <span>{uploadSuccess}</span>
              </div>
            )}
            
            {/* Raw Photo URL Input (for fallback/manual control) */}
            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--a-text-sec)' }}>Raw Photo URL (Optional)</label>
              <input
                type="text"
                value={form.profilePhotoUrl || ''}
                onChange={e => setForm(f => ({ ...f, profilePhotoUrl: e.target.value }))}
                placeholder="Auto-filled on upload, or paste custom address"
                disabled={uploading}
              />
            </div>
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
