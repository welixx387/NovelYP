import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold">Настройки профиля</h2>
      <SettingsForm user={user} />
    </div>
  );
}
