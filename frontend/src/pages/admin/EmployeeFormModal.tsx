import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { employeeApi } from '../../api';
import type { Employee, EmployeeInput } from '../../api/types';
import { Button, Input, Modal, Select } from '../../components/ui';
import { Icon } from '../../components/icons';
import { useToast } from '../../context/ToastContext';
import { errorMessage, toDateInput } from '../../utils';

type FormState = Required<Omit<EmployeeInput, 'isActive'>> & { isActive: string };

const empty = (): FormState => ({
  nik: '',
  fullName: '',
  email: '',
  phone: '',
  position: '',
  department: '',
  joinDate: toDateInput(new Date()),
  password: '',
  isActive: 'true',
});

interface Props {
  open: boolean;
  employee: Employee | null; // null = tambah baru
  onClose: () => void;
  onSaved: () => void;
}

export function EmployeeFormModal({ open, employee, onClose, onSaved }: Props) {
  const notify = useToast();
  const isEdit = !!employee;
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setApiError('');
    setForm(
      employee
        ? {
            nik: employee.nik,
            fullName: employee.fullName,
            email: employee.email,
            phone: employee.phone ?? '',
            position: employee.position,
            department: employee.department,
            joinDate: employee.joinDate.slice(0, 10),
            password: '',
            isActive: String(employee.isActive),
          }
        : empty(),
    );
  }, [open, employee]);

  const set = (k: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.nik) errs.nik = 'NIK wajib diisi';
    else if (!/^\d{16}$/.test(form.nik)) errs.nik = `NIK harus 16 digit angka (baru ${form.nik.length} digit)`;
    if (!form.fullName.trim()) errs.fullName = 'Nama wajib diisi';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Format email tidak valid';
    if (!form.position.trim()) errs.position = 'Jabatan wajib diisi';
    if (!form.department.trim()) errs.department = 'Departemen wajib diisi';
    if (!form.joinDate) errs.joinDate = 'Tanggal bergabung wajib diisi';
    if (!isEdit && form.password.length < 6) errs.password = 'Password minimal 6 karakter';
    if (isEdit && form.password && form.password.length < 6) errs.password = 'Password minimal 6 karakter';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError('');
    const payload: EmployeeInput = {
      nik: form.nik,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      position: form.position.trim(),
      department: form.department.trim(),
      joinDate: form.joinDate,
      password: form.password || undefined,
    };
    try {
      if (employee) {
        await employeeApi.update(employee.id, { ...payload, isActive: form.isActive === 'true' });
        notify('success', 'Data karyawan diperbarui');
      } else {
        await employeeApi.create(payload);
        notify('success', 'Karyawan baru ditambahkan');
      }
      onSaved();
      onClose();
    } catch (err) {
      setApiError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} title={isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'} onClose={onClose} wide>
      <form onSubmit={submit} className="form" noValidate>
        <div className="form-grid">
          <Input
            label="NIK (16 digit)"
            name="nik"
            inputMode="numeric"
            placeholder="3174012501900001"
            value={form.nik}
            // Hanya terima angka, termasuk saat paste (spasi/titik ikut dibuang)
            onChange={(e) => setForm((f) => ({ ...f, nik: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
            error={errors.nik}
            maxLength={16}
            required
          />
          <Input label="Nama Lengkap" name="fullName" value={form.fullName} onChange={set('fullName')} error={errors.fullName} maxLength={100} required />
          <Input label="Email (untuk login)" type="email" name="email" value={form.email} onChange={set('email')} error={errors.email} required />
          <Input label="No. Telepon" name="phone" value={form.phone} onChange={set('phone')} maxLength={20} />
          <Input label="Jabatan" name="position" value={form.position} onChange={set('position')} error={errors.position} required />
          <Input label="Departemen" name="department" value={form.department} onChange={set('department')} error={errors.department} required />
          <Input label="Tanggal Bergabung" type="date" name="joinDate" value={form.joinDate} onChange={set('joinDate')} error={errors.joinDate} required />
          <Input
            label={isEdit ? 'Reset Password (kosongkan jika tidak diubah)' : 'Password Awal'}
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            required={!isEdit}
          />
          {isEdit && (
            <Select label="Status" name="isActive" value={form.isActive} onChange={set('isActive')}>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </Select>
          )}
        </div>
        {apiError && (
          <div className="alert alert-error">
            <Icon name="alert-triangle" size={16} />
            {apiError}
          </div>
        )}
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" icon={isEdit ? 'pencil' : 'plus'} loading={saving}>
            {isEdit ? 'Simpan Perubahan' : 'Tambah Karyawan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
