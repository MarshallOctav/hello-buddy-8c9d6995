import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, Ticket, AlertCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { toast } from 'sonner';

interface Voucher {
  id: number;
  code: string;
  discount_percent: number;
  limit_user: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
  status: string;
  status_label: string;
  created_at: string;
}

interface VoucherFormData {
  code: string;
  discount_percent: number;
  limit_user: number;
  expires_at: string;
  is_active: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const Vouchers = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<VoucherFormData>({
    code: '',
    discount_percent: 10,
    limit_user: 100,
    expires_at: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getToken = () => localStorage.getItem('admin_token');

  const fetchVouchers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/vouchers`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setVouchers(data.data);
      }
    } catch (error) {
      toast.error('Gagal memuat data voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const resetForm = () => {
    setFormData({
      code: '',
      discount_percent: 10,
      limit_user: 100,
      expires_at: '',
      is_active: true,
    });
    setErrors({});
    setEditingVoucher(null);
  };

  const openCreateModal = () => {
    resetForm();
    // Set default expiry date to 30 days from now
    const defaultExpiry = new Date();
    defaultExpiry.setDate(defaultExpiry.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      expires_at: defaultExpiry.toISOString().split('T')[0],
    }));
    setShowModal(true);
  };

  const openEditModal = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      discount_percent: voucher.discount_percent,
      limit_user: voucher.limit_user,
      expires_at: new Date(voucher.expires_at).toISOString().split('T')[0],
      is_active: voucher.is_active,
    });
    setErrors({});
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Kode voucher harus diisi';
    }
    if (formData.discount_percent < 1 || formData.discount_percent > 100) {
      newErrors.discount_percent = 'Diskon harus antara 1-100%';
    }
    if (formData.limit_user < 1) {
      newErrors.limit_user = 'Limit minimal 1';
    }
    if (!formData.expires_at) {
      newErrors.expires_at = 'Tanggal kadaluarsa harus diisi';
    } else if (!editingVoucher && new Date(formData.expires_at) <= new Date()) {
      newErrors.expires_at = 'Tanggal harus di masa depan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const url = editingVoucher
        ? `${API_BASE_URL}/admin/vouchers/${editingVoucher.id}`
        : `${API_BASE_URL}/admin/vouchers`;
      
      const response = await fetch(url, {
        method: editingVoucher ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(editingVoucher ? 'Voucher berhasil diperbarui' : 'Voucher berhasil dibuat');
        setShowModal(false);
        resetForm();
        fetchVouchers();
      } else {
        if (data.errors) {
          setErrors(Object.fromEntries(
            Object.entries(data.errors).map(([key, val]) => [key, (val as string[])[0]])
          ));
        } else {
          toast.error(data.message || 'Terjadi kesalahan');
        }
      }
    } catch (error) {
      toast.error('Gagal menyimpan voucher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (voucher: Voucher) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/vouchers/${voucher.id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        fetchVouchers();
      } else {
        toast.error(data.message || 'Gagal mengubah status');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleDelete = async (voucher: Voucher) => {
    if (!confirm(`Hapus voucher ${voucher.code}?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/vouchers/${voucher.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Voucher berhasil dihapus');
        fetchVouchers();
      } else {
        toast.error(data.message || 'Gagal menghapus voucher');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800',
      limit_reached: 'bg-orange-100 text-orange-800',
    };
    const labels: Record<string, string> = {
      active: 'Aktif',
      inactive: 'Nonaktif',
      expired: 'Kadaluarsa',
      limit_reached: 'Limit Habis',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.inactive}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manajemen Voucher</h1>
            <p className="text-muted-foreground mt-1">Kelola voucher diskon untuk pengguna</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Tambah Voucher
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Voucher</p>
                <p className="text-xl font-bold text-foreground">{vouchers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ToggleRight className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Voucher Aktif</p>
                <p className="text-xl font-bold text-foreground">
                  {vouchers.filter(v => v.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Akan Expired</p>
                <p className="text-xl font-bold text-foreground">
                  {vouchers.filter(v => {
                    const expires = new Date(v.expires_at);
                    const now = new Date();
                    const diffDays = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    return diffDays > 0 && diffDays <= 7 && v.status === 'active';
                  }).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Digunakan</p>
                <p className="text-xl font-bold text-foreground">
                  {vouchers.reduce((sum, v) => sum + v.used_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada voucher</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Kode</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Diskon</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Penggunaan</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Kadaluarsa</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {vouchers.map((voucher) => (
                    <tr key={voucher.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-primary">{voucher.code}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{voucher.discount_percent}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={voucher.used_count >= voucher.limit_user ? 'text-red-600 font-semibold' : ''}>
                          {voucher.used_count} / {voucher.limit_user}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(voucher.expires_at)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(voucher.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(voucher)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggle(voucher)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              voucher.is_active
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                            title={voucher.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {voucher.is_active ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(voucher)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-card rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {editingVoucher ? 'Edit Voucher' : 'Tambah Voucher Baru'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Kode Voucher
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className={`w-full px-3 py-2 rounded-lg border bg-background text-foreground uppercase font-mono ${
                    errors.code ? 'border-destructive' : 'border-border'
                  } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                  placeholder="SAVE20"
                />
                {errors.code && <p className="text-destructive text-sm mt-1">{errors.code}</p>}
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Diskon (%)
                </label>
                <input
                  type="number"
                  value={formData.discount_percent}
                  onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                  min="1"
                  max="100"
                  className={`w-full px-3 py-2 rounded-lg border bg-background text-foreground ${
                    errors.discount_percent ? 'border-destructive' : 'border-border'
                  } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                />
                {errors.discount_percent && <p className="text-destructive text-sm mt-1">{errors.discount_percent}</p>}
              </div>

              {/* Limit */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Limit Penggunaan
                </label>
                <input
                  type="number"
                  value={formData.limit_user}
                  onChange={(e) => setFormData({ ...formData, limit_user: parseInt(e.target.value) || 0 })}
                  min="1"
                  className={`w-full px-3 py-2 rounded-lg border bg-background text-foreground ${
                    errors.limit_user ? 'border-destructive' : 'border-border'
                  } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                />
                {errors.limit_user && <p className="text-destructive text-sm mt-1">{errors.limit_user}</p>}
              </div>

              {/* Expires At */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tanggal Kadaluarsa
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border bg-background text-foreground ${
                    errors.expires_at ? 'border-destructive' : 'border-border'
                  } focus:outline-none focus:ring-2 focus:ring-primary/20`}
                />
                {errors.expires_at && <p className="text-destructive text-sm mt-1">{errors.expires_at}</p>}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Status Aktif</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_active ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingVoucher ? 'Simpan' : 'Buat Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Vouchers;
