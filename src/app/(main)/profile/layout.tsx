import { ProfileNav } from "@/components/profile/profile-nav";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight">Личный кабинет</h1>
      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <ProfileNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
