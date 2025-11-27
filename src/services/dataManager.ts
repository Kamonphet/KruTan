import { useState, useCallback, useEffect } from 'react';
import { api } from './api';
import { 
  Teacher, Subject, ClassRoom, TimeSlot, ScheduleItem, LeaveRequest, SubstituteAssignment, LeaveStatus, SubStatus 
} from '../types';

// Helper to normalize date string from API (which might be ISO with timezone) to YYYY-MM-DD
const normalizeDate = (dateInput: any): string => {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);
    
    // Use local time methods to get the correct date as seen by the user
    // This fixes the issue where 2025-11-24 might come as 2025-11-23T17:00:00.000Z
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return String(dateInput);
  }
};

export const useDataManager = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [subs, setSubs] = useState<SubstituteAssignment[]>([]);

  // Initial Data Fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.fetchAll();
        if (data) {
          setTeachers(data.teachers || []);
          setSubjects(data.subjects || []);
          setClasses(data.classes || []);
          // Ensure time slots are sorted
          setTimeSlots((data.timeSlots || []).sort((a: TimeSlot, b: TimeSlot) => a.periodNumber - b.periodNumber));
          setSchedules(data.schedules || []);
          
          // Robust parsing for Leaves
          const normalizedLeaves = (data.leaves || []).map((l: any) => {
               let periods = l.periodNumbers;
               if (!Array.isArray(periods)) {
                   if (typeof periods === 'string') {
                       try {
                           // Try to parse JSON string e.g. "[1,2]"
                           if (periods.trim().startsWith('[')) {
                               periods = JSON.parse(periods);
                           } else {
                               // Handle single number as string e.g. "1"
                               periods = [parseInt(periods) || 0];
                           }
                       } catch (e) {
                           periods = [];
                       }
                   } else if (typeof periods === 'number') {
                       // Handle single number e.g. 1
                       periods = [periods];
                   } else {
                       periods = [];
                   }
               }
               return { 
                 ...l, 
                 periodNumbers: periods,
                 date: normalizeDate(l.date) // Normalize Date
               };
          });
          setLeaves(normalizedLeaves);
          
          const normalizedSubs = (data.subs || []).map((s: any) => ({
            ...s,
            date: normalizeDate(s.date) // Normalize Date
          }));
          setSubs(normalizedSubs);
        } else {
          setError("ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต หรือ URL ของ Apps Script");
        }
      } catch (e) {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        console.error(e);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Core Logic: Find Available Teachers for Substitution
  const findAvailableTeachers = useCallback((date: string, periodNumber: number, requiredSubjectId?: string) => {
    // Use UTCDay to match the standard YYYY-MM-DD string (parsed as UTC midnight)
    const dayIndex = new Date(date).getUTCDay(); 
    
    // 1. Find TimeSlot ID for this period
    const targetSlot = timeSlots.find(ts => ts.periodNumber === periodNumber);
    if (!targetSlot) return [];

    // 2. Find teachers who are teaching at this time (BUSY)
    const busyTeacherIds = schedules
      .filter(sch => sch.dayOfWeek === dayIndex && sch.timeSlotId === targetSlot.id)
      .map(sch => sch.teacherId);

    // 3. Find teachers who are on leave (BUSY)
    const onLeaveTeacherIds = leaves
      .filter(l => l.date === date && l.periodNumbers.includes(periodNumber) && l.status === LeaveStatus.APPROVED)
      .map(l => l.teacherId);

    // 4. Exclude busy teachers
    const available = teachers.filter(t => {
      if (busyTeacherIds.includes(t.id)) return false;
      if (onLeaveTeacherIds.includes(t.id)) return false;
      return true;
    });

    // 5. Rank by Expertise and Daily Workload
    return available.map(t => {
      // Calculate Regular Schedules count for this day
      const regularClassesCount = schedules.filter(s => s.teacherId === t.id && s.dayOfWeek === dayIndex).length;
      
      // Calculate Substitute Assignments count for this day (excluding rejected ones)
      const substituteClassesCount = subs.filter(s => s.subTeacherId === t.id && s.date === date && s.status !== SubStatus.REJECTED).length;
      
      const dailyWorkload = regularClassesCount + substituteClassesCount;

      return {
        ...t,
        isExpert: requiredSubjectId ? t.expertise.includes(requiredSubjectId) : false,
        workload: dailyWorkload
      };
    }).sort((a, b) => {
      // Prioritize Expert -> Then by Workload (Ascending)
      if (a.isExpert && !b.isExpert) return -1;
      if (!a.isExpert && b.isExpert) return 1;
      return a.workload - b.workload;
    });

  }, [teachers, schedules, leaves, subs, timeSlots]);

  // --- Actions (Optimistic UI Updates + API Calls) ---

  // Leaves
  const addLeaveRequest = (req: Omit<LeaveRequest, 'id' | 'status'>) => {
    const newLeave: LeaveRequest = {
      ...req,
      id: `l${Date.now()}`,
      status: LeaveStatus.PENDING,
      date: normalizeDate(req.date)
    };
    setLeaves(prev => [...prev, newLeave]);
    api.create('LeaveRequests', newLeave);
  };

  const updateLeaveRequest = (leave: LeaveRequest) => {
    const updatedLeave = { ...leave, date: normalizeDate(leave.date) };
    setLeaves(prev => prev.map(l => l.id === leave.id ? updatedLeave : l));
    api.update('LeaveRequests', updatedLeave);
  };

  const deleteLeaveRequest = (id: string) => {
    setLeaves(prev => prev.filter(l => l.id !== id));
    api.delete('LeaveRequests', id);
    
    // Also delete associated subs
    const relatedSubs = subs.filter(s => s.leaveRequestId === id);
    relatedSubs.forEach(s => deleteSubstituteAssignment(s.id));
  };

  const approveLeave = (leaveId: string) => {
    setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: LeaveStatus.APPROVED } : l));
    api.update('LeaveRequests', { id: leaveId, status: LeaveStatus.APPROVED });
  };

  const rejectLeave = (leaveId: string) => {
    setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: LeaveStatus.REJECTED } : l));
    api.update('LeaveRequests', { id: leaveId, status: LeaveStatus.REJECTED });
  };

  // Substitutes
  const assignSubstitute = (sub: Omit<SubstituteAssignment, 'id' | 'status'>) => {
    const newSub: SubstituteAssignment = {
      ...sub,
      id: `sub${Date.now()}`,
      status: SubStatus.REQUESTED,
      date: normalizeDate(sub.date)
    };
    setSubs(prev => [...prev, newSub]);
    api.create('SubstituteAssignments', newSub);
  };

  const updateSubstituteAssignment = (sub: SubstituteAssignment) => {
    const updatedSub = { ...sub, date: normalizeDate(sub.date) };
    setSubs(prev => prev.map(s => s.id === sub.id ? updatedSub : s));
    api.update('SubstituteAssignments', updatedSub);
  }

  const deleteSubstituteAssignment = (id: string) => {
    setSubs(prev => prev.filter(s => s.id !== id));
    api.delete('SubstituteAssignments', id);
  };

  const respondToSubRequest = (subId: string, status: SubStatus, reason?: string) => {
    setSubs(prev => prev.map(s => s.id === subId ? { ...s, status, rejectReason: reason } : s));
    api.update('SubstituteAssignments', { id: subId, status, rejectReason: reason });
  };

  const updateSchedule = (item: ScheduleItem) => {
     // Remove any existing schedule for this specific slot (teacher/day/time) to prevent duplicates
     setSchedules(prev => {
        const filtered = prev.filter(s => !(s.timeSlotId === item.timeSlotId && s.dayOfWeek === item.dayOfWeek && s.teacherId === item.teacherId));
        return [...filtered, item];
     });
     api.create('Schedules', item);
  };

  const deleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    api.delete('Schedules', scheduleId);
  };

  // --- Teacher Management ---
  const addTeacher = (teacher: Omit<Teacher, 'id'>) => {
    const newTeacher = { ...teacher, id: `t${Date.now()}` };
    setTeachers(prev => [...prev, newTeacher]);
    api.create('Teachers', newTeacher);
  };

  const updateTeacher = (updatedTeacher: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
    api.update('Teachers', updatedTeacher);
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    api.delete('Teachers', id);
  };

  // --- Subject Management ---
  const addSubject = (subject: Omit<Subject, 'id'>) => {
    const newSubject = { ...subject, id: `s${Date.now()}` };
    setSubjects(prev => [...prev, newSubject]);
    api.create('Subjects', newSubject);
  };

  const updateSubject = (updatedSubject: Subject) => {
    setSubjects(prev => prev.map(s => s.id === updatedSubject.id ? updatedSubject : s));
    api.update('Subjects', updatedSubject);
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    api.delete('Subjects', id);
  };

  // --- Class Management ---
  const addClass = (cls: Omit<ClassRoom, 'id'>) => {
    const newClass = { ...cls, id: `c${Date.now()}` };
    setClasses(prev => [...prev, newClass]);
    api.create('Classes', newClass);
  };

  const updateClass = (updatedClass: ClassRoom) => {
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
    api.update('Classes', updatedClass);
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    api.delete('Classes', id);
  };

  // --- Time Slot Management ---
  const addTimeSlot = (slot: Omit<TimeSlot, 'id'>) => {
    const newSlot = { ...slot, id: `ts${Date.now()}` };
    setTimeSlots(prev => [...prev, newSlot].sort((a, b) => a.periodNumber - b.periodNumber));
    api.create('TimeSlots', newSlot);
  };

  const updateTimeSlot = (updatedSlot: TimeSlot) => {
    setTimeSlots(prev => prev.map(ts => ts.id === updatedSlot.id ? updatedSlot : ts).sort((a, b) => a.periodNumber - b.periodNumber));
    api.update('TimeSlots', updatedSlot);
  };

  const deleteTimeSlot = (id: string) => {
    setTimeSlots(prev => prev.filter(ts => ts.id !== id));
    api.delete('TimeSlots', id);
  };

  return {
    loading,
    error,
    teachers, subjects, classes, timeSlots, schedules, leaves, subs,
    findAvailableTeachers,
    addLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    approveLeave,
    rejectLeave,
    assignSubstitute,
    updateSubstituteAssignment,
    deleteSubstituteAssignment,
    respondToSubRequest,
    updateSchedule,
    deleteSchedule,
    addSubject,
    updateSubject,
    deleteSubject,
    addClass,
    updateClass,
    deleteClass,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot
  };
};