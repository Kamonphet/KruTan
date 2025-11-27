import React, { useState } from 'react';
import { Subject } from '../types';
import { Icons } from '../components/Icons';
import { ConfirmModal } from '../components/ConfirmModal';
import { Button, Table, TableRow, TableCell, Input, Modal, Pagination } from '../components/UI';
import { useToast } from '../components/Toast';

interface SubjectManagementProps {
  subjects: Subject[];
  onAdd: (subject: Omit<Subject, 'id'>) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 10;

export const SubjectManagement: React.FC<SubjectManagementProps> = ({
  subjects, onAdd, onEdit, onDelete
}) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(subjects.length / ITEMS_PER_PAGE);
  const paginatedSubjects = subjects.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleOpenModal = (subject?: Subject) => {
    if (subject) {
      setEditingId(subject.id);
      setCode(subject.code);
      setName(subject.name);
    } else {
      setEditingId(null);
      setCode('');
      setName('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    if (editingId) {
        onEdit({ id: editingId, code, name });
        showToast('แก้ไขรายวิชาเรียบร้อยแล้ว', 'success');
    } else {
        onAdd({ code, name });
        showToast('เพิ่มรายวิชาใหม่เรียบร้อยแล้ว', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if(deleteId) {
        onDelete(deleteId);
        showToast('ลบรายวิชาเรียบร้อยแล้ว', 'success');
        setDeleteId(null);
    }
  };

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">จัดการรายวิชา</h1>
            <p className="text-slate-500">กำหนดวิชาเรียนและรหัสวิชาในหลักสูตร</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Icons.Add}>เพิ่มวิชา</Button>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <Table headers={['รหัสวิชา', 'ชื่อวิชา', '']}>
            {paginatedSubjects.map(subject => (
            <TableRow key={subject.id}>
                <TableCell><span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{subject.code}</span></TableCell>
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" icon={Icons.Edit} onClick={() => handleOpenModal(subject)} />
                    <Button variant="danger" size="sm" icon={Icons.Delete} onClick={() => setDeleteId(subject.id)} />
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
        title={editingId ? 'แก้ไขวิชา' : 'เพิ่มวิชาใหม่'}
        footer={
            <>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
                <Button onClick={handleSubmit}>บันทึก</Button>
            </>
        }
      >
          <form className="space-y-4">
            <Input label="รหัสวิชา" value={code} onChange={e => setCode(e.target.value)} placeholder="เช่น ท101" required />
            <Input label="ชื่อวิชา" value={name} onChange={e => setName(e.target.value)} placeholder="เช่น ภาษาไทย" required />
          </form>
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="ยืนยันการลบข้อมูล"
        message="คุณแน่ใจหรือไม่ที่จะลบวิชานี้?"
      />
    </div>
  );
};