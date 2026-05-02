import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner"
import { TasksPanel } from "@/components/dashboard/TasksPanel"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { ClassAnalyticsDashboard } from "@/components/dashboard/ClassAnalyticsDashboard"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-8">
      <WelcomeBanner />

      {/* Quick Actions - App-like horizontal row or dense grid on mobile */}
      <QuickActions />

      {/* Main Content Grid (Desktop mostly, or pushed down on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          <ClassAnalyticsDashboard />
        </div>

        {/* Right Column: Tasks & Alerts */}
        <div className="lg:col-span-1">
          <TasksPanel />
        </div>

      </div>
    </div>
  )
}
