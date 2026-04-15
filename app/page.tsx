import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner"
import { NextLessonCard } from "@/components/dashboard/NextLessonCard"
import { TasksPanel } from "@/components/dashboard/TasksPanel"
import { StatsPreview } from "@/components/dashboard/StatsPreview"
import { QuickActions } from "@/components/dashboard/QuickActions"
import { MiniCalendarWidget } from "@/components/dashboard/MiniCalendarWidget"
import { MobileTeacherWidgets } from "@/components/dashboard/MobileTeacherWidgets"

export default function DashboardPage() {
  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto pb-24 md:pb-12">
      <WelcomeBanner />

      {/* Mobile-only Teacher Widgets */}
      <div className="block lg:hidden">
        <MobileTeacherWidgets />
      </div>

      {/* Quick Actions (Universal) */}
      <QuickActions />

      {/* Stats Overview */}
      <StatsPreview />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column: Schedule & Planning (Takes up 2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <NextLessonCard />
            <MiniCalendarWidget />
          </div>
        </div>

        {/* Right Column: Tasks & Alerts */}
        <div className="space-y-6 md:space-y-8">
          <TasksPanel />
        </div>

      </div>
    </div>
  )
}
