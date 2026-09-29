import { useState, type ChangeEvent, type FormEvent } from 'react';
import { authApi } from '../api';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../utils';
import { Button, Input, Modal } from './ui';

const EMPTY = { oldPassword: '', newPassword: '', confirm: '' };

export function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const notify = useToast();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const close = () => {
    setForm(EMPTY);
    setError('');
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.newPassword.length < 6) return setError('Password baru minimal 6 karakter');
    if (form.newPassword !== form.confirm) return setError('Konfirmasi password tidak sama');
    setSaving(true);
    try {
      await authApi.changePassword(form.oldPassword, form.newPassword);
      notify('success', 'Password berhasil diubah');
      close();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof typeof EMPTY) => (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <Modal open={open} title="Ganti Password" onClose={close}>
      <form onSubmit={submit} className="form">
        <Input label="Password Lama" type="password" name="oldPassword" value={form.oldPassword} onChange={set('oldPassword')} required />
        <Input label="Password Baru" type="password" name="newPassword" value={form.newPassword} onChange={set('newPassword')} required />
        <Input label="Konfirmasi Password Baru" type="password" name="confirm" value={form.confirm} onChange={set('confirm')} required />
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-actions">
          <Button variant="secondary" onClick={close}>
            Batal
          </Button>
          <Button type="submit" loading={saving}>
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
