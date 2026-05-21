import { redirect } from "next/navigation";

// Root redirects to Class 9 by default
export default function RootPage() {
  redirect("/class/9");
}
