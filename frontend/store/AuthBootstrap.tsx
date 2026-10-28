"use client";

import { useEffect } from "react";
import { getCurrentUser } from "@/api/auth.api";
import { Loading } from "@/components/ui/Loading";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeAuth } from "@/store/slices/authSlice";

type Props = {
  children: React.ReactNode;
};

export default function AuthBootstrap({ children }: Props) {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector((state) => state.auth.initialized);

  useEffect(() => {
    async function loadCurrentUser() {
      const user = await getCurrentUser();

      dispatch(initializeAuth({ user }));
    }

    loadCurrentUser();
  }, [dispatch]);

  if (!initialized) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loading />
      </main>
    );
  }

  return <>{children}</>;
}
