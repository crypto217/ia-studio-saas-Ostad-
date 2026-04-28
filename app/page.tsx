import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner"
import { SmartTicker } from "@/components/dashboard/SmartTicker"
import { NextLessonCard } from "@/components/dashboard/NextLessonCard"
import { TasksPanel } from "@/components/dashboard/TasksPanel"
import { StatsPreview } from "@/components/dashboard/StatsPreview"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { MiniCalendarWidget } from "@/components/dashboard/MiniCalendarWidget"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 md:space-y-6 max-w-7xl mx-auto">
      <WelcomeBanner />

      {/* Quick Actions - App-like horizontal row or dense grid on mobile */}
      <QuickActions />

      {/* Main Content Grid (Desktop mostly, or pushed down on mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-10">
        
        {/* Left Column: Schedule & Planning */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-6">
          <NextLessonCard />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <StatsPreview />
            <MiniCalendarWidget />
          </div>
        </div>

        {/* Right Column: Tasks & Alerts */}
        <div className="space-y-4 sm:space-y-6 md:space-y-6">
          <TasksPanel />
          <div className="hidden md:block">
            <SmartTicker />
          </div>
        </div>

      </div>

      {/* Dynamic Island for notifications - Mobile only typically or small screen indicator */}
      <div className="md:hidden">
        <SmartTicker />
      </div>

    </div>
  )
}
