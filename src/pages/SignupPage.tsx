import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';

export function SignupPage() {
  const { signUp } = useAuth();
  const { lang, t } = useLanguage();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError(lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(lang === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    setLoading(true);
    const { error: signUpError } = await signUp(form.email, form.password, form.displayName);
    setLoading(false);
    if (signUpError) {
      showError(signUpError);
    } else {
      success(lang === 'ar' ? 'تم إنشاء حسابك بنجاح!' : 'Account created successfully!');
      navigate('/account');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-navy-800 text-gold-400 mb-3">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-navy-900">{t('auth.signup.title')}</h1>
        <p className="mt-1 text-sm text-navy-500">{t('auth.signup.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">{t('auth.displayName')}</label>
          <div className="relative">
            <User className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            <input type="text" required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="input-field" style={lang === 'ar' ? { paddingRight: '2.5rem' } : { paddingLeft: '2.5rem' }} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">{t('auth.email')}</label>
          <div className="relative">
            <Mail className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" style={lang === 'ar' ? { paddingRight: '2.5rem' } : { paddingLeft: '2.5rem' }} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">{t('auth.password')}</label>
          <div className="relative">
            <Lock className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" style={lang === 'ar' ? { paddingRight: '2.5rem' } : { paddingLeft: '2.5rem' }} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">{t('auth.confirmPassword')}</label>
          <div className="relative">
            <Lock className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
            <input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="input-field" style={lang === 'ar' ? { paddingRight: '2.5rem' } : { paddingLeft: '2.5rem' }} />
          </div>
        </div>
        {error && <p className="text-sm text-error-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {t('auth.signupButton')}
        </button>
        <p className="text-center text-sm text-navy-500">
          {t('auth.haveAccount')} <Link to="/login" className="font-semibold text-burgundy-600 hover:text-burgundy-700">{t('auth.login.title')}</Link>
        </p>
      </form>
    </div>
  );
}
