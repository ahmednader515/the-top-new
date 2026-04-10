"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Course } from "@prisma/client";
import { MessageCircle, UserSquare2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/file-upload";

interface TeacherContactFormProps {
  initialData: Course;
  courseId: string;
}

export function TeacherContactForm({ initialData, courseId }: TeacherContactFormProps) {
  const router = useRouter();

  const handlePhoneSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const value = String(formData.get("teacherWhatsappNumber") ?? "").trim();
    try {
      await axios.patch(`/api/courses/${courseId}`, {
        teacherWhatsappNumber: value || null,
      });
      toast.success("تم حفظ رقم واتساب المدرس");
      router.refresh();
    } catch {
      toast.error("تعذر حفظ رقم واتساب");
    }
  };

  const handleImageSave = async (url: string) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, {
        teacherImageUrl: url,
      });
      toast.success("تم تحديث صورة المدرس");
      router.refresh();
    } catch {
      toast.error("تعذر تحديث صورة المدرس");
    }
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm md:p-5 space-y-4">
      <div>
        <h3 className="text-base font-semibold">بيانات التواصل مع المدرس</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          هذه البيانات تظهر للطلاب في صفحة «اسأل مدرس» وبطاقات المحتوى.
        </p>
      </div>

      <form onSubmit={handlePhoneSave} className="space-y-2">
        <Label className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          رقم واتساب المدرس
        </Label>
        <div className="flex items-center gap-2">
          <Input
            name="teacherWhatsappNumber"
            defaultValue={initialData.teacherWhatsappNumber ?? ""}
            placeholder="مثال: +201001234567"
            dir="ltr"
          />
          <Button type="submit">حفظ</Button>
        </div>
      </form>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <UserSquare2 className="h-4 w-4" />
          صورة المدرس
        </Label>
        <div className="relative h-28 w-28 overflow-hidden rounded-lg border bg-muted">
          <Image
            src={initialData.teacherImageUrl || "/male.png"}
            alt="صورة المدرس"
            fill
            className="object-cover"
          />
        </div>
        <FileUpload
          endpoint="courseImage"
          onChange={(res) => {
            if (res?.url) {
              handleImageSave(res.url);
            }
          }}
        />
      </div>
    </div>
  );
}
