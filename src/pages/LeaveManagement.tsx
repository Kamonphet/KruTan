import React, { useState } from 'react';
import { LeaveRequest, LeaveStatus, Teacher, TimeSlot } from '../types';
import { Icons } from '../components/Icons';
import { Button, Table, TableRow, TableCell, Badge, Input, Select, Modal, Pagination } from '../components/UI';
import { useToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

interface LeaveManagementProps {
  leaves: LeaveRequest[];
  teachers: Teacher[];
  timeSlots: TimeSlot[];
  onAddLeave: (req: any) => void;
  onEditLeave: (req: LeaveRequest) => void;
  onDeleteLeave: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const ITEMS_PER_PAGE = 10;

export const LeaveManagement: React.FC<LeaveManagementProps> = ({
  leaves, teachers, timeSlots, onAddLeave, onEditLeave, onDeleteLeave, onApprove, onReject
}) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');
  const [date, setDate] = useState('');
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [reason, setReason] = useState('');

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Newest first default

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Logic
  const filteredLeaves = leaves.filter(leave => {
      const teacher = teachers.find(t => t.id === leave.teacherId);
      const teacherName = teacher?.name.toLowerCase() || '';
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = teacherName.includes(search) || leave.reason.toLowerCase().includes(search);
      const matchesStatus = statusFilter === 'ALL' || leave.status === statusFilter;

      return matchesSearch && matchesStatus;
  }).sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const totalPages = Math.ceil(filteredLeaves.length / ITEMS_PER_PAGE);
  const paginatedLeaves = filteredLeaves.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleOpenModal = (leave?: LeaveRequest) => {
    if (leave) {
        setEditingId(leave.id);
        setTeacherId(leave.teacherId);
        setDate(leave.date);
        setSelectedPeriods(leave.periodNumbers);
        setReason(leave.reason);
    } else {
        setEditingId(null);
        setTeacherId(teachers[0]?.id || '');
        setDate('');
        setSelectedPeriods([]);
        setReason('');
    }
    setIsModalOpen(true);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!date || selectedPeriods.length === 0) return;
    
    if (editingId) {
        const originalLeave = leaves.find(l => l.id === editingId);
        if (originalLeave) {
            onEditLeave({ 
                ...originalLeave, 
                teacherId, 
                date, 
                periodNumbers: selectedPeriods, 
                reason 
            });
            showToast('แก้ไขการลาเรียบร้อยแล้ว', 'success');
        }
    } else {
        onAddLeave({ teacherId, date, periodNumbers: selectedPeriods, reason });
        showToast('ยื่นใบลาเรียบร้อยแล้ว', 'success');
    }
    
    setIsModalOpen(false);
    setReason('');
    setSelectedPeriods([]);
    setCurrentPage(1);
  };

  const handleDelete = () => {
      if (deleteId) {
          onDeleteLeave(deleteId);
          showToast('ลบใบลาเรียบร้อยแล้ว', 'success');
          setDeleteId(null);
      }
  }

  const handleApprove = (id: string) => {
      onApprove(id);
      showToast('อนุมัติการลาเรียบร้อยแล้ว', 'success');
  };

  const handleReject = (id: string) => {
      onReject(id);
      showToast('ปฏิเสธการลาเรียบร้อยแล้ว', 'info');
  };

  const togglePeriod = (p: number) => {
    setSelectedPeriods(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p].sort());
  }

  const getStatusVariant = (status: LeaveStatus) => {
      switch(status) {
          case LeaveStatus.APPROVED: return 'success';
          case LeaveStatus.REJECTED: return 'danger';
          default: return 'warning';
      }
  }

  const getStatusLabel = (status: LeaveStatus) => {
      switch(status) {
          case LeaveStatus.APPROVED: return 'อนุมัติแล้ว';
          case LeaveStatus.REJECTED: return 'ไม่อนุมัติ';
          default: return 'รออนุมัติ';
      }
  }

  const formatDate = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return dateString;
      return dateObj.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="p-4 md:p-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">จัดการการลา</h1>
                <p className="text-slate-500">อนุมัติการลาและสร้างคำขอใหม่</p>
            </div>
            <Button onClick={() => handleOpenModal()} icon={Icons.Add} className="w-full md:w-auto">ยื่นใบลา</Button>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
                <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="ค้นหาชื่อครู หรือ เหตุผล..." 
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none h-[42px]"
                />
            </div>
            <div>
                 <select 
                    value={statusFilter} 
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none h-[42px]"
                 >
                    <option value="ALL">สถานะ: ทั้งหมด</option>
                    <option value={LeaveStatus.PENDING}>รออนุมัติ</option>
                    <option value={LeaveStatus.APPROVED}>อนุมัติแล้ว</option>
                    <option value={LeaveStatus.REJECTED}>ไม่อนุมัติ</option>
                 </select>
            </div>
            <div>
                <button 
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50 h-[42px]"
                >
                    <Icons.Sort size={18} />
                    {sortOrder === 'asc' ? 'วันที่: เก่า -> ใหม่' : 'วันที่: ใหม่ -> เก่า'}
                </button>
            </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <Table headers={['วันที่', 'ชื่อครู', 'คาบที่ลา', 'เหตุผล', 'สถานะ', '']}>
                {paginatedLeaves.map(leave => {
                    const teacher = teachers.find(t => t.id === leave.teacherId);
                    return (
                        <TableRow key={leave.id}>
                            <TableCell><span className="font-medium text-slate-600 whitespace-nowrap">{formatDate(leave.date)}</span></TableCell>
                            <TableCell>{teacher?.name || 'ไม่ระบุ'}</TableCell>
                            <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                    {(Array.isArray(leave.periodNumbers) ? leave.periodNumbers : []).map(p => (
                                        <span key={p} className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </TableCell>
                            <TableCell className="text-slate-500 min-w-[150px]">{leave.reason}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(leave.status)}>
                                    {getStatusLabel(leave.status)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2 items-center">
                                    {leave.status === LeaveStatus.PENDING && (
                                        <>
                                            <Button variant="success" size="sm" icon={Icons.Check} onClick={() => handleApprove(leave.id)} />
                                            <Button variant="danger" size="sm" icon={Icons.Reject} onClick={() => handleReject(leave.id)} />
                                            <div className="w-px h-4 bg-slate-300 mx-1"></div>
                                        </>
                                    )}
                                    <Button variant="secondary" size="sm" icon={Icons.Edit} onClick={() => handleOpenModal(leave)} />
                                    <Button variant="danger" size="sm" icon={Icons.Delete} onClick={() => setDeleteId(leave.id)} />
                                </div>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </Table>
            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
            />
        </div>

        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingId ? 'แก้ไขการลา' : 'ยื่นใบลา'}
            footer={
                <>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
                    <Button onClick={handleSubmit}>บันทึก</Button>
                </>
            }
        >
            <form className="space-y-4">
                <Select label="ชื่อครู" value={teacherId} onChange={e => setTeacherId(e.target.value)}>
                    {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </Select>
                
                <Input type="date" label="วันที่ลา" value={date} onChange={e => setDate(e.target.value)} required />
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">เลือกคาบเรียน</label>
                    <div className="flex flex-wrap gap-2">
                        {timeSlots.filter(ts => ts.type !== 'BREAK').map(ts => (
                            <button
                                key={ts.id}
                                type="button"
                                onClick={() => togglePeriod(ts.periodNumber)}
                                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                                    selectedPeriods.includes(ts.periodNumber) 
                                    ? 'bg-indigo-600 text-white shadow-md scale-105' 
                                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                }`}
                            >
                                {ts.periodNumber}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">เหตุผล</label>
                    <textarea 
                        value={reason} 
                        onChange={e => setReason(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 min-h-[80px]"
                        required
                    />
                </div>
            </form>
        </Modal>
        
        <ConfirmModal 
            isOpen={!!deleteId}
            onClose={() => setDeleteId(null)}
            onConfirm={handleDelete}
            title="ยืนยันการลบข้อมูล"
            message="คุณแน่ใจหรือไม่ที่จะลบใบลาใบนี้? การกระทำนี้ไม่สามารถย้อนกลับได้ และจะลบข้อมูลการสอนแทนที่เกี่ยวข้องทั้งหมด"
        />
    </div>
  );
};