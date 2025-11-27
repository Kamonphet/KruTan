import React, { useState } from 'react';
import { Teacher, Subject, Role } from '../types';
import { Icons } from '../components/Icons';
import { ConfirmModal } from '../components/ConfirmModal';
import { Button, Card, Table, TableRow, TableCell, Badge, Input, Select, Modal, Pagination } from '../components/UI';
import { useToast } from '../components/Toast';

interface TeacherManagementProps {
  teachers: Teacher[];
  subjects: Subject[];
  onAdd: (teacher: Omit<Teacher, 'id'>) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 10;

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  subjects,
  onAdd,
  onEdit,
  onDelete
}) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(teachers.length / ITEMS_PER_PAGE);
  const paginatedTeachers = teachers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<Role>(Role.TEACHER);
  const [phone, setPhone] = useState('');
  const [lineId, setLineId] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);

  const handleOpenModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingId(teacher.id);
      setName(teacher.name);
      setUsername(teacher.username);
      setRole(teacher.role);
      setPhone(teacher.phone);
      setLineId(teacher.lineId);
      setExpertise(teacher.expertise);
    } else {
      setEditingId(null);
      setName('');
      setUsername('');
      setRole(Role.TEACHER);
      setPhone('');
      setLineId('');
      setExpertise([]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username) return;

    const teacherData = { name, username, role, phone, lineId, expertise };

    if (editingId) {
      onEdit({ id: editingId, ...teacherData });
      showToast('แก้ไขข้อมูลครูเรียบร้อยแล้ว', 'success');
    } else {
      onAdd(teacherData);
      showToast('เพิ่มข้อมูลครูใหม่เรียบร้อยแล้ว', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if(deleteId) {
      onDelete(deleteId);
      showToast('ลบข้อมูลครูเรียบร้อยแล้ว', 'success');
      setDeleteId(null);
    }
  };

  const toggleExpertise = (subjectId: string) => {
    setExpertise(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการข้อมูลครู</h1>
          <p className="text-slate-500">รายชื่อครูและบุคลากรทั้งหมดในระบบ</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Icons.Add}>
          เพิ่มครู
        </Button>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <Table headers={['ชื่อ-สกุล', 'บทบาท', 'วิชาที่ถนัด', 'ข้อมูลติดต่อ', '']}>
            {paginatedTeachers.map(teacher => (
            <TableRow key={teacher.id}>
                <TableCell>
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${teacher.role === Role.ADMIN ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'}`}>
                    {teacher.name.charAt(0)}
                    </div>
                    <div>
                    <div className="font-semibold text-slate-900">{teacher.name}</div>
                    <div className="text-xs text-slate-500">@{teacher.username}</div>
                    </div>
                </div>
                </TableCell>
                <TableCell>
                <Badge variant={teacher.role === Role.ADMIN ? 'info' : 'neutral'}>
                    {teacher.role === Role.ADMIN ? 'ผู้ดูแลระบบ' : 'ครูผู้สอน'}
                </Badge>
                </TableCell>
                <TableCell>
                <div className="flex flex-wrap gap-1 max-w-xs">
                    {teacher.expertise.map(subId => {
                    const sub = subjects.find(s => s.id === subId);
                    return sub ? (
                        <span key={subId} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded shadow-sm">
                        {sub.code}
                        </span>
                    ) : null;
                    })}
                    {teacher.expertise.length === 0 && <span className="text-xs text-slate-400 italic">-</span>}
                </div>
                </TableCell>
                <TableCell>
                <div className="text-sm space-y-1">
                    <div className="text-slate-600 flex items-center gap-2"><span className="text-xs">📞</span> {teacher.phone || '-'}</div>
                    <div className="text-emerald-600 font-medium flex items-center gap-2"><span className="text-xs">LINE:</span> {teacher.lineId || '-'}</div>
                </div>
                </TableCell>
                <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" icon={Icons.Edit} onClick={() => handleOpenModal(teacher)} />
                    <Button variant="danger" size="sm" icon={Icons.Delete} onClick={() => setDeleteId(teacher.id)} />
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'แก้ไขข้อมูลครู' : 'เพิ่มครูใหม่'}
        footer={
          <>
             <Button variant="secondary" onClick={() => setIsModalOpen(false)}>ยกเลิก</Button>
             <Button onClick={handleSubmit}>{editingId ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่ม'}</Button>
          </>
        }
      >
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="ชื่อ-นามสกุล" value={name} onChange={e => setName(e.target.value)} required />
                <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                
                <Select label="บทบาท" value={role} onChange={e => setRole(e.target.value as Role)}>
                    <option value={Role.TEACHER}>ครู</option>
                    <option value={Role.ADMIN}>ผู้ดูแลระบบ</option>
                </Select>
                
                <Input label="เบอร์โทรศัพท์" value={phone} onChange={e => setPhone(e.target.value)} />
                <Input label="Line ID" value={lineId} onChange={e => setLineId(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">วิชาที่สอนได้ (Expertise)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-slate-200 rounded-lg bg-slate-50 max-h-48 overflow-y-auto">
                  {subjects.map(sub => (
                      <label key={sub.id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-md transition-colors border border-transparent hover:border-slate-200 hover:shadow-sm">
                          <input 
                              type="checkbox"
                              checked={expertise.includes(sub.id)}
                              onChange={() => toggleExpertise(sub.id)}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">
                              <span className="font-bold text-indigo-600">{sub.code}</span> {sub.name}
                          </span>
                      </label>
                  ))}
              </div>
            </div>
          </form>
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="ยืนยันการลบข้อมูล"
        message="คุณแน่ใจหรือไม่ที่จะลบข้อมูลครูท่านนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
      />
    </div>
  );
};