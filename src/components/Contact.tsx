import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import './Contact.css';

interface FormState {
    name: string;
    email: string;
    subject: string;
    message: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
}

type NotificationType = { type: 'success'; text: string } | { type: 'error'; text: string } | null;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Contact = () => {
    const { data, addContactMessage } = useData();
    const { hero } = data;

    const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' });
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        const handleInquiry = (e: Event) => {
            const customEvent = e as CustomEvent<{ subject: string }>;
            setForm(f => ({ ...f, subject: customEvent.detail.subject }));
            // Clear subject validation error if present
            setErrors(errs => ({ ...errs, subject: undefined }));

            // Focus the message input
            setTimeout(() => {
                const messageInput = document.querySelector('.contact-form textarea') as HTMLTextAreaElement | null;
                if (messageInput) {
                    messageInput.focus();
                }
            }, 100);
        };

        window.addEventListener('service-inquiry', handleInquiry);
        return () => window.removeEventListener('service-inquiry', handleInquiry);
    }, []);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState<NotificationType>(null);

    const set = (key: keyof FormState, value: string) => {
        setForm(f => ({ ...f, [key]: value }));
        if (errors[key]) {
            setErrors(e => ({ ...e, [key]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!form.name.trim()) newErrors.name = 'Full name is required';
        if (!form.email.trim()) newErrors.email = 'Email is required';
        else if (!EMAIL_REGEX.test(form.email)) newErrors.email = 'Please enter a valid email address';
        if (!form.subject.trim()) newErrors.subject = 'Subject is required';
        if (!form.message.trim()) newErrors.message = 'Message is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setNotification(null);

        if (!validate()) return;

        setSubmitting(true);

        const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
        if (!accessKey) {
            setNotification({
                type: 'error',
                text: 'Web3Forms Access Key is not configured. Please add VITE_WEB3FORMS_ACCESS_KEY to your .env file.'
            });
            setSubmitting(false);
            return;
        }

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    access_key: accessKey,
                    name: form.name.trim(),
                    email: form.email.trim(),
                    subject: form.subject.trim(),
                    message: form.message.trim(),
                    from_name: 'Aayan Sayyad Portfolio Contact',
                })
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to submit via Web3Forms');
            }

            addContactMessage({
                name: form.name.trim(),
                email: form.email.trim(),
                subject: form.subject.trim(),
                message: form.message.trim(),
            });
            setNotification({ type: 'success', text: 'Message sent successfully! I\'ll get back to you soon.' });
            setForm({ name: '', email: '', subject: '', message: '' });
            setErrors({});
        } catch (err) {
            console.error('Contact Form Submission Error:', err);
            setNotification({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="contact" className="contact-section section container">
            <div className="section-header">
                <h2 className="section-title">Let's Connect</h2>
                <div className="title-underline"></div>
            </div>

            <div className="contact-grid">
                {/* Left Column — Info */}
                <motion.div
                    className="contact-info"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="contact-description">
                        Have a question, collaboration idea, or just want to say hello? Fill out the
                        form and I'll get back to you as soon as possible. I'm always open to
                        discussing cybersecurity, projects, and new opportunities.
                    </p>

                    <div className="contact-details">
                        <div className="contact-detail-item">
                            <div className="contact-detail-icon">
                                <Mail size={20} aria-hidden="true" />
                            </div>
                            <div>
                                <div className="contact-detail-label">Email</div>
                                <div className="contact-detail-value">
                                    <a href={`mailto:${hero.email}`} style={{ color: 'inherit' }}>{hero.email}</a>
                                </div>
                            </div>
                        </div>

                        {hero.location && (
                            <div className="contact-detail-item">
                                <div className="contact-detail-icon">
                                    <MapPin size={20} aria-hidden="true" />
                                </div>
                                <div>
                                    <div className="contact-detail-label">Location</div>
                                    <div className="contact-detail-value">{hero.location}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Right Column — Form */}
                <motion.div
                    className="contact-form-wrapper"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {notification && (
                        <div className={`contact-notification ${notification.type}`} style={{ marginBottom: '1rem' }}>
                            {notification.type === 'success' ? <CheckCircle size={18} aria-hidden="true" /> : <AlertCircle size={18} aria-hidden="true" />}
                            {notification.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="contact-form" noValidate>
                        <div className="form-group">
                            <label>
                                Full Name <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={e => set('name', e.target.value)}
                                className={errors.name ? 'input-error' : ''}
                            />
                            {errors.name && <span className="field-error">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label>
                                Email Address <span className="required">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                value={form.email}
                                onChange={e => set('email', e.target.value)}
                                className={errors.email ? 'input-error' : ''}
                            />
                            {errors.email && <span className="field-error">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label>
                                Subject <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="What's this about?"
                                value={form.subject}
                                onChange={e => set('subject', e.target.value)}
                                className={errors.subject ? 'input-error' : ''}
                            />
                            {errors.subject && <span className="field-error">{errors.subject}</span>}
                        </div>

                        <div className="form-group">
                            <label>
                                Message <span className="required">*</span>
                            </label>
                            <textarea
                                placeholder="Write your message here..."
                                value={form.message}
                                onChange={e => set('message', e.target.value)}
                                className={errors.message ? 'input-error' : ''}
                            />
                            {errors.message && <span className="field-error">{errors.message}</span>}
                        </div>

                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? (
                                <span className="btn-spinner" />
                            ) : (
                                <><Send size={18} aria-hidden="true" /> Send Message</>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
};

export default Contact;