import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="flex h-screen w-full bg-zinc-50 dark:bg-black overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl -z-10 rounded-b-full"></div>
      
      {/* Sidebar - Hidden on mobile, handled by a mobile menu in a real app */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
