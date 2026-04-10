"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import {
  ChevronLeft,
  LogOut,
  Mail,
  Settings,
} from "lucide-react";

const WHATSAPP_URL = "https://wa.me/201112970189";

export function ProfileActions() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      await signOut({ callbackUrl: "/" });
    }
  };

  const ActionRow = ({
    icon,
    label,
    onClick,
    href,
    danger = false,
  }: {
    icon: ReactNode;
    label: string;
    onClick?: () => void;
    href?: string;
    danger?: boolean;
  }) => {
    const content = (
      <>
        <ChevronLeft className="h-4 w-4 text-slate-400" />
        <div className="flex items-center gap-2">
          <span className={danger ? "text-rose-600" : "text-slate-700"}>{label}</span>
          <span className={danger ? "text-rose-500" : "text-cyan-500"}>{icon}</span>
        </div>
      </>
    );

    if (href) {
      return (
        <Link
          href={href}
          className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 text-sm transition hover:bg-slate-50"
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3 text-sm transition hover:bg-slate-50"
      >
        {content}
      </button>
    );
  };

  return (
    <div className="space-y-2">
      <ActionRow
        label="تعديل البيانات"
        icon={<Settings className="h-4 w-4" />}
        onClick={() => router.push("/dashboard/profile/edit")}
      />
      <ActionRow
        label="تواصل معنا"
        icon={<Mail className="h-4 w-4" />}
        href={WHATSAPP_URL}
      />

      <ActionRow
        label="تسجيل الخروج"
        icon={<LogOut className="h-4 w-4" />}
        danger
        onClick={handleLogout}
      />
    </div>
  );
}
