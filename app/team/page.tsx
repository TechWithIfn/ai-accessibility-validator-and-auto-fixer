"use client";

import { useState, useMemo } from 'react';
import {
  Users, UserPlus, Mail, Calendar, TrendingUp, Search, Filter, MoreVertical,
  Edit2, Trash2, Shield, Code, Activity, BarChart3, LineChart, PieChart,
  ChevronLeft, ChevronRight, ArrowUpDown, Clock, CheckCircle2, AlertCircle,
  Zap, Globe, Eye, Settings
} from 'lucide-react';
import {
  LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart as RechartsPieChart,
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Mock team data with more fields
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Developer' | 'Designer' | 'Manager';
  scans: number;
  issuesFixed: number;
  lastActive: string;
  avatar: string;
  status: 'active' | 'away' | 'offline';
  domain?: string;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    scans: 45,
    issuesFixed: 128,
    lastActive: '2024-01-15T10:30:00',
    avatar: 'JD',
    status: 'active',
    domain: 'example.com',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Developer',
    scans: 32,
    issuesFixed: 95,
    lastActive: '2024-01-14T14:20:00',
    avatar: 'JS',
    status: 'active',
    domain: 'demo-site.com',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'Designer',
    scans: 18,
    issuesFixed: 54,
    lastActive: '2024-01-13T09:15:00',
    avatar: 'BW',
    status: 'away',
    domain: 'test-app.com',
  },
  {
    id: '4',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Developer',
    scans: 28,
    issuesFixed: 87,
    lastActive: '2024-01-15T08:45:00',
    avatar: 'AJ',
    status: 'active',
    domain: 'example.com',
  },
  {
    id: '5',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'Manager',
    scans: 12,
    issuesFixed: 35,
    lastActive: '2024-01-12T16:30:00',
    avatar: 'CB',
    status: 'offline',
    domain: 'admin-portal.com',
  },
];

const mockTeamStats = {
  totalMembers: mockTeamMembers.length,
  totalScans: 135,
  avgScore: 87.5,
  issuesFixed: 399,
};

// Chart data
const scansOverTimeData = [
  { date: 'Jan 8', scans: 12 },
  { date: 'Jan 9', scans: 18 },
  { date: 'Jan 10', scans: 15 },
  { date: 'Jan 11', scans: 22 },
  { date: 'Jan 12', scans: 19 },
  { date: 'Jan 13', scans: 25 },
  { date: 'Jan 14', scans: 24 },
];

const issuesFixedByMember = mockTeamMembers.map(m => ({
  name: m.name.split(' ')[0],
  fixed: m.issuesFixed,
  color: m.role === 'Admin' ? '#3b82f6' : m.role === 'Developer' ? '#10b981' : m.role === 'Designer' ? '#f59e0b' : '#8b5cf6',
}));

const issueCategoriesData = [
  { name: 'Missing Alt Text', value: 142, color: '#ef4444' },
  { name: 'Color Contrast', value: 98, color: '#f59e0b' },
  { name: 'ARIA Labels', value: 76, color: '#3b82f6' },
  { name: 'Form Labels', value: 56, color: '#10b981' },
  { name: 'Semantic HTML', value: 27, color: '#8b5cf6' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

type SortField = 'name' | 'scans' | 'issuesFixed' | 'lastActive' | 'role';
type SortOrder = 'asc' | 'desc';

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const membersPerPage = 5;

  const filteredAndSortedMembers = useMemo(() => {
    let filtered = mockTeamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'lastActive') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [searchQuery, roleFilter, statusFilter, sortField, sortOrder]);

  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * membersPerPage;
    return filteredAndSortedMembers.slice(startIndex, startIndex + membersPerPage);
  }, [filteredAndSortedMembers, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedMembers.length / membersPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      Admin: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
      Developer: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
      Designer: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
      Manager: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
    };
    return colors[role] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const getStatusIndicator = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500 ring-green-500/30',
      away: 'bg-yellow-500 ring-yellow-500/30',
      offline: 'bg-gray-400 ring-gray-400/30',
    };
    return styles[status] || 'bg-gray-400';
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Team Dashboard
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Manage your team and track accessibility improvements
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-medium">
            <UserPlus className="w-5 h-5" aria-hidden="true" />
            Invite Member
          </button>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedStatCard
            label="Team Members"
            value={mockTeamStats.totalMembers}
            icon={Users}
            trend="+2 this month"
            gradient="from-blue-500 to-blue-600"
          />
          <EnhancedStatCard
            label="Total Scans"
            value={mockTeamStats.totalScans}
            icon={TrendingUp}
            trend="+15% vs last week"
            gradient="from-green-500 to-green-600"
          />
          <EnhancedStatCard
            label="Avg Score"
            value={`${mockTeamStats.avgScore}%`}
            icon={Activity}
            trend="+2.3% improved"
            gradient="from-purple-500 to-purple-600"
          />
          <EnhancedStatCard
            label="Issues Fixed"
            value={mockTeamStats.issuesFixed}
            icon={CheckCircle2}
            trend="+89 this week"
            gradient="from-indigo-500 to-indigo-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6">
              {/* Line Chart - Scans Over Time */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <LineChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scans Over Time</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last 7 days</p>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsLineChart data={scansOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'currentColor' }} />
                    <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="scans"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart - Issues Fixed by Member */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Issues Fixed by Team</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total fixes per member</p>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={issuesFixedByMember}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fill: 'currentColor' }} />
                    <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="fixed" radius={[8, 8, 0, 0]}>
                      {issuesFixedByMember.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Team Members Section */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {filteredAndSortedMembers.length} member{filteredAndSortedMembers.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="all">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Developer">Developer</option>
                      <option value="Designer">Designer</option>
                      <option value="Manager">Manager</option>
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="away">Away</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sortable Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="col-span-4 flex items-center gap-2 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors" onClick={() => handleSort('name')}>
                  Name
                  <ArrowUpDown className="w-4 h-4" />
                </div>
                <div className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors" onClick={() => handleSort('role')}>
                  Role
                  <ArrowUpDown className="w-4 h-4" />
                </div>
                <div className="col-span-2 flex items-center justify-center gap-2 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors" onClick={() => handleSort('scans')}>
                  Scans
                  <ArrowUpDown className="w-4 h-4" />
                </div>
                <div className="col-span-2 flex items-center justify-center gap-2 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors" onClick={() => handleSort('issuesFixed')}>
                  Fixed
                  <ArrowUpDown className="w-4 h-4" />
                </div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {/* Team Member Cards */}
              <div className="space-y-3">
                {paginatedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200"
                  >
                    <div className="md:col-span-4 flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">
                          {member.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusIndicator(member.status)} rounded-full border-2 border-white dark:border-gray-800 ring-2`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{member.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${getRoleBadgeColor(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-center gap-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">{member.scans}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Scans</div>
                      </div>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-center gap-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{member.issuesFixed}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Fixed</div>
                      </div>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-end gap-2">
                      <button
                        className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        title="Edit Member"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                        title="More Options"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {(currentPage - 1) * membersPerPage + 1} to {Math.min(currentPage * membersPerPage, filteredAndSortedMembers.length)} of {filteredAndSortedMembers.length} members
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          currentPage === page
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Recent Activity */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Team actions and updates</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <EnhancedActivityItem
                  user="John Doe"
                  action="scanned"
                  target="https://example.com"
                  time="2 hours ago"
                  type="scan"
                />
                <EnhancedActivityItem
                  user="Jane Smith"
                  action="fixed"
                  target="3 accessibility issues"
                  time="5 hours ago"
                  type="fix"
                />
                <EnhancedActivityItem
                  user="Bob Wilson"
                  action="generated report for"
                  target="https://demo-site.com"
                  time="1 day ago"
                  type="report"
                />
                <EnhancedActivityItem
                  user="Alice Johnson"
                  action="invited"
                  target="Sarah Connor to the team"
                  time="2 days ago"
                  type="invite"
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Analytics */}
          <div className="space-y-6">
            {/* Donut Chart - Issue Categories */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <PieChart className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Issue Categories</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Distribution by type</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={issueCategoriesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {issueCategoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {issueCategoriesData.map((category) => (
                  <div key={category.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{category.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-primary-100">Active Today</span>
                  <span className="text-2xl font-bold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-100">This Week</span>
                  <span className="text-2xl font-bold">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary-100">This Month</span>
                  <span className="text-2xl font-bold">542</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnhancedStatCard({ label, value, icon: Icon, trend, gradient }: {
  label: string;
  value: string | number;
  icon: any;
  trend?: string;
  gradient: string;
}) {
  return (
    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 overflow-hidden group hover:shadow-2xl transition-all duration-200">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EnhancedActivityItem({ user, action, target, time, type }: {
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'scan' | 'fix' | 'report' | 'invite';
}) {
  const getIcon = () => {
    switch (type) {
      case 'scan': return <Eye className="w-4 h-4" />;
      case 'fix': return <CheckCircle2 className="w-4 h-4" />;
      case 'report': return <BarChart3 className="w-4 h-4" />;
      case 'invite': return <UserPlus className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'scan': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'fix': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'report': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'invite': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
      <div className={`p-2 ${getIconColor()} rounded-lg flex-shrink-0`}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-900 dark:text-white">
          <span className="font-semibold">{user}</span> {action}{' '}
          <span className="text-primary-600 dark:text-primary-400 font-medium">{target}</span>
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="w-3 h-3 text-gray-400" />
          <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
        </div>
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
      </div>
    </div>
  );
}
