"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CURRICULUM_OPTIONS,
  GRADE_12_DIVISION_SELECTIONS,
  GRADE_OPTIONS,
  SECOND_LANGUAGE_OPTIONS,
  getSignupDivisionOptions,
} from "@/lib/academics";

type EditProfileFormProps = {
  initialData: {
    fullName: string;
    phoneNumber: string;
    parentPhoneNumber: string;
    grade: string;
    division: string;
    curriculum: string;
    secondLanguage: string;
  };
};

function getInitialDivisionValue(grade: string, division: string, curriculum: string) {
  if (grade !== "GRADE_12") return division;
  const match = GRADE_12_DIVISION_SELECTIONS.find(
    (item) => item.division === division && item.curriculum === curriculum
  );
  return match?.value ?? "";
}

export function EditProfileForm({ initialData }: EditProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: initialData.fullName,
    phoneNumber: initialData.phoneNumber,
    parentPhoneNumber: initialData.parentPhoneNumber,
    grade: initialData.grade,
    division: getInitialDivisionValue(
      initialData.grade,
      initialData.division,
      initialData.curriculum
    ),
    curriculum: initialData.curriculum,
    secondLanguage: initialData.secondLanguage,
    password: "",
    confirmPassword: "",
  });

  const isGrade12 = formData.grade === "GRADE_12";
  const isGrade10 = formData.grade === "GRADE_10";
  const divisionOptions = getSignupDivisionOptions(formData.grade);
  const requiresCurriculumChoice = !isGrade12;

  const academicDataValid = useMemo(
    () =>
      !!formData.grade &&
      !!formData.division &&
      !!formData.secondLanguage &&
      (requiresCurriculumChoice ? !!formData.curriculum : true),
    [formData.grade, formData.division, formData.secondLanguage, formData.curriculum, requiresCurriculumChoice]
  );

  const passwordProvided = formData.password.length > 0 || formData.confirmPassword.length > 0;
  const passwordValid = !passwordProvided || formData.password === formData.confirmPassword;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!academicDataValid) {
      toast.error("يرجى استكمال البيانات الدراسية");
      return;
    }

    if (!passwordValid) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    setIsLoading(true);
    try {
      await axios.patch("/api/user/profile", {
        ...formData,
      });
      toast.success("تم تحديث البيانات بنجاح");
      router.push("/dashboard/profile");
      router.refresh();
    } catch (error) {
      const axiosError = error as AxiosError;
      const message = String(axiosError.response?.data ?? "");
      if (message.includes("Phone number already exists")) {
        toast.error("رقم الهاتف مسجل مسبقاً");
      } else if (message.includes("Parent phone number already exists")) {
        toast.error("رقم هاتف ولي الأمر مسجل مسبقاً");
      } else if (message.includes("Phone number cannot be the same")) {
        toast.error("رقم الهاتف لا يمكن أن يكون نفس رقم هاتف ولي الأمر");
      } else if (message.includes("Passwords do not match")) {
        toast.error("كلمات المرور غير متطابقة");
      } else {
        toast.error("حدث خطأ أثناء تحديث البيانات");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-4 md:p-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">الاسم الكامل</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">رقم الهاتف</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentPhoneNumber">رقم هاتف ولي الأمر</Label>
        <Input
          id="parentPhoneNumber"
          name="parentPhoneNumber"
          type="tel"
          value={formData.parentPhoneNumber}
          onChange={handleInputChange}
          disabled={isLoading}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>الصف الدراسي</Label>
          <Select
            value={formData.grade}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                grade: value,
                division: value === "GRADE_10" ? "GENERAL" : "",
                curriculum: value === "GRADE_10" ? prev.curriculum : "",
              }))
            }
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الصف الدراسي" />
            </SelectTrigger>
            <SelectContent>
              {GRADE_OPTIONS.map((grade) => (
                <SelectItem key={grade.value} value={grade.value}>
                  {grade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>الشعبة</Label>
          <Select
            value={formData.division}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                division: value,
                curriculum: isGrade12
                  ? value.includes("_ARABIC")
                    ? "ARABIC_CURRICULUM"
                    : value.includes("_LANGUAGES")
                      ? "LANGUAGES_CURRICULUM"
                      : prev.curriculum
                  : prev.curriculum,
              }))
            }
            disabled={isLoading || !formData.grade}
          >
            <SelectTrigger>
              <SelectValue placeholder={isGrade10 ? "عام (لا يوجد شعبات)" : "اختر الشعبة"} />
            </SelectTrigger>
            <SelectContent>
              {divisionOptions.map((division) => (
                <SelectItem key={division.value} value={division.value}>
                  {division.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!isGrade12 && (
        <div className="space-y-2">
          <Label>المنهج</Label>
          <div className="grid grid-cols-2 gap-2">
            {CURRICULUM_OPTIONS.map((curriculum) => {
              const isSelected = formData.curriculum === curriculum.value;
              return (
                <Button
                  key={curriculum.value}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  disabled={isLoading}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      curriculum: curriculum.value,
                    }))
                  }
                >
                  {curriculum.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>اللغة الثانية</Label>
        <Select
          value={formData.secondLanguage}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, secondLanguage: value }))}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="اختر اللغة الثانية" />
          </SelectTrigger>
          <SelectContent>
            {SECOND_LANGUAGE_OPTIONS.map((language) => (
              <SelectItem key={language.value} value={language.value}>
                {language.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">كلمة المرور الجديدة (اختياري)</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute left-1 top-1 h-8 w-8"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute left-1 top-1 h-8 w-8"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Button type="submit" disabled={isLoading} className="bg-brand hover:bg-brand/90">
          {isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/profile")}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
