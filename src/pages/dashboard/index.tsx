import { crumbsAtom } from "@/atoms/atom"
import ContentDashboard from "@/Components/ContentDashboard"
import { ProfileCard } from "@/Components/ProfileCard"
import ProfileCardSkeleton from "@/Components/ProfileCard/skeleton"
import { UpcomingAssignmentsCard } from "@/Components/UpcomingAssignmentsCard"
import UpcomingAssignmentsSkeleton from "@/Components/UpcomingAssignmentsCard/skeleton"
import { useAuthContext } from "@/context/AuthContext"
import { useFetch } from "@/hooks/useFetch"
import { IAssignment } from "@/types/assignment"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

function Dashboard() {
  const { user } = useAuthContext()
  const [, setCrumbs] = useAtom(crumbsAtom)

  const fetchConfig = user?.publisher ? `/publisher/${user.publisher.id}/assignment` : ""
  const { data, isLoading } = useFetch<IAssignment[]>(fetchConfig)

  useEffect(() => {
    setCrumbs([{ label: "Início", link: "/dashboard" }])
  }, [setCrumbs])

  return (
    <ContentDashboard>
      <section className="flex w-full h-fit justify-center items-center p-5">
        <div className="h-full flex flex-wrap justify-center items-center gap-5">
          {/* Profile Card or Skeleton */}
          {isLoading ? (
            <ProfileCardSkeleton />
          ) : (
            user && (
              <ProfileCard
                user={user}
                fullName={user.fullName}
                email={user.email}
                avatar_url={user.profile?.avatar_url}
              />
            )
          )}

          {/* Assignments Card or Skeleton */}
          {isLoading ? (
            <UpcomingAssignmentsSkeleton/>
          ) : (
            data && <UpcomingAssignmentsCard assignments={data} />
          )}
        </div>
      </section>
    </ContentDashboard>
  )
}

Dashboard.getLayout = withProtectedLayout()

export default Dashboard
