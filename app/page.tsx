import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner"
import { StudentNewsRadar } from "@/components/dashboard/StudentNewsRadar"
import { NextLessonCard } from "@/components/dashboard/NextLessonCard"
import { TasksPanel } from "@/components/dashboard/TasksPanel"
import { StatsPreview } from "@/components/dashboard/StatsPreview"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { MiniCalendarWidget } from "@/components/dashboard/MiniCalendarWidget"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 md:space-y-12 max-w-7xl mx-auto">
      <WelcomeBanner />

      {/* Le Radar des Élèves (Bandeau TV Interactive) - Mobile only */}
      <div className="md:hidden">
        <StudentNewsRadar />
      </div>

      {/* Quick Actions - App-like horizontal row or dense grid on mobile */}
      <QuickActions />

      {/* Stats Overview - We will make it horizontal scroll on mobile inside the component */}
      <StatsPreview />

      {/* Main Content Grid (Desktop mostly, or pushed down on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        
        {/* Left Column: Schedule & Planning */}
        <div className="lg:col-span-2 space-y-6 md:space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <NextLessonCard />
            <div>
              <MiniCalendarWidget />
            </div>
          </div>
        </div>

        {/* Right Column: Tasks & Alerts */}
        <div className="space-y-6 md:space-y-12">
          <TasksPanel />
        </div>

      </div>
    </div>
  )
}
