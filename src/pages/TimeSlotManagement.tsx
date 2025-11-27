import React, { useState } from 'react';
import { TimeSlot, TimeSlotType } from '../types';
import { Icons } from '../components/Icons';
import { ConfirmModal } from '../components/ConfirmModal';
import { Button, Table, TableRow, TableCell, Badge, Input, Select, Modal, Pagination } from '../components/UI';
import { useToast } from '../components/Toast';

interface TimeSlotManagementProps {
  timeSlots: TimeSlot[];
  onAdd: (slot: Omit<TimeSlot, 'id'>) => void;
  onEdit: (slot: TimeSlot) => void;
  onDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 10;

export const TimeSlotManagement: React.FC<TimeSlotManagementProps> = ({
  timeSlots, onAdd, onEdit, onDelete
}) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<TimeSlotType>(TimeSlotType.LEARNING);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(timeSlots.length / ITEMS_PER_PAGE);
  const paginatedTimeSlots = timeSlots.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleOpenModal = (slot?: TimeSlot) => {
    if (slot) {
      setEditingId(slot.id);
      setPeriodNumber(slot.periodNumber);
      setStartTime(slot.startTime);
      setEndTime(slot.endTime);
      setType(slot.type);
    } else {
      setEditingId(null);
      const maxPeriod = Math.max(0, ...timeSlots.map(ts => ts.periodNumber));
      setPeriodNumber(maxPeriod + 1);
      setStartTime('');
      setEndTime('');
      setType(TimeSlotType.LEARNING);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) return;
    const slotData = { periodNumber, startTime, endTime, type };
    if (editingId) {
        onEdit({ id: editingId, ...slotData });
        showToast('แก้ไขคาบเรียนเรียบร้อยแล้ว', 'success');
    } else {
        onAdd(slotData);
        showToast('เพิ่มคาบเรียนใหม่เรียบร้อยแล้ว', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
      if(deleteId) {
          onDelete(deleteId);
          showToast('ลบคาบเรียนเรียบร้อยแล้ว', 'success');
          setDeleteId(null);
      }
  };

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">จัดการคาบเรียน</h1>
            <p className="text-slate-500">กำหนดช่วงเวลาเรียนและเวลาพัก</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Icons.Add}>เพิ่มคาบเรียน</Button>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <Table headers={['คาบที่', 'ช่วงเวลา', 'ประเภท', '']}>
            {paginatedTimeSlots.map(slot => (
            <TableRow key={slot.id}>
                <TableCell>
                    <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-700">
                        {slot.periodNumber}
                    </span>
                </TableCell>
                <TableCell><span className="font-mono text-slate-600">{slot.startTime} - {slot.endTime}</span></TableCell>
                <TableCell>
                <Badge variant={slot.type === TimeSlotType.LEARNING ? 'info' : 'warning'}>
                    {slot.type === TimeSlotType.LEARNING ? 'การเรียน' : 'พัก/เบรค'}
                </Badge>
                </TableCell>
                <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" icon={Icons.Edit} onClick={() => handleOpenModal(slot)} />
                    <Button variant="danger" size="sm" icon={Icons.Delete} onClick={() => setDeleteId(slot.id)} />
                </div>
                </TableCell>
            </TableRow>
            ))}
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
        title={editingId ? 'แก้ไขคาบเรียน' : 'เพิ่มคาบเรียน'}
        footer={
            <>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
                <Button onClick={handleSubmit}>บันทึก</Button>
            </>
        }
      >
          <form className="space-y-4">
            <Input type="number" label="คาบที่ (ลำดับ)" value={periodNumber} onChange={e => setPeriodNumber(Number(e.target.value))} required min="1" />
            <div className="grid grid-cols-2 gap-4">
                <Input type="time" label="เวลาเริ่ม" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                <Input type="time" label="เวลาสิ้นสุด" value={endTime} onChange={e => setEndTime(e.target.value)} required />
            </div>
            <Select label="ประเภท" value={type} onChange={e => setType(e.target.value as TimeSlotType)}>
                <option value={TimeSlotType.LEARNING}>เรียน (การสอนปกติ)</option>
                <option value={TimeSlotType.BREAK}>พัก (พักกลางวัน/เบรค)</option>
            </Select>
          </form>
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="ยืนยันการลบข้อมูล"
        message="คุณแน่ใจหรือไม่ที่จะลบคาบเรียนนี้?"
      />
    </div>
  );
};