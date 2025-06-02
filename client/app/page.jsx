"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

function page() {
  const { user } = useAuth();
  const router = useRouter();
  if (user) {
    router.push("/home");
  } else {
    router.push("/login");
  }

  return <div>Loading...</div>;
}

export default page;
