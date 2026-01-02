import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { api } from '../services/api';
import { toast } from 'sonner';
import { Save, Edit2, X, RefreshCw } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration_months: number;
  features: string[];
}

interface PlansResponse {
  plans: Plan[];
}

const defaultPlans: Plan[] = [
  {
    id: 'PERSONAL',
    name: 'Personal',
    price: 49000,
    duration_months: 1,
    features: ['Akses semua tes', 'Laporan detail', 'Simpan riwayat'],
  },
  {
    id: 'PROFESSIONAL',
    name: 'Professional',
    price: 99000,
    duration_months: 1,
    features: ['Semua fitur Personal', 'Analisis mendalam', 'Rekomendasi karir', 'Export PDF'],
  },
  {
    id: 'ORGANIZATION',
    name: 'Organization',
    price: 499000,
    duration_months: 1,
    features: ['Semua fitur Professional', 'Dashboard tim', 'Laporan agregat', 'API akses'],
  },
];

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<PlansResponse>('/admin/plans');
      if (data.plans && data.plans.length > 0) {
        setPlans(data.plans);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data plans';
      setError(message);
      // Tetap gunakan default plans jika fetch gagal
      console.error('Failed to fetch plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan.id);
    setEditPrice(plan.price);
  };

  const handleSave = async (planId: string) => {
    setSaving(true);
    try {
      await api.put(`/admin/plans/${planId}`, { price: editPrice });
      setPlans(plans.map(p => p.id === planId ? { ...p, price: editPrice } : p));
      toast.success('Harga plan berhasil diperbarui');
      setEditingPlan(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan harga';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPlanColor = (planId: string) => {
    const colors: Record<string, string> = {
      PERSONAL: 'border-blue-500 bg-blue-500/5',
      PROFESSIONAL: 'border-purple-500 bg-purple-500/5',
      ORGANIZATION: 'border-orange-500 bg-orange-500/5',
    };
    return colors[planId] || 'border-border';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plans</h1>
          <p className="text-muted-foreground">Kelola harga paket langganan</p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                <div className="h-6 w-24 bg-muted rounded mb-4"></div>
                <div className="h-10 w-32 bg-muted rounded mb-6"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-4 w-3/4 bg-muted rounded"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={fetchPlans}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Coba Lagi
              </button>
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-card rounded-xl border-2 p-6 transition-all ${getPlanColor(plan.id)}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  {editingPlan !== plan.id ? (
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingPlan(null)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Price */}
                {editingPlan === plan.id ? (
                  <div className="mb-6">
                    <label className="block text-sm text-muted-foreground mb-2">Harga (IDR)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)}
                        className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        onClick={() => handleSave(plan.id)}
                        disabled={saving}
                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="text-3xl font-bold text-foreground">{formatCurrency(plan.price)}</p>
                    <p className="text-sm text-muted-foreground">per {plan.duration_months} bulan</p>
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div className="bg-muted/50 rounded-xl p-6">
          <h3 className="font-medium text-foreground mb-2">Catatan</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Perubahan harga akan berlaku untuk transaksi baru</li>
            <li>• Pengguna dengan langganan aktif tidak akan terpengaruh</li>
            <li>• Harga dalam Rupiah (IDR)</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Plans;
