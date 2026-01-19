import { redirect } from "next/navigation";

// Redirigir a la vista principal (POS)
export default function DashboardPage() {
  redirect("/pos");
}
