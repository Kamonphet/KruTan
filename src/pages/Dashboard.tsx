import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LeaveRequest, SubstituteAssignment, SubStatus, LeaveStatus } from '../types';
import { Card } from '../components/UI';
import { Icons } from '../components/Icons';

interface DashboardProps {
  leaves: LeaveRequest[];
  subs: SubstituteAssignment[];
}

export const Dashboard: React.FC<DashboardProps> = ({ leaves, subs }) => {
  
  const pendingLeaves = leaves.filter(l => l.status === LeaveStatus.PENDING).length;
  const pendingSubs = subs.filter(s => s.status === SubStatus.REQUESTED).length;
  const filledSubs = subs.filter(s => s.status === SubStatus.ACCEPTED).length;

  const leaveStats = [
    { name: 'รออนุมัติ', value: pendingLeaves, color: '#F59E0B' },
    { name: 'อนุมัติแล้ว', value: leaves.filter(l => l.status === LeaveStatus.APPROVED).length, color: '#10B981' },
    { name: 'ไม่อนุมัติ', value: leaves.filter(l => l.status === LeaveStatus.REJECTED).length, color: '#EF4444' },
  ];

  const subStats = [
    { name: 'รอตอบรับ', count: pendingSubs },
    { name: 'ตอบรับแล้ว', count: filledSubs },
    { name: 'ปฏิเสธ', count: subs.filter(s => s.status === SubStatus.REJECTED).length },
  ];

  return (
    <div className="p-8 space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">สวัสดี, ผู้ดูแลระบบ</h1>
        <p className="text-slate-500 mt-1">ภาพรวมข้อมูลการเรียนการสอนประจำวัน</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-l-4 border-l-indigo-500">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-slate-500 text-sm font-medium mb-1">คำขอลาที่รออนุมัติ</div>
              <div className="text-4xl font-bold text-indigo-600">{pendingLeaves}</div>
            </div>
            <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
              <Icons.Leaves size={24} />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-slate-500 text-sm font-medium mb-1">คาบสอนแทนที่ยังไม่จัด</div>
              <div className="text-4xl font-bold text-amber-500">{pendingSubs}</div>
            </div>
            <div className="bg-amber-50 p-3 rounded-full text-amber-600">
              <Icons.Alert size={24} />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-slate-500 text-sm font-medium mb-1">คาบที่มีครูแทนแล้ว</div>
              <div className="text-4xl font-bold text-emerald-600">{filledSubs}</div>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
              <Icons.Check size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="สถานะการลาของครู">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {leaveStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="สถิติการตอบรับสอนแทน">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};