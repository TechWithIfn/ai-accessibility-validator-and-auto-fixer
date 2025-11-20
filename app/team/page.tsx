"use client";

import { Users, UserPlus, Mail, Calendar, TrendingUp } from 'lucide-react';

// Mock team data
const mockTeamMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    scans: 45,
    lastActive: '2024-01-15',
    avatar: 'JD',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Developer',
    scans: 32,
    lastActive: '2024-01-14',
    avatar: 'JS',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    role: 'Designer',
    scans: 18,
    lastActive: '2024-01-13',
    avatar: 'BW',
  },
];

const mockTeamStats = {
  totalMembers: 3,
  totalScans: 95,
  avgScore: 87.5,
  issuesFixed: 342,
};

export default function TeamPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Manage your team and track accessibility improvements</p>
        </div>
        <button className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
          <UserPlus className="w-5 h-5 mr-2" aria-hidden="true" />
          Invite Member
        </button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Team Members" value={mockTeamStats.totalMembers} icon={Users} />
        <StatCard label="Total Scans" value={mockTeamStats.totalScans} icon={TrendingUp} />
        <StatCard label="Avg Score" value={`${mockTeamStats.avgScore}%`} icon={TrendingUp} />
        <StatCard label="Issues Fixed" value={mockTeamStats.issuesFixed} icon={TrendingUp} />
      </div>

      {/* Team Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Team Members</h2>
        <div className="space-y-4">
          {mockTeamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <span className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" aria-hidden="true" />
                      {member.email}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" aria-hidden="true" />
                      Last active: {new Date(member.lastActive).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Scans</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{member.scans}</p>
                </div>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-sm rounded text-gray-700 dark:text-gray-300">
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Recent Activity</h2>
        <div className="space-y-4">
          <ActivityItem user="John Doe" action="scanned" target="https://example.com" time="2 hours ago" />
          <ActivityItem user="Jane Smith" action="fixed" target="3 accessibility issues" time="5 hours ago" />
          <ActivityItem user="Bob Wilson" action="generated report for" target="https://demo-site.com" time="1 day ago" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
        <Icon className="w-10 h-10 text-primary-600 dark:text-primary-400" aria-hidden="true" />
      </div>
    </div>
  );
}

function ActivityItem({ user, action, target, time }: { user: string; action: string; target: string; time: string }) {
  return (
    <div className="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
        {user.split(' ').map(n => n[0]).join('')}
      </div>
      <div className="flex-1">
        <p className="text-gray-900 dark:text-white">
          <span className="font-semibold">{user}</span> {action} <span className="text-primary-600 dark:text-primary-400">{target}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{time}</p>
      </div>
    </div>
  );
}

