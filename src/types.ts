export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
}

export interface Teacher {
  id: string;
  name: string;
  username: string;
  role: Role;
  expertise: string[]; // Subject IDs
  phone: string;
  lineId: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  studentCount: number;
  advisorId: string;
}

export enum TimeSlotType {
  LEARNING = 'LEARNING',
  BREAK = 'BREAK',
}

export interface TimeSlot {
  id: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  type: TimeSlotType;
}

export interface ScheduleItem {
  id: string;
  classId: string;
  timeSlotId: string;
  dayOfWeek: number; // 1 = Monday, 5 = Friday
  subjectId: string;
  teacherId: string;
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface LeaveRequest {
  id: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  periodNumbers: number[]; // Which periods (mapped to TimeSlot.periodNumber)
  reason: string;
  status: LeaveStatus;
}

export enum SubStatus {
  REQUESTED = 'REQUESTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface SubstituteAssignment {
  id: string;
  leaveRequestId: string;
  originalTeacherId: string;
  subTeacherId: string;
  date: string;
  periodNumber: number;
  classId: string;
  subjectId: string;
  status: SubStatus;
  rejectReason?: string;
}
