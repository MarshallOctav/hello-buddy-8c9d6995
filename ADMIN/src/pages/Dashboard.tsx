import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { api } from '../services/api';
import { toast } from 'sonner';
import { Users, CreditCard, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface Stats {
  totalUsers: number;
  totalPayments: number;
  totalRevenue: number;
  activeSubscriptions: number;
  usersByMonth?: { month: string; count: number }[];
  revenueByMonth?: { month: string; amount: number }[];
  planDistribution?: { name: string; value: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

// Default mock data untuk charts jika API tidak mengembalikan data
const defaultUsersByMonth = [
  { month: 'Jan', count: 12 },
  { month: 'Feb', count: 19 },
  { month: 'Mar', count: 25 },
  { month: 'Apr', count: 32 },
  { month: 'Mei', count: 45 },
  { month: 'Jun', count: 58 },
];

const defaultRevenueByMonth = [
  { month: 'Jan', amount: 1500000 },
  { month: 'Feb', amount: 2300000 },
  { month: 'Mar', amount: 3100000 },
  { month: 'Apr', amount: 4200000 },
  { month: 'Mei', amount: 5500000 },
  { month: 'Jun', amount: 6800000 },
];

const defaultPlanDistribution = [
  { name: 'Free', value: 65 },
  { name: 'Basic', value: 20 },
  { name: 'Pro', value: 12 },
  { name: 'Enterprise', value: 3 },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPayments: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Stats>('/admin/stats');
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat statistik';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      name: 'Total Transaksi',
      value: stats.totalPayments,
      icon: CreditCard,
      color: 'bg-green-500/10 text-green-500',
    },
    {
      name: 'Total Pendapatan',
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      name: 'Langganan Aktif',
      value: stats.activeSubscriptions,
      icon: Activity,
      color: 'bg-orange-500/10 text-orange-500',
    },
  ];

  const usersByMonth = stats.usersByMonth || defaultUsersByMonth;
  const revenueByMonth = stats.revenueByMonth || defaultRevenueByMonth;
  const planDistribution = stats.planDistribution || defaultPlanDistribution;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Ringkasan data DiagnoSpace</p>
        </div>

        {/* Stats Grid */}
        {error ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={fetchStats}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <div
                key={stat.name}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {loading ? (
                        <span className="animate-pulse bg-muted rounded h-8 w-20 block"></span>
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Charts Section */}
        {!error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Pertumbuhan User</h2>
              <div className="h-64">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-pulse bg-muted rounded w-full h-full"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usersByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Pendapatan Bulanan</h2>
              <div className="h-64">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-pulse bg-muted rounded w-full h-full"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis
                        tickFormatter={formatShortCurrency}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Plan Distribution Chart */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Distribusi Plan</h2>
              <div className="h-64">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-pulse bg-muted rounded w-full h-full"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                      >
                        {planDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                        }}
                      />
                      <Legend
                        wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Ringkasan Aktivitas</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">User baru bulan ini</span>
                  <span className="text-xl font-bold text-foreground">
                    {loading ? '...' : usersByMonth[usersByMonth.length - 1]?.count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Pendapatan bulan ini</span>
                  <span className="text-xl font-bold text-foreground">
                    {loading ? '...' : formatCurrency(revenueByMonth[revenueByMonth.length - 1]?.amount || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Tingkat konversi</span>
                  <span className="text-xl font-bold text-primary">
                    {loading ? '...' : `${((stats.activeSubscriptions / stats.totalUsers) * 100 || 0).toFixed(1)}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="/users"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Kelola Users</span>
            </a>
            <a
              href="/plans"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Kelola Plans</span>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
