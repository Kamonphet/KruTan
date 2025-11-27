import React, { useState } from 'react';
import { ClassRoom, Teacher } from '../types';
import { Icons } from '../components/Icons';
import { ConfirmModal } from '../components/ConfirmModal';
import { Button, Card, Input, Select, Modal, Pagination } from '../components/UI';
import { useToast } from '../components/Toast';

interface ClassManagementProps {
  classes: ClassRoom[];
  teachers: Teacher[];
  onAdd: (cls: Omit<ClassRoom, 'id'>) => void;
  onEdit: (cls: ClassRoom) => void;
  onDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 9; // Using 9 for grid layout (3x3)

export const ClassManagement: React.FC<ClassManagementProps> = ({
  classes, teachers, onAdd, onEdit, onDelete
}) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [studentCount, setStudentCount] = useState<number>(30);
  const [advisorId, setAdvisorId] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(classes.length / ITEMS_PER_PAGE);
  const paginatedClasses = classes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleOpenModal = (cls?: ClassRoom) => {
    if (cls) {
      setEditingId(cls.id);
      setName(cls.name);
      setStudentCount(cls.studentCount);
      setAdvisorId(cls.advisorId);
    } else {
      setEditingId(null);
      setName('');
      setStudentCount(30);
      setAdvisorId(teachers[0]?.id || '');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !advisorId) return;
    if (editingId) {
        onEdit({ id: editingId, name, studentCount, advisorId });
        showToast('แก้ไขข้อมูลชั้นเรียนเรียบร้อยแล้ว', 'success');
    } else {
        onAdd({ name, studentCount, advisorId });
        showToast('เพิ่มชั้นเรียนใหม่เรียบร้อยแล้ว', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
      if(deleteId) {
          onDelete(deleteId);
          showToast('ลบข้อมูลชั้นเรียนเรียบร้อยแล้ว', 'success');
          setDeleteId(null);
      }
  };

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">จัดการชั้นเรียน</h1>
            <p className="text-slate-500">ห้องเรียนและครูที่ปรึกษา</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Icons.Add}>เพิ่มชั้นเรียน</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {paginatedClasses.map(cls => {
            const advisor = teachers.find(t => t.id === cls.advisorId);
            return (
                <Card key={cls.id} className="flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{cls.name}</h3>
                            <span className="text-sm text-slate-500">{cls.studentCount} นักเรียน</span>
                        </div>
                        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                            <Icons.Classes size={24} />
                        </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-2">ครูที่ปรึกษา</div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                                {advisor?.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-700 truncate">{advisor?.name || 'ไม่ระบุ'}</span>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button variant="secondary" className="flex-1" onClick={() => handleOpenModal(cls)} icon={Icons.Edit}>แก้ไข</Button>
                            <Button variant="danger" className="flex-1" onClick={() => setDeleteId(cls.id)} icon={Icons.Delete}>ลบ</Button>
                        </div>
                    </div>
                </Card>
            );
        })}
        {classes.length === 0 && (
             <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                ไม่พบข้อมูลชั้นเรียน
             </div>
        )}
      </div>

      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'แก้ไขชั้นเรียน' : 'เพิ่มชั้นเรียนใหม่'}
        footer={
            <>
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
                <Button onClick={handleSubmit}>บันทึก</Button>
            </>
        }
      >
          <form className="space-y-4">
            <Input label="ชื่อชั้นเรียน" value={name} onChange={e => setName(e.target.value)} placeholder="เช่น ม.1/1" required />
            <Input type="number" label="จำนวนนักเรียน" value={studentCount} onChange={e => setStudentCount(Number(e.target.value))} required min="1" />
            <Select label="ครูที่ปรึกษา" value={advisorId} onChange={e => setAdvisorId(e.target.value)}>
                <option value="" disabled>เลือกครู</option>
                {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </Select>
          </form>
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="ยืนยันการลบข้อมูล"
        message="คุณแน่ใจหรือไม่ที่จะลบข้อมูลชั้นเรียนนี้?"
      />
    </div>
  );
};