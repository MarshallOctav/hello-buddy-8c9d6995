import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { Users, Settings, Wallet, CheckCircle, XCircle, Clock, RefreshCw, Save } from 'lucide-react';

interface Affiliate {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  referral_code: string;
  is_active: boolean;
  balance: number;
  total_earned: number;
  total_referrals: number;
  created_at: string;
}

interface Withdrawal {
  id: number;
  affiliate: {
    id: number;
    user_name: string;
    user_email: string;
  };
  amount: number;
  payment_method: string;
  payment_method_label: string;
  bank_name: string | null;
  account_name: string;
  account_number: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  processed_at: string | null;
  created_at: string;
}

interface AffiliateSettings {
  whatsapp_cs: string;
  commission_percentage: number;
  discount_percentage: number;
  min_withdrawal: number;
}

type TabType = 'affiliates' | 'withdrawals' | 'settings';

const Affiliates: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('affiliates');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [withdrawalFilter, setWithdrawalFilter] = useState<string>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Settings state
  const [settingsForm, setSettingsForm] = useState<AffiliateSettings>({
    whatsapp_cs: '',
    commission_percentage: 10,
    discount_percentage: 5,
    min_withdrawal: 50000,
  });

  // Fetch affiliates
  const { data: affiliatesData, isLoading: affiliatesLoading } = useQuery({
    queryKey: ['admin-affiliates', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await api.get<{ success: boolean; data: Affiliate[] }>(`/admin/affiliates${params}`);
      return response.data;
    },
  });

  // Fetch withdrawals
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['admin-withdrawals', withdrawalFilter],
    queryFn: async () => {
      const params = withdrawalFilter !== 'all' ? `?status=${withdrawalFilter}` : '';
      const response = await api.get<{ success: boolean; data: Withdrawal[] }>(`/admin/withdrawals${params}`);
      return response.data;
    },
  });

  // Fetch settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['affiliate-settings'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: AffiliateSettings }>('/affiliate/settings');
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Update form when settings are loaded
  React.useEffect(() => {
    if (settingsData) {
      setSettingsForm(settingsData);
    }
  }, [settingsData]);

  // Toggle affiliate status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      return api.put(`/admin/affiliates/${id}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] });
      toast.success('Status affiliate berhasil diubah');
    },
    onError: () => {
      toast.error('Gagal mengubah status affiliate');
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: AffiliateSettings) => {
      return api.put('/admin/affiliate-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-settings'] });
      toast.success('Pengaturan berhasil disimpan');
    },
    onError: () => {
      toast.error('Gagal menyimpan pengaturan');
    },
  });

  // Process withdrawal mutation
  const processWithdrawalMutation = useMutation({
    mutationFn: async ({ id, action, notes }: { id: number; action: 'approve' | 'reject'; notes?: string }) => {
      return api.put(`/admin/withdrawals/${id}/process`, { action, notes });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] });
      toast.success(variables.action === 'approve' ? 'Penarikan disetujui' : 'Penarikan ditolak');
      setProcessingId(null);
      setShowRejectModal(null);
      setRejectNotes('');
    },
    onError: () => {
      toast.error('Gagal memproses penarikan');
      setProcessingId(null);
    },
  });

  const handleApprove = (id: number) => {
    setProcessingId(id);
    processWithdrawalMutation.mutate({ id, action: 'approve' });
  };

  const handleReject = (id: number) => {
    if (!rejectNotes.trim()) {
      toast.error('Masukkan alasan penolakan');
      return;
    }
    setProcessingId(id);
    processWithdrawalMutation.mutate({ id, action: 'reject', notes: rejectNotes });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400"><Clock className="h-3 w-3" /> Pending</span>;
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400"><CheckCircle className="h-3 w-3" /> Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'affiliates' as TabType, label: 'Daftar Affiliate', icon: Users },
    { id: 'withdrawals' as TabType, label: 'Penarikan Dana', icon: Wallet },
    { id: 'settings' as TabType, label: 'Pengaturan', icon: Settings },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Affiliates Tab */}
        {activeTab === 'affiliates' && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-affiliates'] })}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {affiliatesLoading ? (
                <div className="p-8 text-center text-muted-foreground">Memuat...</div>
              ) : !affiliatesData || affiliatesData.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Belum ada affiliate</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Kode Referral</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Saldo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total Pendapatan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Referral</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Terdaftar</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {affiliatesData.map((affiliate) => (
                        <tr key={affiliate.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">{affiliate.user.name}</p>
                              <p className="text-xs text-muted-foreground">{affiliate.user.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">{affiliate.referral_code}</code>
                          </td>
                          <td className="px-4 py-3">
                            {affiliate.is_active ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                <CheckCircle className="h-3 w-3" /> Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                                <XCircle className="h-3 w-3" /> Tidak Aktif
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">{formatCurrency(affiliate.balance)}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{formatCurrency(affiliate.total_earned)}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{affiliate.total_referrals}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(affiliate.created_at)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleStatusMutation.mutate(affiliate.id)}
                              disabled={toggleStatusMutation.isPending}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                affiliate.is_active
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              }`}
                            >
                              {affiliate.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-4">
              <select
                value={withdrawalFilter}
                onChange={(e) => setWithdrawalFilter(e.target.value)}
                className="px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">Semua</option>
              </select>
              <button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] })}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {withdrawalsLoading ? (
                <div className="p-8 text-center text-muted-foreground">Memuat...</div>
              ) : !withdrawalsData || withdrawalsData.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">Tidak ada data penarikan</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Affiliate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Jumlah</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Metode</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rekening</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tanggal</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {withdrawalsData.map((withdrawal) => (
                        <tr key={withdrawal.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">{withdrawal.affiliate.user_name}</p>
                              <p className="text-xs text-muted-foreground">{withdrawal.affiliate.user_email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-foreground">{formatCurrency(withdrawal.amount)}</td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm text-foreground">{withdrawal.payment_method_label}</p>
                              {withdrawal.bank_name && <p className="text-xs text-muted-foreground">{withdrawal.bank_name}</p>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm text-foreground">{withdrawal.account_name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{withdrawal.account_number}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(withdrawal.status)}
                            {withdrawal.admin_notes && (
                              <p className="text-xs text-muted-foreground mt-1">{withdrawal.admin_notes}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(withdrawal.created_at)}</td>
                          <td className="px-4 py-3">
                            {withdrawal.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprove(withdrawal.id)}
                                  disabled={processingId === withdrawal.id}
                                  className="px-3 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                >
                                  Setujui
                                </button>
                                <button
                                  onClick={() => setShowRejectModal(withdrawal.id)}
                                  disabled={processingId === withdrawal.id}
                                  className="px-3 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                >
                                  Tolak
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-xl space-y-6">
            {settingsLoading ? (
              <div className="p-8 text-center text-muted-foreground">Memuat...</div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                <h3 className="text-lg font-semibold text-foreground">Pengaturan Affiliate</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nomor WhatsApp CS</label>
                    <input
                      type="text"
                      value={settingsForm.whatsapp_cs}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_cs: e.target.value })}
                      placeholder="628123456789"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Format: 628xxx (tanpa + atau spasi)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Komisi Affiliate (%)</label>
                    <input
                      type="number"
                      value={settingsForm.commission_percentage}
                      onChange={(e) => setSettingsForm({ ...settingsForm, commission_percentage: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Persentase komisi yang diterima affiliate</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Diskon Referral (%)</label>
                    <input
                      type="number"
                      value={settingsForm.discount_percentage}
                      onChange={(e) => setSettingsForm({ ...settingsForm, discount_percentage: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Persentase diskon yang diberikan kepada user yang menggunakan kode referral</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Minimum Penarikan (Rp)</label>
                    <input
                      type="number"
                      value={settingsForm.min_withdrawal}
                      onChange={(e) => setSettingsForm({ ...settingsForm, min_withdrawal: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="1000"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Jumlah minimum untuk penarikan dana</p>
                  </div>
                </div>

                <button
                  onClick={() => updateSettingsMutation.mutate(settingsForm)}
                  disabled={updateSettingsMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {updateSettingsMutation.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Tolak Penarikan</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Alasan Penolakan</label>
                  <textarea
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    rows={3}
                    placeholder="Masukkan alasan penolakan..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowRejectModal(null);
                      setRejectNotes('');
                    }}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleReject(showRejectModal)}
                    disabled={processingId === showRejectModal}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {processingId === showRejectModal ? 'Memproses...' : 'Tolak Penarikan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Affiliates;
