import { crumbsAtom } from "@/atoms/atom";
import AccessRequestCard from "@/Components/AccessRequestCard";
import { CongregationReportsChart } from "@/Components/CongregationReportsChart";
import ContentDashboard from "@/Components/ContentDashboard";
import { ProfileCard } from "@/Components/ProfileCard";
import ProfileCardSkeleton from "@/Components/ProfileCard/skeleton";
import { UpcomingAssignmentsCard } from "@/Components/UpcomingAssignmentsCard";
import UpcomingAssignmentsSkeleton from "@/Components/UpcomingAssignmentsCard/skeleton";
import { UpcomingRemindersCard } from "@/Components/UpcomingRemindersCard";
import UpcomingRemindersSkeleton from "@/Components/UpcomingRemindersCard/skeleton";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useAuthContext } from "@/context/AuthContext";
import { useFetch } from "@/hooks/useFetch";
import { api } from "@/services/api";
import { IAssignment } from "@/types/assignment";
import { IReminder } from "@/types/reminder";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { useAtom } from "jotai";
import { Clock } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function Dashboard() {
  const { user, loading } = useAuthContext();
  const [, setCrumbs] = useAtom(crumbsAtom);
  const router = useRouter();
  const [adminPendingCount, setAdminPendingCount] = useState<number>(0);

  const fetchConfig = user?.publisher ? `/publisher/${user.publisher.id}/assignment` : "";
  const { data, isLoading } = useFetch<IAssignment[]>(fetchConfig);

  const fetchRemindersConfig = user?.publisher
    ? `${API_ROUTES.PUBLISHER_REMINDERS}/publishers/${user.publisher.id}`
    : "";
  const { data: reminders, isLoading: isLoadingReminders, mutate } = useFetch<IReminder[]>(
    fetchRemindersConfig
  );

  useEffect(() => {
    setCrumbs([{ label: "Início", link: "/dashboard" }]);
  }, [setCrumbs]);

  // Verificação em segundo plano sem travar renderização para administradores
  useEffect(() => {
    const isAdmin = user?.roles?.some(
      (r) => r.name === "ADMIN" || r.name === "ADMIN_CONGREGATION"
    );
    const congregationId = user?.congregation?.id;

    if (!user || !isAdmin || !congregationId) return;

    let isMounted = true;

    api
      .get(`/access-requests/congregation/${congregationId}`)
      .then((res) => {
        if (!isMounted) return;
        const pending = res.data?.filter((r: any) => r.status === "PENDING");
        const count = pending?.length || 0;
        setAdminPendingCount(count);

        if (count > 0) {
          const alreadyRedirected = sessionStorage.getItem("access_requests_redirected");
          if (!alreadyRedirected) {
            sessionStorage.setItem("access_requests_redirected", "true");
            toast.info(
              `Há ${count} solicitação(ões) de acesso pendente(s) na sua congregação.`,
              { toastId: "pending-access-requests" }
            );
            router.push("/administracao/add-domain");
          }
        }
      })
      .catch((err) => {
        console.warn("Verificação em segundo plano de solicitações de acesso:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [user, router]);

  return (
    <ContentDashboard>
      <section className="flex flex-col w-full h-fit justify-center items-center p-5 gap-4">
        {/* Banner para administrador com solicitações pendentes caso ele esteja no dashboard */}
        {adminPendingCount > 0 && (
          <div className="w-full max-w-4xl p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white flex-shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-typography-700">
                  Você possui {adminPendingCount} solicitação(ões) de acesso pendente(s)
                </h4>
                <p className="text-xs text-typography-500">
                  Novos usuários estão aguardando sua autorização para entrar no domínio da congregação.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/administracao/add-domain")}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-md shadow-amber-500/20 whitespace-nowrap"
            >
              Avaliar Solicitações
            </button>
          </div>
        )}

        <div className="h-full w-full flex flex-wrap justify-center items-center gap-5">
          {/* Profile Card or Skeleton */}
          {loading ? (
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

          {/* Access Request Card if user has no congregation */}
          {!loading && user && !user.congregation && (
            <AccessRequestCard />
          )}

          {/* Assignments Card or Skeleton */}
          {isLoading ? (
            <UpcomingAssignmentsSkeleton />
          ) : (
            data && <UpcomingAssignmentsCard assignments={data} />
          )}

          {/* Reminders Card or Skeleton */}
          {isLoadingReminders ? (
            <UpcomingRemindersSkeleton />
          ) : (
            reminders && <UpcomingRemindersCard reminders={reminders} mutateReminders={mutate} />
          )}

          {/* Congregation Reports Chart & Summary */}
          <CongregationReportsChart />
        </div>
      </section>
    </ContentDashboard>
  );
}

Dashboard.getLayout = withProtectedLayout();

export default Dashboard;
