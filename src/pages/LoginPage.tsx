import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';

export function LoginPage() {
  const { signIn, resetPassword } = useAuth();
  const { lang, t } = useLanguage();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const from = (location.state as { from?: string } | null)?.from || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      showError(error);
    } else {
      success(lang === 'ar' ? 'مرحبًا بعودتك!' : 'Welcome back!');
      navigate(from);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      showError(error);
    } else {
      success(lang === 'ar' ? 'تم إرسال تعليمات الاستعادة لبريدك' : 'Reset instructions sent');
      setShowReset(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-navy-800 text-gold-400 mb-3">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-navy-900">{t('auth.login.title')}</h1>
        <p className="mt-1 text-sm text-navy-500">{t('auth.login.subtitle')}</p>
      </div>

      {!showReset ? (
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">{t('auth.email')}</label>
            <div className="relative">
              <Mail className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" style={lang === 'ar' ? { paddingRight: '2.5rem' } : { paddingLeft: '2.5rem' }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">{t('auth.password')}</label>
            <div className="relative">
              <Lock className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" style={lang === 'ar' ? { paddingRight: '2.5rem' } : { paddingLeft: '2.5rem' }} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('auth.loginButton')}
          </button>
          <button type="button" onClick={() => setShowReset(true)} className="block w-full text-center text-sm text-burgundy-600 hover:text-burgundy-700">
            {t('auth.forgotPassword')}
          </button>
          <p className="text-center text-sm text-navy-500">
            {t('auth.noAccount')} <Link to="/signup" className="font-semibold text-burgundy-600 hover:text-burgundy-700">{t('auth.signup.title')}</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleReset} className="card p-6 space-y-4">
          <h2 className="font-semibold text-navy-800">{t('auth.reset.title')}</h2>
          <p className="text-sm text-navy-500">{t('auth.reset.subtitle')}</p>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">{t('auth.email')}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('auth.reset.button')}
          </button>
          <button type="button" onClick={() => setShowReset(false)} className="block w-full text-center text-sm text-navy-500 hover:text-navy-700">
            {t('common.back')}
          </button>
        </form>
      )}
    </div>
  );
}
