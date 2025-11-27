import React, { useState } from 'react';
import { ClassRoom, ScheduleItem, Subject, Teacher, TimeSlot } from '../types';
import { Icons } from './Icons';

interface ScheduleGridProps {
  selectedTeacher: Teacher;
  timeSlots: TimeSlot[];
  schedules: ScheduleItem[];
  subjects: Subject[];
  classes: ClassRoom[];
  onUpdateSchedule: (item: ScheduleItem) => void;
  onDeleteSchedule: (scheduleId: string) => void;
}

const DAY_STYLES = [
  { name: 'จันทร์', headerClass: 'bg-yellow-100 border-yellow-200 text-yellow-700', cardClass: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
  { name: 'อังคาร', headerClass: 'bg-pink-100 border-pink-200 text-pink-700', cardClass: 'bg-pink-50 border-pink-200 text-pink-800' },
  { name: 'พุธ', headerClass: 'bg-emerald-100 border-emerald-200 text-emerald-700', cardClass: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  { name: 'พฤหัสบดี', headerClass: 'bg-orange-100 border-orange-200 text-orange-700', cardClass: 'bg-orange-50 border-orange-200 text-orange-800' },
  { name: 'ศุกร์', headerClass: 'bg-sky-100 border-sky-200 text-sky-700', cardClass: 'bg-sky-50 border-sky-200 text-sky-800' },
];

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  selectedTeacher,
  timeSlots,
  schedules,
  subjects,
  classes,
  onUpdateSchedule,
  onDeleteSchedule
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isDraggingGridItem, setIsDraggingGridItem] = useState(false);

  const getScheduleItem = (dayIndex: number, slotId: string) => {
    return schedules.find(
      s => s.teacherId === selectedTeacher.id && s.dayOfWeek === dayIndex && s.timeSlotId === slotId
    );
  };

  // 1. Drag Subject from Palette
  const handleSubjectDragStart = (e: React.DragEvent, subject: Subject) => {
    if (!selectedClassId) {
      e.preventDefault();
      alert('กรุณาเลือกชั้นเรียนก่อนลากวิชา');
      return;
    }
    e.dataTransfer.setData('type', 'SUBJECT');
    e.dataTransfer.setData('subjectId', subject.id);
  };

  // 2. Drag Item from Grid (to Delete)
  const handleGridItemDragStart = (e: React.DragEvent, scheduleItem: ScheduleItem) => {
    setIsDraggingGridItem(true);
    e.dataTransfer.setData('type', 'GRID_ITEM');
    e.dataTransfer.setData('scheduleId', scheduleItem.id);
  };

  const handleDragEnd = () => {
    setIsDraggingGridItem(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 3. Drop into Grid (Assign)
  const handleGridDrop = (e: React.DragEvent, dayIndex: number, timeSlotId: string) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    
    if (type === 'SUBJECT') {
        const subjectId = e.dataTransfer.getData('subjectId');
        if (subjectId && selectedClassId) {
        const newItem: ScheduleItem = {
            id: `sch_${Date.now()}`,
            classId: selectedClassId,
            timeSlotId: timeSlotId,
            dayOfWeek: dayIndex,
            subjectId: subjectId,
            teacherId: selectedTeacher.id
        };
        onUpdateSchedule(newItem);
        }
    }
  };

  // 4. Drop into Trash (Remove)
  const handleTrashDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('type');
      if (type === 'GRID_ITEM') {
          const scheduleId = e.dataTransfer.getData('scheduleId');
          if (scheduleId) {
              onDeleteSchedule(scheduleId);
              setIsDraggingGridItem(false);
          }
      }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-full">
      {/* Palette Side */}
      <div className="w-full lg:w-64 flex flex-col gap-4 no-print shrink-0">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Icons.Classes size={18} />
            1. เลือกชั้นเรียน
          </h3>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-100 text-sm"
          >
            <option value="">-- กรุณาเลือกห้อง --</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
          <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Icons.Subjects size={18} />
            2. ลากวิชาลงตาราง
          </h3>
          <div className="space-y-2 overflow-y-auto max-h-[350px] pr-1 flex-1">
            {subjects.map(subject => (
              <div
                key={subject.id}
                draggable
                onDragStart={(e) => handleSubjectDragStart(e, subject)}
                className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing shadow-sm transition-all hover:shadow-md ${
                   selectedClassId 
                    ? 'bg-white border-slate-200 hover:border-indigo-300' 
                    : 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="font-bold text-slate-700 text-sm">{subject.code}</div>
                <div className="text-xs text-slate-500">{subject.name}</div>
              </div>
            ))}
          </div>

          {/* Trash Zone */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleTrashDrop}
            className={`mt-4 p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                isDraggingGridItem 
                ? 'border-red-400 bg-red-50 text-red-600 scale-105 shadow-lg' 
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
              <Icons.Delete size={24} className={isDraggingGridItem ? 'animate-bounce' : ''} />
              <span className="text-xs font-bold mt-2">ลากมาที่นี่เพื่อลบ</span>
          </div>
        </div>
      </div>

      {/* Grid Side */}
      <div className="flex-1 overflow-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[120px_repeat(5,1fr)] gap-2 mb-4">
            <div className="p-3 font-bold text-slate-400 text-right text-sm uppercase tracking-wider">เวลา</div>
            {DAY_STYLES.map((day, idx) => (
              <div key={day.name} className={`p-3 font-bold text-center rounded-lg border shadow-sm ${day.headerClass}`}>
                {day.name}
              </div>
            ))}
          </div>

          {timeSlots.map(slot => (
            <div key={slot.id} className="grid grid-cols-[120px_repeat(5,1fr)] gap-2 mb-2">
              <div className="pr-4 py-2 text-right flex flex-col justify-center">
                <span className="font-bold text-slate-700 font-mono">{slot.startTime}</span>
                <span className="text-xs text-slate-400 font-mono">{slot.endTime}</span>
              </div>
              {DAY_STYLES.map((day, idx) => {
                const dayIndex = idx + 1;
                const item = getScheduleItem(dayIndex, slot.id);
                const subject = item ? subjects.find(s => s.id === item.subjectId) : null;
                const classroom = item ? classes.find(c => c.id === item.classId) : null;

                if (slot.type === 'BREAK') {
                   return (
                     <div key={`${slot.id}-${dayIndex}`} className="bg-red-50 rounded-lg flex items-center justify-center border border-dashed border-red-200">
                        <span className="text-xs text-red-500 uppercase tracking-widest font-medium">พัก</span>
                     </div>
                   )
                }

                return (
                  <div
                    key={`${slot.id}-${dayIndex}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleGridDrop(e, dayIndex, slot.id)}
                    className={`min-h-[100px] rounded-lg border p-3 flex flex-col justify-between transition-all duration-200 relative ${
                      item 
                        ? `${day.cardClass} cursor-grab hover:shadow-md` 
                        : 'bg-white border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/10'
                    }`}
                    draggable={!!item}
                    onDragStart={(e) => item && handleGridItemDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                  >
                    {item ? (
                      <>
                        <div>
                            <div className="font-bold text-sm leading-tight">{subject?.name || 'ไม่ระบุวิชา'}</div>
                            <div className="text-xs opacity-80 mt-0.5">{subject?.code}</div>
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                            <div className="px-2 py-0.5 rounded bg-white/50 border border-black/5 text-xs font-bold">
                                {classroom?.name || 'ไม่ระบุห้อง'}
                            </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                         <span className="text-slate-300 text-xs">-</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};