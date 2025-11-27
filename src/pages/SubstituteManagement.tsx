import React, { useState } from 'react';
import { LeaveRequest, LeaveStatus, SubstituteAssignment, TimeSlot, Teacher, Subject, ClassRoom, SubStatus, ScheduleItem } from '../types';
import { Icons } from '../components/Icons';
import { Button, Card, Badge, Modal, Input, Select } from '../components/UI';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

interface SubstituteManagementProps {
  leaves: LeaveRequest[];
  subs: SubstituteAssignment[];
  teachers: Teacher[];
  subjects: Subject[];
  classes: ClassRoom[];
  timeSlots: TimeSlot[];
  schedules: ScheduleItem[];
  onFindTeachers: (date: string, period: number, subjectId?: string) => any[];
  onAssignSub: (sub: any) => void;
  onUpdateSub: (sub: SubstituteAssignment) => void;
  onDeleteSub: (id: string) => void;
  onRespondToReq: (subId: string, status: SubStatus, reason?: string) => void;
}

export const SubstituteManagement: React.FC<SubstituteManagementProps> = ({
  leaves, subs, teachers, subjects, classes, timeSlots, schedules, onFindTeachers, onAssignSub, onUpdateSub, onDeleteSub, onRespondToReq
}) => {
  const { showToast } = useToast();
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null); // For editing existing sub
  
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Default to Newest first

  // 1. Get actionable leaves
  const actionableLeaves = leaves.filter(l => l.status === LeaveStatus.APPROVED);

  // 2. Filter and Sort
  const filteredLeaves = actionableLeaves.filter(leave => {
    const teacher = teachers.find(t => t.id === leave.teacherId);
    const teacherName = teacher?.name.toLowerCase() || '';
    const term = searchTerm.toLowerCase();
    return teacherName.includes(term) || leave.reason.toLowerCase().includes(term);
  }).sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const handleOpenAssignment = (leave: LeaveRequest, period: number, existingSubId?: string) => {
    setSelectedLeave(leave);
    setSelectedPeriod(period);
    setEditingSubId(existingSubId || null);
  };

  const getSubjectInfo = (teacherId: string, date: string, period: number) => {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getUTCDay(); // Use UTC day as dates are normalized YYYY-MM-DD
    const slot = timeSlots.find(ts => ts.periodNumber === period);
    if (!slot) return null;
    
    const schedule = schedules.find(s => 
      s.teacherId === teacherId && 
      s.dayOfWeek === dayOfWeek && 
      s.timeSlotId === slot.id
    );
    
    return schedule ? subjects.find(s => s.id === schedule.subjectId) : null;
  };

  const handleCopy = (leave: LeaveRequest) => {
    const dateObj = new Date(leave.date);
    const dateStr = dateObj.toLocaleDateString('th-TH', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    
    const teacher = teachers.find(t => t.id === leave.teacherId);
    const teacherName = teacher ? teacher.name : '-';

    const entries = leave.periodNumbers.map(period => {
        const sub = subs.find(s => s.leaveRequestId === leave.id && s.periodNumber === period && s.status !== SubStatus.REJECTED);
        const subName = sub ? teachers.find(t => t.id === sub.subTeacherId)?.name : 'รอจัดครูแทน';
        const subject = getSubjectInfo(leave.teacherId, leave.date, period);
        const subjectName = subject ? `${subject.name} (${subject.code})` : 'ไม่ระบุวิชา';

        return `      👩‍🏫 ครู${teacherName} เหตุผล ${leave.reason}
      🏫 สอนแทนโดย ครู${subName || '...'}
      🕛 คาบที่ ${period} วิชา ${subjectName}`;
    });

    const text = `รายละเอียดการสอนแทน 📅${dateStr}\n${entries.join('\n        ---------------------------------------------\n')}`;

    navigator.clipboard.writeText(text);
    showToast('คัดลอกข้อมูลเรียบร้อยแล้ว');
  };

  const handleDelete = () => {
      if (deleteSubId) {
          onDeleteSub(deleteSubId);
          showToast('ลบการจัดสอนแทนเรียบร้อยแล้ว', 'success');
          setDeleteSubId(null);
      }
  }

  // Mock context for available teachers modal
  const availableTeachers = selectedLeave && selectedPeriod !== null 
    ? onFindTeachers(selectedLeave.date, selectedPeriod, 's1') 
    : [];

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">จัดการสอนแทน</h1>
        <p className="text-slate-500">มอบหมายครูสอนแทนสำหรับชั่วโมงที่มีการลา</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="w-full md:w-1/2 relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                  type="text" 
                  placeholder="ค้นหาชื่อครูที่ลา หรือ เหตุผล..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
          </div>
          <div className="flex items-center justify-between md:justify-end gap-2">
             <span className="text-sm text-slate-500 whitespace-nowrap">เรียงตามวันที่:</span>
             <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                icon={Icons.Sort}
             >
                 {sortOrder === 'asc' ? 'เก่า -> ใหม่' : 'ใหม่ -> เก่า'}
             </Button>
          </div>
      </div>

      <div className="grid gap-6">
        {filteredLeaves.map(leave => (
          <Card key={leave.id} className="overflow-hidden border-l-4 border-l-indigo-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex flex-col items-center justify-center border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{new Date(leave.date).toLocaleString('en-US', { month: 'short' })}</span>
                    <span className="text-xl font-bold text-slate-800">{new Date(leave.date).getDate()}</span>
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">{teachers.find(t => t.id === leave.teacherId)?.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>ลา: {leave.reason}</span>
                    </div>
                </div>
              </div>
              <Button variant="secondary" size="sm" icon={Icons.Copy} onClick={() => handleCopy(leave)} className="self-start md:self-auto">
                คัดลอกข้อความ
              </Button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">เลือกคาบเรียนเพื่อจัดสอนแทน</div>
              <div className="flex flex-wrap gap-3">
                {leave.periodNumbers.map(period => {
                  const existingSub = subs.find(s => s.leaveRequestId === leave.id && s.periodNumber === period && s.status !== SubStatus.REJECTED);
                  const subTeacher = existingSub ? teachers.find(t => t.id === existingSub.subTeacherId) : null;
                  const isPending = existingSub?.status === SubStatus.REQUESTED;
                  const subject = getSubjectInfo(leave.teacherId, leave.date, period);

                  if (existingSub) {
                     return (
                        <div key={period} className={`flex items-center gap-3 pl-3 pr-2 py-2 rounded-lg border shadow-sm transition-all w-full sm:w-auto ${
                            isPending ? 'bg-white border-amber-200 shadow-amber-100' : 'bg-emerald-50 border-emerald-200'
                        }`}>
                            <div className="flex flex-col flex-1 sm:flex-none">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold text-slate-400">คาบ {period}</span>
                                    {subject && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">{subject.code}</span>}
                                </div>
                                <span className={`font-bold text-sm ${isPending ? 'text-slate-700' : 'text-emerald-700'}`}>
                                    {subTeacher?.name}
                                </span>
                                {subject && <span className="text-xs text-slate-500">{subject.name}</span>}
                            </div>
                            
                            {isPending ? (
                                <div className="flex gap-1 ml-2">
                                    <button onClick={() => onRespondToReq(existingSub.id, SubStatus.ACCEPTED)} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md hover:bg-emerald-200 transition"><Icons.Check size={14} /></button>
                                    <button onClick={() => onRespondToReq(existingSub.id, SubStatus.REJECTED)} className="p-1.5 bg-rose-100 text-rose-600 rounded-md hover:bg-rose-200 transition"><Icons.Reject size={14} /></button>
                                    <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                    <button onClick={() => handleOpenAssignment(leave, period, existingSub.id)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition"><Icons.Edit size={14} /></button>
                                    <button onClick={() => setDeleteSubId(existingSub.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"><Icons.Delete size={14} /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                                    <div className="hidden sm:block"><Badge variant="success">ตอบรับแล้ว</Badge></div>
                                    <button onClick={() => handleOpenAssignment(leave, period, existingSub.id)} className="p-1 text-slate-400 hover:text-indigo-600 rounded-md transition"><Icons.Edit size={14} /></button>
                                    <button onClick={() => setDeleteSubId(existingSub.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition"><Icons.Delete size={14} /></button>
                                </div>
                            )}
                        </div>
                     )
                  }

                  return (
                    <button
                      key={period}
                      onClick={() => handleOpenAssignment(leave, period)}
                      className="group flex flex-col items-start gap-1 bg-white border border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all w-full sm:w-auto"
                    >
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-indigo-600 group-hover:scale-105 transition-transform">คาบ {period}</span>
                         <Icons.Add size={14} className="text-slate-300 group-hover:text-indigo-500" />
                      </div>
                      {subject ? (
                          <div className="flex flex-col items-start">
                            <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-700">{subject.code}</span>
                            <span className="text-[10px] text-slate-400 group-hover:text-indigo-500">{subject.name}</span>
                          </div>
                      ) : (
                          <span className="text-xs text-slate-400 group-hover:text-indigo-500">ว่าง</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}

        {filteredLeaves.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Icons.Search size={32} />
                </div>
                <h3 className="text-slate-800 font-medium">ไม่พบข้อมูลที่ค้นหา</h3>
                <p className="text-slate-500 text-sm mt-1">ลองปรับเปลี่ยนคำค้นหาหรือตัวกรอง</p>
            </div>
        )}
      </div>

      {/* Modal for selecting substitute */}
      <Modal 
        isOpen={!!selectedLeave && selectedPeriod !== null} 
        onClose={() => { setSelectedLeave(null); setEditingSubId(null); }}
        title={editingSubId ? "แก้ไขครูสอนแทน" : "เลือกครูสอนแทน"}
      >
        <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 text-sm text-indigo-900">
              <div className="flex justify-between mb-1">
                  <span className="text-indigo-500">วันที่:</span>
                  <span className="font-semibold">
                    {selectedLeave?.date && new Date(selectedLeave.date).toLocaleDateString('th-TH', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
              </div>
              <div className="flex justify-between">
                  <span className="text-indigo-500">คาบที่:</span>
                  <span className="font-semibold">{selectedPeriod}</span>
              </div>
              {(() => {
                 const subj = selectedLeave && selectedPeriod ? getSubjectInfo(selectedLeave.teacherId, selectedLeave.date, selectedPeriod) : null;
                 return subj ? (
                    <div className="flex justify-between mt-1">
                        <span className="text-indigo-500">วิชา:</span>
                        <span className="font-semibold">{subj.name} ({subj.code})</span>
                    </div>
                 ) : null;
              })()}
            </div>

            <div className="space-y-2">
              {availableTeachers.map((t: any) => {
                const isOverloaded = t.workload >= 3;
                
                let workloadColor = 'text-slate-400';
                if (t.workload === 0) workloadColor = 'text-emerald-600';
                else if (t.workload < 3) workloadColor = 'text-amber-600';
                else workloadColor = 'text-rose-600';

                return (
                <button 
                    key={t.id} 
                    disabled={isOverloaded}
                    onClick={() => {
                        if (isOverloaded) return;
                        const subj = selectedLeave && selectedPeriod ? getSubjectInfo(selectedLeave.teacherId, selectedLeave.date, selectedPeriod) : null;
                        const subData = {
                            leaveRequestId: selectedLeave!.id,
                            originalTeacherId: selectedLeave!.teacherId,
                            subTeacherId: t.id,
                            date: selectedLeave!.date,
                            periodNumber: selectedPeriod!,
                            classId: 'c1', // In real app, this would come from schedule too
                            subjectId: subj?.id || 's1'
                        };
                        
                        if (editingSubId) {
                            const existingSub = subs.find(s => s.id === editingSubId);
                            if (existingSub) {
                                onUpdateSub({ ...existingSub, ...subData, id: editingSubId, status: SubStatus.REQUESTED }); 
                                showToast('แก้ไขครูสอนแทนเรียบร้อยแล้ว', 'success');
                            }
                        } else {
                            onAssignSub(subData);
                            showToast('มอบหมายครูสอนแทนเรียบร้อยแล้ว', 'success');
                        }
                        
                        setSelectedLeave(null);
                        setEditingSubId(null);
                    }}
                    className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all group text-left
                        ${isOverloaded 
                            ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' 
                            : 'bg-white border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer'
                        }
                    `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${t.isExpert ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className={`font-bold ${isOverloaded ? 'text-slate-500' : 'text-slate-700 group-hover:text-indigo-700'}`}>{t.name}</div>
                      <div className={`text-xs ${workloadColor} flex items-center gap-1`}>
                         {isOverloaded && <Icons.Alert size={12} />}
                         ภาระงานวันนี้: {t.workload} คาบ
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                      {t.isExpert && <Badge variant="success">เชี่ยวชาญ</Badge>}
                      {isOverloaded && <span className="text-[10px] font-bold text-rose-500 border border-rose-200 bg-rose-50 px-2 py-0.5 rounded-full">เต็ม</span>}
                  </div>
                </button>
              )})}
            </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteSubId}
        onClose={() => setDeleteSubId(null)}
        onConfirm={handleDelete}
        title="ยืนยันการลบการสอนแทน"
        message="คุณแน่ใจหรือไม่ที่จะยกเลิกการสอนแทนรายการนี้?"
      />
    </div>
  );
};