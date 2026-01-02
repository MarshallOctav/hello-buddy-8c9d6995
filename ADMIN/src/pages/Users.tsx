import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { api } from '../services/api';
import { toast } from 'sonner';
import { Search, Trash2, AlertTriangle, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  plan: string;
  plan_expires_at: string | null;
  created_at: string;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface UsersResponse {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.current_page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.current_page.toString(),
        per_page: pagination.per_page.toString(),
        ...(search && { search }),
      });

      const data = await api.get<UsersResponse>(`/admin/users?${params}`);
      setUsers(data.data);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        per_page: data.per_page,
        total: data.total,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data users';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.user) return;

    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteModal.user.id}`);
      toast.success('User berhasil dihapus');
      setDeleteModal({ open: false, user: null });
      fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus user';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      FREE: 'bg-gray-100 text-gray-700',
      PERSONAL: 'bg-blue-100 text-blue-700',
      PROFESSIONAL: 'bg-purple-100 text-purple-700',
      ORGANIZATION: 'bg-orange-100 text-orange-700',
    };
    return colors[plan] || colors.FREE;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground">Kelola semua pengguna DiagnoSpace</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination(p => ({ ...p, current_page: 1 }));
              }}
              className="pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-full sm:w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Nama</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Terdaftar</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-muted rounded animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-48 bg-muted rounded animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 bg-muted rounded animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded animate-pulse"></div></td>
                      <td className="px-6 py-4"><div className="h-8 w-8 bg-muted rounded animate-pulse ml-auto"></div></td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-destructive mb-4">{error}</p>
                      <button
                        onClick={fetchUsers}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Coba Lagi
                      </button>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      Tidak ada user ditemukan
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{user.name}</p>
                        {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                      </td>
                      <td className="px-6 py-4 text-foreground">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getPlanBadge(user.plan)}`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(user.created_at)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteModal({ open: true, user })}
                          disabled={user.role === 'admin'}
                          className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={user.role === 'admin' ? 'Tidak bisa menghapus admin' : 'Hapus user'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && pagination.last_page > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Menampilkan {(pagination.current_page - 1) * pagination.per_page + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} dari {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, current_page: p.current_page - 1 }))}
                  disabled={pagination.current_page === 1}
                  className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPagination(p => ({ ...p, current_page: p.current_page + 1 }))}
                  disabled={pagination.current_page === pagination.last_page}
                  className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteModal({ open: false, user: null })} />
          <div className="relative bg-card rounded-xl border border-border p-6 w-full max-w-md shadow-xl">
            <button
              onClick={() => setDeleteModal({ open: false, user: null })}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Hapus User?</h3>
                <p className="text-sm text-muted-foreground">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-foreground mb-6">
              Apakah Anda yakin ingin menghapus user <strong>{deleteModal.user?.name}</strong> ({deleteModal.user?.email})?
              Semua data terkait user ini akan dihapus permanen.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, user: null })}
                className="flex-1 py-2.5 px-4 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 rounded-lg bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Users;
