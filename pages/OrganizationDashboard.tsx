
import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { useLanguage } from '../services/languageContext';
import { getMockTests } from '../constants';
import { 
  Building2, Users, FileBarChart, PieChart, Plus, Download, Calendar, 
  Target, TrendingUp, Search, Shield, Settings, UserPlus, Trash2, 
  Crown, Briefcase, Layers, X, Check, Eye, LayoutDashboard, ChevronRight,
  MoreVertical, Clock, Bell, Info, Mail, UserCheck, AlertCircle
} from 'lucide-react';
import Button from '../components/Button';
import { Modal } from '../components/Modal';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { OrgRole, Group, Assignment } from '../types';

export const OrganizationDashboard = () => {
  const { user, organization } = useAuth();
  const { content, language } = useLanguage();
  const allTests = getMockTests(language);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'assignments' | 'analytics' | 'settings'>('overview');

  // B2B State
  const [groups, setGroups] = useState<Group[]>([
    { id: 'g1', name: 'Sales Department', type: 'Team', memberCount: 12, avgScore: 78 },
    { id: 'g2', name: 'Engineering', type: 'Team', memberCount: 24, avgScore: 85 },
    { id: 'g3', name: 'Product Management', type: 'Team', memberCount: 8, avgScore: 82 },
  ]);

  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: 'a1', testId: 't_drd', testTitle: 'Decision Readiness Diagnostic', groupId: 'g1', groupName: 'Sales Department', dueDate: '2024-11-15', completionRate: 85, status: 'ACTIVE', assignedBy: 'Alex Diagnos' },
    { id: 'a2', testId: 't_tsd', testTitle: 'Timing Sensitivity Diagnostic', groupId: 'g2', groupName: 'Engineering', dueDate: '2024-11-20', completionRate: 42, status: 'ACTIVE', assignedBy: 'Alex Diagnos' },
    { id: 'a3', testId: 't_emd', testTitle: 'Energy & Momentum Diagnostic', groupId: 'g3', groupName: 'Product Management', dueDate: '2024-10-30', completionRate: 100, status: 'COMPLETED', assignedBy: 'Alex Diagnos' },
  ]);

  const [members, setMembers] = useState([
    { id: 'u1', name: 'Alex Diagnos', email: 'alex@diagnospace.com', role: OrgRole.OWNER, joined: 'Oct 2023', status: 'Active', avatar: 'AD', groupIds: ['g2'] },
    { id: 'u2', name: 'Sarah Jenkins', email: 'sarah@corp.com', role: OrgRole.ADMIN, joined: 'Nov 2023', status: 'Active', avatar: 'SJ', groupIds: ['g1', 'g3'] },
    { id: 'u3', name: 'Mike Manager', email: 'mike@corp.com', role: OrgRole.MANAGER, joined: 'Nov 2023', status: 'Active', avatar: 'MT', groupIds: ['g1'] },
    { id: 'u4', name: 'Analytics Viewer', email: 'view@corp.com', role: OrgRole.VIEWER, joined: 'Jan 2024', status: 'Active', avatar: 'AV', groupIds: [] },
  ]);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Form States
  const [newAssignment, setNewAssignment] = useState({ testId: '', groupId: '', dueDate: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgRole>(OrgRole.MEMBER);

  if (!organization || !user) return <div className="p-12 text-center font-bold">Access Denied</div>;

  // RBAC Helpers
  const userRole = user.orgRole as OrgRole;
  const isManagement = [OrgRole.OWNER, OrgRole.ADMIN].includes(userRole);
  const canAssign = [OrgRole.OWNER, OrgRole.ADMIN, OrgRole.MANAGER].includes(userRole);

  const handleAssignTest = () => {
    const test = allTests.find(t => t.id === newAssignment.testId);
    const group = groups.find(g => g.id === newAssignment.groupId);
    if (!test || !group) return;

    const assignment: Assignment = {
      id: `a${Date.now()}`,
      testId: test.id,
      testTitle: test.title,
      groupId: group.id,
      groupName: group.name,
      dueDate: newAssignment.dueDate,
      completionRate: 0,
      status: 'ACTIVE',
      assignedBy: user.name
    };

    setAssignments([assignment, ...assignments]);
    setIsAssignModalOpen(false);
    setNewAssignment({ testId: '', groupId: '', dueDate: '' });
  };

  const handleInvite = () => {
    // Mock invite
    alert(`Invite sent to ${inviteEmail} as ${inviteRole}`);
    setIsInviteModalOpen(false);
    setInviteEmail('');
  };

  const getRoleStyle = (r: OrgRole) => {
    switch (r) {
      case OrgRole.OWNER: return 'bg-purple-100 text-purple-700 border-purple-200';
      case OrgRole.ADMIN: return 'bg-blue-100 text-blue-700 border-blue-200';
      case OrgRole.MANAGER: return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusStyle = (status: string) => {
    return status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Portal Sidebar */}
      <aside className="fixed left-0 top-20 bottom-0 w-64 bg-white border-r border-slate-200 z-10 hidden lg:block">
        <div className="flex flex-col h-full py-6">
          <div className="px-6 mb-8">
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
               <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
                 {organization.name.charAt(0)}
               </div>
               <div className="overflow-hidden">
                 <p className="text-sm font-bold text-slate-900 truncate">{organization.name}</p>
                 <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{organization.plan} PLAN</p>
               </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'members', label: 'Team Members', icon: Users, visible: isManagement },
              { id: 'assignments', label: 'Assignments', icon: Target, visible: canAssign },
              { id: 'analytics', label: 'Organization IQ', icon: FileBarChart },
              { id: 'settings', label: 'Settings', icon: Settings, visible: isManagement },
            ].filter(i => i.visible !== false).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="px-4 mt-auto">
            <div className="p-4 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-xs font-bold text-slate-400 mb-1">Signed in as</p>
                 <p className="text-sm font-bold truncate">{user.name}</p>
                 <span className="inline-block mt-2 px-2 py-0.5 rounded-lg bg-white/10 text-[10px] font-bold uppercase tracking-wider">{userRole}</span>
               </div>
               <div className="absolute -right-4 -bottom-4 h-16 w-16 bg-white/5 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-8 pt-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                 {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
               </h1>
               <p className="text-slate-500 font-medium">Manage and track your organization's diagnostic progress.</p>
             </div>
             <div className="flex gap-3">
                {canAssign && (
                  <Button variant="gradient" size="sm" onClick={() => setIsAssignModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> New Assignment
                  </Button>
                )}
                {isManagement && (
                   <Button variant="outline" size="sm" onClick={() => setIsInviteModalOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" /> Invite Member
                  </Button>
                )}
             </div>
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Active Members', value: members.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Active Tests', value: assignments.filter(a => a.status === 'ACTIVE').length, icon: Target, color: 'text-orange-600', bg: 'bg-orange-50' },
                      { label: 'Completed', value: assignments.filter(a => a.status === 'COMPLETED').length, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
                      { label: 'Org Health', value: '72/100', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-hover hover:shadow-md">
                        <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                          <stat.icon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
                      </div>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                       <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                         <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900">Recent Assignments</h3>
                            <button onClick={() => setActiveTab('assignments')} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                         </div>
                         <div className="divide-y divide-slate-100">
                           {assignments.slice(0, 3).map(a => (
                             <div key={a.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-4">
                                   <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                      <FileBarChart className="h-5 w-5" />
                                   </div>
                                   <div>
                                     <p className="text-sm font-bold text-slate-900">{a.testTitle}</p>
                                     <p className="text-xs text-slate-500">{a.groupName} • Due {a.dueDate}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-6">
                                   <div className="hidden sm:flex items-center gap-2">
                                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600" style={{width: `${a.completionRate}%`}}></div>
                                      </div>
                                      <span className="text-xs font-bold text-slate-600">{a.completionRate}%</span>
                                   </div>
                                   <ChevronRight className="h-4 w-4 text-slate-300" />
                                </div>
                             </div>
                           ))}
                         </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                          <h3 className="font-bold text-slate-900 mb-6">Group Performance</h3>
                          <div className="space-y-4">
                            {groups.map(g => (
                              <div key={g.id} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                  <span className="text-slate-500">{g.name}</span>
                                  <span className="text-indigo-600">{g.avgScore}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{width: `${g.avgScore}%`}}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* MEMBERS */}
            {activeTab === 'members' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" placeholder="Search members..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsGroupModalOpen(true)}>
                    <Layers className="h-4 w-4 mr-2" /> Manage Groups
                  </Button>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="px-6 py-4">Member</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                              {m.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{m.name}</p>
                              <p className="text-xs text-slate-500">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getRoleStyle(m.role)}`}>
                            {m.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                          {m.status}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-slate-400 hover:text-slate-900"><MoreVertical className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ASSIGNMENTS */}
            {activeTab === 'assignments' && (
              <div className="grid grid-cols-1 gap-6">
                {assignments.map(a => (
                  <div key={a.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Target className="h-8 w-8" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-lg font-bold text-slate-900">{a.testTitle}</h3>
                      <p className="text-sm text-slate-500">Assigned to <span className="font-bold text-slate-700">{a.groupName}</span> • Due <span className="font-bold text-red-500">{a.dueDate}</span></p>
                    </div>
                    <div className="w-full md:w-48 space-y-2">
                       <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                         <span>Completion</span>
                         <span>{a.completionRate}%</span>
                       </div>
                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-green-500" style={{width: `${a.completionRate}%`}}></div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(a.status)}`}>{a.status}</span>
                       <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-red-50 hover:text-red-600">
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                 <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-8">Performance Trend (Organization)</h3>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={[
                           { name: 'Week 1', score: 65 },
                           { name: 'Week 2', score: 68 },
                           { name: 'Week 3', score: 75 },
                           { name: 'Week 4', score: 72 },
                           { name: 'Week 5', score: 80 },
                           { name: 'Week 6', score: 85 },
                         ]}>
                            <defs>
                              <linearGradient id="colorPortal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                            <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                            <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorPortal)" />
                         </AreaChart>
                      </ResponsiveContainer>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* PORTAL MODALS */}

      {/* New Assignment Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Create New Assignment">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Test</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              value={newAssignment.testId}
              onChange={(e) => setNewAssignment({...newAssignment, testId: e.target.value})}
            >
              <option value="">Select a diagnostic...</option>
              {allTests.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Group</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              value={newAssignment.groupId}
              onChange={(e) => setNewAssignment({...newAssignment, groupId: e.target.value})}
            >
              <option value="">Select target group...</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Due Date</label>
            <input 
              type="date" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              value={newAssignment.dueDate}
              onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
            />
          </div>
          <div className="pt-4 border-t border-slate-100 flex gap-3">
             <Button variant="outline" className="flex-1" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
             <Button variant="primary" className="flex-1" onClick={handleAssignTest} disabled={!newAssignment.testId || !newAssignment.groupId}>Assign Test</Button>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Team Member">
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed font-medium">Invitations will be sent via email. Members will gain access to your organization dashboard once they accept.</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Role</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as OrgRole)}
            >
              <option value={OrgRole.MEMBER}>Member (Take tests only)</option>
              <option value={OrgRole.MANAGER}>Manager (Create assignments)</option>
              <option value={OrgRole.ADMIN}>Admin (Full control)</option>
              <option value={OrgRole.VIEWER}>Viewer (Analytics only)</option>
            </select>
          </div>
          <Button variant="primary" className="w-full" onClick={handleInvite} disabled={!inviteEmail}>Send Invitation</Button>
        </div>
      </Modal>

      {/* Group Manager Modal */}
      <Modal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} title="Department Management">
        <div className="space-y-6">
           <div className="space-y-3">
              {groups.map(g => (
                <div key={g.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                         <Layers className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{g.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{g.memberCount} Members</p>
                      </div>
                   </div>
                   <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
           </div>
           <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-xs font-bold text-slate-900 mb-3">Create New Department</p>
              <div className="flex gap-2">
                 <input type="text" placeholder="e.g. Marketing" className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-sm" />
                 <Button size="sm" variant="secondary">Add</Button>
              </div>
           </div>
        </div>
      </Modal>
    </div>
  );
};
