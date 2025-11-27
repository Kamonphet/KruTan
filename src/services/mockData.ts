import { Teacher, Role, Subject, ClassRoom, TimeSlot, TimeSlotType, ScheduleItem, LeaveRequest, LeaveStatus, SubstituteAssignment, SubStatus } from '../types';

export const MOCK_TEACHERS: Teacher[] = [
  { id: 't1', name: 'สมชาย ใจดี', username: 'somchai', role: Role.ADMIN, expertise: ['s1', 's2'], phone: '081-111-1111', lineId: 'somchai.j' },
  { id: 't2', name: 'มานี มีตา', username: 'manee', role: Role.TEACHER, expertise: ['s3', 's4'], phone: '082-222-2222', lineId: 'manee.m' },
  { id: 't3', name: 'ปิติ รักเรียน', username: 'piti', role: Role.TEACHER, expertise: ['s1', 's5'], phone: '083-333-3333', lineId: 'piti.r' },
  { id: 't4', name: 'ชูใจ ดีเลิศ', username: 'chujai', role: Role.TEACHER, expertise: ['s2', 's3'], phone: '084-444-4444', lineId: 'chujai.d' },
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: 's1', code: 'ท101', name: 'ภาษาไทย' },
  { id: 's2', code: 'ค101', name: 'คณิตศาสตร์' },
  { id: 's3', code: 'ว101', name: 'วิทยาศาสตร์' },
  { id: 's4', code: 'อ101', name: 'ภาษาอังกฤษ' },
  { id: 's5', code: 'ส101', name: 'สังคมศึกษา' },
];

export const MOCK_CLASSES: ClassRoom[] = [
  { id: 'c1', name: 'ม.1/1', studentCount: 30, advisorId: 't1' },
  { id: 'c2', name: 'ม.1/2', studentCount: 32, advisorId: 't2' },
  { id: 'c3', name: 'ม.2/1', studentCount: 28, advisorId: 't3' },
];

export const MOCK_TIMESLOTS: TimeSlot[] = [
  { id: 'ts1', periodNumber: 1, startTime: '08:30', endTime: '09:20', type: TimeSlotType.LEARNING },
  { id: 'ts2', periodNumber: 2, startTime: '09:20', endTime: '10:10', type: TimeSlotType.LEARNING },
  { id: 'ts3', periodNumber: 3, startTime: '10:10', endTime: '11:00', type: TimeSlotType.LEARNING },
  { id: 'ts4', periodNumber: 4, startTime: '11:00', endTime: '12:00', type: TimeSlotType.BREAK }, // Lunch
  { id: 'ts5', periodNumber: 5, startTime: '12:00', endTime: '12:50', type: TimeSlotType.LEARNING },
  { id: 'ts6', periodNumber: 6, startTime: '12:50', endTime: '13:40', type: TimeSlotType.LEARNING },
];

export const MOCK_SCHEDULES: ScheduleItem[] = [
  // M.1/1 Monday
  { id: 'sch1', classId: 'c1', timeSlotId: 'ts1', dayOfWeek: 1, subjectId: 's1', teacherId: 't1' },
  { id: 'sch2', classId: 'c1', timeSlotId: 'ts2', dayOfWeek: 1, subjectId: 's2', teacherId: 't4' },
  // M.1/1 Tuesday
  { id: 'sch3', classId: 'c1', timeSlotId: 'ts1', dayOfWeek: 2, subjectId: 's3', teacherId: 't2' },
  
  // Conflict Test Data
  { id: 'sch4', classId: 'c2', timeSlotId: 'ts1', dayOfWeek: 1, subjectId: 's3', teacherId: 't2' },
];

export const MOCK_LEAVES: LeaveRequest[] = [
  { id: 'l1', teacherId: 't1', date: '2023-10-25', periodNumbers: [1, 2], reason: 'ไปพบแพทย์', status: LeaveStatus.APPROVED },
];

export const MOCK_SUBS: SubstituteAssignment[] = [
  { 
    id: 'sub1', 
    leaveRequestId: 'l1', 
    originalTeacherId: 't1', 
    subTeacherId: 't3', 
    date: '2023-10-25', 
    periodNumber: 1, 
    classId: 'c1', 
    subjectId: 's1', 
    status: SubStatus.ACCEPTED 
  }
];