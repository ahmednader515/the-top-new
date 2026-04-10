import { redirect } from "next/navigation";

export default function LegacySearchRedirectPage() {
  redirect("/dashboard/ask-teacher");
}