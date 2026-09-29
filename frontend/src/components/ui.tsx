import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Icon, type IconName } from './icons';

/* ---------- Spinner ---------- */
export function Spinner({ small }: { small?: boolean }) {
  return <span className={`spinner ${small ? 'spinner-sm' : ''}`} aria-label="Memuat" />;
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <Spinner />
      <p className="muted small">Memuat…</p>
    </div>
  );
}

/* ---------- Button ---------- */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  loading?: boolean;
  icon?: IconName;
}

export function Button({ variant = 'primary', size = 'md', loading, disabled, children, className = '', type = 'button', icon, ...rest }: ButtonProps) {
  return (
    <button type={type} className={`btn btn-${variant} btn-${size} ${className}`} disabled={disabled || loading} {...rest}>
      {loading ? <Spinner small /> : icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} />}
      {children}
    </button>
  );
}

/* ---------- Form fields ---------- */
interface FieldProps {
  label: string;
  error?: string;
}

function Field({ label, error, htmlFor, required, children }: FieldProps & { htmlFor?: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>
        {label}
        {required && <span className="req">*</span>}
      </label>
      {children}
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}

export function Input({ label, error, id, type, ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? rest.name;
  const [reveal, setReveal] = useState(false);
  const input = <input id={inputId} className={error ? 'invalid' : ''} type={type === 'password' && reveal ? 'text' : type} {...rest} />;
  return (
    <Field label={label} error={error} htmlFor={inputId} required={rest.required}>
      {type === 'password' ? (
        <div className="password-field">
          {input}
          <button
            type="button"
            className="icon-btn password-toggle"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? 'Sembunyikan password' : 'Tampilkan password'}
            title={reveal ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            <Icon name={reveal ? 'eye-off' : 'eye'} size={17} />
          </button>
        </div>
      ) : (
        input
      )}
    </Field>
  );
}

export function TextArea({ label, error, id, ...rest }: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const inputId = id ?? rest.name;
  return (
    <Field label={label} error={error} htmlFor={inputId} required={rest.required}>
      <textarea id={inputId} className={error ? 'invalid' : ''} {...rest} />
    </Field>
  );
}

export function Select({ label, error, id, children, ...rest }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const inputId = id ?? rest.name;
  return (
    <Field label={label} error={error} htmlFor={inputId} required={rest.required}>
      <select id={inputId} {...rest}>
        {children}
      </select>
    </Field>
  );
}

/* ---------- Badge ---------- */
export function Badge({ tone = 'neutral', children }: { tone?: 'success' | 'danger' | 'warning' | 'neutral' | 'info'; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

/* ---------- Card ---------- */
export function Card({ title, actions, children }: { title?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="card">
      {(title || actions) && (
        <div className="card-header">
          {title && <h2>{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint, icon, tone = 'primary' }: { label: string; value: ReactNode; hint?: string; icon?: IconName; tone?: 'primary' | 'success' | 'danger' | 'warning' }) {
  return (
    <div className="stat-card">
      {icon && (
        <span className={`stat-icon stat-icon-${tone}`}>
          <Icon name={icon} size={20} />
        </span>
      )}
      <div className="stat-body">
        <span className="muted">{label}</span>
        <strong>{value}</strong>
        {hint && <small className="muted">{hint}</small>}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, icon }: { title: string; subtitle?: string; actions?: ReactNode; icon?: IconName }) {
  useEffect(() => {
    document.title = `${title} · Dexa WFH`;
  }, [title]);
  return (
    <div className="page-header">
      <div className="page-header-title">
        {icon && (
          <span className="page-header-icon">
            <Icon name={icon} size={22} />
          </span>
        )}
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
      </div>
      {actions}
    </div>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon = 'inbox', title, hint, action }: { icon?: IconName; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <Icon name={icon} size={26} />
      </span>
      <p>{title}</p>
      {hint && <small className="muted">{hint}</small>}
      {action}
    </div>
  );
}

/* ---------- Modal ---------- */
interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}

export function Modal({ open, title, onClose, children, footer, wide }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Hapus',
  tone = 'danger',
  icon = 'alert-triangle',
  loading,
  onConfirm,
  onCancel,
}: {
  tone?: 'danger' | 'primary';
  icon?: IconName;
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="confirm-body">
        <span className={`confirm-icon confirm-icon-${tone}`}>
          <Icon name={icon} size={20} />
        </span>
        <p>{message}</p>
      </div>
    </Modal>
  );
}
