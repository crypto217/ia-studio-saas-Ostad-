import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#FFFAF3]">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      <p className="text-slate-400 mt-4 text-sm font-medium">Chargement du bureau magique...</p>
    </div>
  )
}
