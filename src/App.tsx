import React, { useState, useEffect } from 'react';
import { useDataManager } from './services/dataManager';
import { Dashboard } from './pages/Dashboard';
import { ScheduleGrid } from './components/ScheduleGrid';
import { SubstituteManagement } from './pages/SubstituteManagement';
import { LeaveManagement } from './pages/LeaveManagement';
import { SubjectManagement } from './pages/SubjectManagement';
import { ClassManagement } from './pages/ClassManagement';
import { TeacherManagement } from './pages/TeacherManagement';
import { TimeSlotManagement } from './pages/TimeSlotManagement';
import { Icons } from './components/Icons';
import { Button, LoadingScreen } from './components/UI';
import { ToastProvider } from './components/Toast';

enum Tab {
  DASHBOARD = 'dashboard',
  SCHEDULE = 'schedule',
  SUBSTITUTES = 'substitutes',
  TEACHERS = 'teachers',
  LEAVES = 'leaves',
  SUBJECTS = 'subjects',
  CLASSES = 'classes',
  TIMESLOTS = 'timeslots'
}

export default function App() {
  const { 
    loading, 
    error, 
    teachers, subjects, classes, timeSlots, schedules, leaves, subs,
    findAvailableTeachers, assignSubstitute, updateSubstituteAssignment, deleteSubstituteAssignment, respondToSubRequest, 
    updateSchedule, deleteSchedule, 
    addLeaveRequest, updateLeaveRequest, deleteLeaveRequest, approveLeave, rejectLeave,
    addSubject, updateSubject, deleteSubject,
    addClass, updateClass, deleteClass,
    addTeacher, updateTeacher, deleteTeacher,
    addTimeSlot, updateTimeSlot, deleteTimeSlot
  } = useDataManager();

  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  
  // Desktop collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when tab changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  React.useEffect(() => {
    if (teachers.length > 0 && !selectedTeacherId) {
      setSelectedTeacherId(teachers[0].id);
    }
  }, [teachers, selectedTeacherId]);

  const activeTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];

  const downloadScheduleCSV = () => {
    if (!activeTeacher) return;

    const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์'];
    let csvContent = "data:text/csv;charset=utf-8,";
    
    csvContent += "เวลา," + days.join(",") + "\n";

    timeSlots.forEach(slot => {
        let row = `${slot.startTime}-${slot.endTime}`;
        
        if (slot.type === 'BREAK') {
            row += ",พัก,พัก,พัก,พัก,พัก";
        } else {
            for (let i = 1; i <= 5; i++) {
                const schedule = schedules.find(s => 
                    s.teacherId === activeTeacher.id && 
                    s.dayOfWeek === i && 
                    s.timeSlotId === slot.id
                );
                
                if (schedule) {
                    const subject = subjects.find(s => s.id === schedule.subjectId);
                    const cls = classes.find(c => c.id === schedule.classId);
                    row += `,"${subject?.code || ''} ${subject?.name || ''} (${cls?.name || ''})"`;
                } else {
                    row += ",-";
                }
            }
        }
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ตารางสอน_${activeTeacher.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.DASHBOARD:
        return <Dashboard leaves={leaves} subs={subs} />;
      case Tab.SCHEDULE:
        return (
          <div className="p-4 md:p-8 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 no-print">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800">จัดการตารางเรียน</h1>
                <p className="text-slate-500 text-sm">ดูตารางสอนของครูแต่ละท่าน</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                 <select 
                    value={selectedTeacherId} 
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="border border-slate-200 rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 w-full"
                 >
                    {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                 </select>
                 <Button variant="secondary" onClick={downloadScheduleCSV} icon={Icons.Download} className="w-full justify-center sm:w-auto">
                    CSV
                 </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto lg:overflow-hidden">
               {activeTeacher ? (
                  <ScheduleGrid 
                      selectedTeacher={activeTeacher}
                      timeSlots={timeSlots}
                      schedules={schedules}
                      subjects={subjects}
                      classes={classes}
                      onUpdateSchedule={updateSchedule}
                      onDeleteSchedule={deleteSchedule}
                  />
               ) : (
                  <div className="flex items-center justify-center h-64 text-slate-400 border border-dashed rounded-xl">
                    ไม่พบข้อมูลตารางสอน
                  </div>
               )}
            </div>
          </div>
        );
      case Tab.SUBSTITUTES:
        return (
          <SubstituteManagement 
            leaves={leaves}
            subs={subs}
            teachers={teachers}
            subjects={subjects}
            classes={classes}
            timeSlots={timeSlots}
            schedules={schedules}
            onFindTeachers={findAvailableTeachers}
            onAssignSub={assignSubstitute}
            onUpdateSub={updateSubstituteAssignment}
            onDeleteSub={deleteSubstituteAssignment}
            onRespondToReq={respondToSubRequest}
          />
        );
      case Tab.LEAVES:
        return (
            <LeaveManagement
                leaves={leaves}
                teachers={teachers}
                timeSlots={timeSlots}
                onAddLeave={addLeaveRequest}
                onEditLeave={updateLeaveRequest}
                onDeleteLeave={deleteLeaveRequest}
                onApprove={approveLeave}
                onReject={rejectLeave}
            />
        );
      case Tab.TEACHERS:
        return (
            <TeacherManagement
                teachers={teachers}
                subjects={subjects}
                onAdd={addTeacher}
                onEdit={updateTeacher}
                onDelete={deleteTeacher}
            />
        );
      case Tab.SUBJECTS:
        return (
          <SubjectManagement 
            subjects={subjects}
            onAdd={addSubject}
            onEdit={updateSubject}
            onDelete={deleteSubject}
          />
        );
      case Tab.CLASSES:
        return (
          <ClassManagement 
            classes={classes}
            teachers={teachers}
            onAdd={addClass}
            onEdit={updateClass}
            onDelete={deleteClass}
          />
        );
      case Tab.TIMESLOTS:
        return (
          <TimeSlotManagement 
            timeSlots={timeSlots}
            onAdd={addTimeSlot}
            onEdit={updateTimeSlot}
            onDelete={deleteTimeSlot}
          />
        );
      default:
        return <div className="p-6 text-gray-500">อยู่ระหว่างการพัฒนา</div>;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-slate-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Alert size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">การเชื่อมต่อล้มเหลว</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>ลองใหม่อีกครั้ง</Button>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden relative">
        
        {/* Mobile Header */}
        <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20 shadow-sm">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
              <span className="font-bold text-slate-800">KruTan</span>
           </div>
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Icons.Filter size={24} className="transform rotate-90" /> {/* Using Filter as hamburger icon fallback or just standard menu icon */}
           </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
            fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col shadow-xl md:shadow-[4px_0_24px_rgba(0,0,0,0.02)] 
            transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            ${isSidebarCollapsed ? 'w-20' : 'w-64 md:w-72'}
            no-print
        `}>
          <div className="p-4 border-b border-slate-50 flex justify-between items-center h-16 md:h-auto">
            <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-indigo-200 shadow-lg flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                K
              </div>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden whitespace-nowrap">
                  <h1 className="font-bold text-lg text-slate-800 tracking-tight">KruTan</h1>
                  <p className="text-xs text-slate-400 font-medium">ระบบจัดการครูสอนแทน</p>
                </div>
              )}
            </div>
            {/* Mobile Close Button */}
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 text-slate-400">
               <Icons.Reject size={20} />
            </button>
          </div>
          
          <div className="hidden md:flex justify-end px-2 py-2">
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1 rounded transition-colors">
                  {isSidebarCollapsed ? <Icons.SidebarOpen size={20}/> : <Icons.SidebarClose size={20}/>}
              </button>
          </div>
          
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            <NavItem 
              active={activeTab === Tab.DASHBOARD} 
              onClick={() => setActiveTab(Tab.DASHBOARD)} 
              icon={Icons.Dashboard} 
              label="ภาพรวมระบบ"
              collapsed={isSidebarCollapsed}
            />
            <NavItem 
              active={activeTab === Tab.SCHEDULE} 
              onClick={() => setActiveTab(Tab.SCHEDULE)} 
              icon={Icons.Schedule} 
              label="ตารางสอน"
              collapsed={isSidebarCollapsed}
            />
            <NavItem 
              active={activeTab === Tab.SUBSTITUTES} 
              onClick={() => setActiveTab(Tab.SUBSTITUTES)} 
              icon={Icons.Substitutes} 
              label="จัดสอนแทน" 
              badge={subs.filter(s => s.status === 'REQUESTED').length}
              collapsed={isSidebarCollapsed}
            />
            <NavItem 
              active={activeTab === Tab.LEAVES} 
              onClick={() => setActiveTab(Tab.LEAVES)} 
              icon={Icons.Leaves} 
              label="รายการลา" 
              badge={leaves.filter(l => l.status === 'PENDING').length}
              collapsed={isSidebarCollapsed}
            />
            
            <div className={`mt-8 mb-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider ${isSidebarCollapsed ? 'text-center' : ''}`}>
              {isSidebarCollapsed ? '...' : 'ฐานข้อมูล'}
            </div>
            <NavItem 
              active={activeTab === Tab.TEACHERS} 
              onClick={() => setActiveTab(Tab.TEACHERS)} 
              icon={Icons.Teachers} 
              label="ครู/อาจารย์"
              collapsed={isSidebarCollapsed}
            />
            <NavItem 
              active={activeTab === Tab.CLASSES} 
              onClick={() => setActiveTab(Tab.CLASSES)} 
              icon={Icons.Classes} 
              label="ชั้นเรียน"
              collapsed={isSidebarCollapsed}
            />
            <NavItem 
              active={activeTab === Tab.SUBJECTS} 
              onClick={() => setActiveTab(Tab.SUBJECTS)} 
              icon={Icons.Subjects} 
              label="รายวิชา"
              collapsed={isSidebarCollapsed}
            />
            <NavItem 
              active={activeTab === Tab.TIMESLOTS} 
              onClick={() => setActiveTab(Tab.TIMESLOTS)} 
              icon={Icons.TimeSlots} 
              label="คาบเรียน"
              collapsed={isSidebarCollapsed}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto relative scroll-smooth pt-16 md:pt-0 bg-slate-50">
          <div key={activeTab} className="animate-fade-in-up h-full flex flex-col">
             {renderContent()}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

const NavItem = ({ active, onClick, icon: Icon, label, badge, collapsed }: any) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} w-full px-3 py-3 rounded-xl transition-all duration-200 mb-1 group ${
      active 
        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm translate-x-1' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={24} className={`transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
      {!collapsed && <span className="text-sm">{label}</span>}
    </div>
    {!collapsed && badge > 0 && (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
        active ? 'bg-indigo-200 text-indigo-800' : 'bg-rose-100 text-rose-600'
      }`}>
        {badge}
      </span>
    )}
    {collapsed && badge > 0 && (
       <div className="relative">
          <div className="absolute -top-2 -right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></div>
       </div>
    )}
  </button>
);