import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import StudentMonitoring from './pages/StudentMonitoring';
import Analytics from './pages/Analytics';
import InterventionHub from './pages/InterventionHub';
import StudentProfile from './pages/StudentProfile';
import Timeline from './pages/Timeline';
import InputScore from './pages/InputScore';
import Login from './pages/Login';
import AddStudent from './pages/AddStudent';
import CreateTask from './pages/CreateTask';
import AllTasks from './pages/AllTasks';
import TeacherSettings from './pages/TeacherSettings';
import StudentDashboard from './pages/StudentDashboard';
import StudentSettings from './pages/StudentSettings';
import StudentMission from './pages/StudentMission';
import { LanguageProvider } from './LanguageContext';

// Create a layout component to conditionally render Sidebar/Header
const Layout = ({ children, isSidebarOpen, setIsSidebarOpen, isStandalonePage }) => {
  if (isStandalonePage) {
    return <main className="w-full min-h-screen bg-background">{children}</main>;
  }
  return (
    <>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="ml-0 md:ml-[280px] w-full flex-grow h-screen overflow-y-auto bg-background relative pb-16 md:pb-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        {children}
        <div className="h-24"></div>
        <BottomNav />
      </main>
    </>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="flex overflow-hidden bg-background min-h-screen font-body-md text-on-surface">
          <Routes>
            <Route path="/login" element={
              <Layout isStandalonePage={true}>
                <Login />
              </Layout>
            } />
            <Route path="/student-dashboard" element={
              <Layout isStandalonePage={true}>
                <StudentDashboard />
              </Layout>
            } />
            <Route path="/student-settings" element={
              <Layout isStandalonePage={true}>
                <StudentSettings />
              </Layout>
            } />
            <Route path="/student-mission" element={
              <Layout isStandalonePage={true}>
                <StudentMission />
              </Layout>
            } />
            <Route path="/*" element={
              <Layout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} isStandalonePage={false}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/students" element={<StudentMonitoring />} />
                  <Route path="/students/:id" element={<StudentProfile />} />
                  <Route path="/students/:id/create-task" element={<CreateTask />} />
                  <Route path="/tasks" element={<AllTasks />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/interventions" element={<InterventionHub />} />
                  <Route path="/timeline" element={<Timeline />} />
                  <Route path="/input-score" element={<InputScore />} />
                  <Route path="/add-student" element={<AddStudent />} />
                  <Route path="/settings" element={<TeacherSettings />} />
                  {/* Add more routes here as needed */}
                </Routes>
                
                {/* Contextual FAB (Floating Action Button) */}
                
              </Layout>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
