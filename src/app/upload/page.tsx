import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import UploadClient from "./upload-client";

export default async function UploadPage() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") {
    redirect("/login");
  }

  return <UploadClient />;
}
