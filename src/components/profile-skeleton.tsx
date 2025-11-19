import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function ProfileSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 space-y-4 sm:space-y-5">
      {/* Profile Card Skeleton */}
      <Card className="w-full overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6">
            {/* Avatar Skeleton */}
            <div className="flex-shrink-0">
              <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-full" />
            </div>
            
            {/* User Info Skeleton */}
            <div className="flex-1 w-full min-w-0 text-center sm:text-left space-y-4">
              {/* Edit Button Skeleton - Desktop */}
              <div className="hidden sm:flex items-center justify-end mb-3">
                <Skeleton className="h-9 w-28" />
              </div>
              
              {/* Name & Username Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                <Skeleton className="h-6 w-32 mx-auto sm:mx-0" />
              </div>
              
              {/* Contact Info Skeleton */}
              <div className="space-y-3">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              
              {/* Edit Button Skeleton - Mobile */}
              <div className="sm:hidden flex justify-center mt-4">
                <Skeleton className="h-9 w-full max-w-xs" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}