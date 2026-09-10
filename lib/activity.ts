import Activity from "@/models/activity";

export async function recordActivity(activity: string, icon: string) {
  await Activity.create({ activity, icon, user: "Admin User", status: "Completed" });
}