"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import { Check, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  COURSE_DIVISION_OPTIONS,
  CURRICULUM_OPTIONS,
  GRADE_OPTIONS,
  SUBJECT_OPTIONS,
  getAllowedSubjectsForStudent,
  normalizeSubjectForDisplay,
} from "@/lib/academics";

const formSchema = z.object({
  curriculum: z.string().min(1, "المنهج مطلوب"),
  grade: z.string().min(1, "الصف الدراسي مطلوب"),
  division: z.string().min(1, "الشعبة مطلوبة"),
  subject: z.string().min(1, "المادة مطلوبة"),
});

type FormValues = z.infer<typeof formSchema>;

interface AcademicClassificationFormProps {
  initialData: Course;
  courseId: string;
}

export function AcademicClassificationForm({
  initialData,
  courseId,
}: AcademicClassificationFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scalarOrEmpty = (value: unknown) => (typeof value === "string" ? value : "");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      curriculum: scalarOrEmpty(initialData.curriculum),
      grade: scalarOrEmpty(initialData.grade),
      division: scalarOrEmpty(initialData.divisions?.[0]),
      subject: scalarOrEmpty(initialData.subject),
    },
  });

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const watchedGrade = scalarOrEmpty(form.watch("grade"));
  const watchedCurriculum = scalarOrEmpty(form.watch("curriculum"));
  const watchedDivision = scalarOrEmpty(form.watch("division"));
  const watchedSubject = scalarOrEmpty(form.watch("subject"));

  const divisionOptions = useMemo(() => {
    if (watchedGrade === "GRADE_10") {
      return COURSE_DIVISION_OPTIONS.filter((option) => option.value === "GENERAL");
    }
    if (watchedGrade === "GRADE_11") {
      return COURSE_DIVISION_OPTIONS.filter(
        (option) => option.value === "SCIENTIFIC" || option.value === "ARTS"
      );
    }
    if (watchedGrade === "GRADE_12") {
      return COURSE_DIVISION_OPTIONS.filter(
        (option) =>
          option.value === "SCIENTIFIC_SCIENCE" ||
          option.value === "SCIENTIFIC_MATH" ||
          option.value === "ARTS"
      );
    }
    return [];
  }, [watchedGrade]);

  const subjectOptions = useMemo(() => {
    if (!watchedGrade) return [] as typeof SUBJECT_OPTIONS;
    if (!watchedDivision) return [] as typeof SUBJECT_OPTIONS;

    const selectedDivisionSeeds = watchedDivision &&
      divisionOptions.some((option) => option.value === watchedDivision)
        ? [watchedDivision]
        : [];
    const gradeDefaultSeeds =
      watchedGrade === "GRADE_10"
        ? ["GENERAL"]
        : watchedGrade === "GRADE_11"
          ? ["SCIENTIFIC", "ARTS"]
          : watchedGrade === "GRADE_12"
            ? ["SCIENTIFIC_SCIENCE", "SCIENTIFIC_MATH", "ARTS"]
            : [];
    const gradeDivisionSeeds =
      selectedDivisionSeeds.length > 0 ? selectedDivisionSeeds : gradeDefaultSeeds;

    const normalizedValues = new Set<string>();
    for (const division of gradeDivisionSeeds) {
      const values = getAllowedSubjectsForStudent({
        grade: watchedGrade,
        curriculum: watchedCurriculum || undefined,
        division,
      });
      values.forEach((value) => {
        const normalized = normalizeSubjectForDisplay(value);
        if (normalized) normalizedValues.add(normalized);
      });
    }

    return SUBJECT_OPTIONS.filter((option) => {
      if (!normalizedValues.has(option.value)) return false;

      // For curriculum-specific paired subjects, only show the matching track.
      if (watchedCurriculum === "LANGUAGES_CURRICULUM" && option.value.endsWith("_AR")) {
        return false;
      }
      if (watchedCurriculum === "ARABIC_CURRICULUM" && option.value.endsWith("_EN")) {
        return false;
      }

      return true;
    });
  }, [divisionOptions, watchedDivision, watchedGrade, watchedCurriculum]);

  useEffect(() => {
    if (!watchedGrade) return;

    const allowedDivisionValues = new Set(divisionOptions.map((option) => option.value));
    if (watchedDivision && !allowedDivisionValues.has(watchedDivision)) {
      form.setValue("division", "", { shouldValidate: true });
    }

    const allowedSubjectValues = new Set(subjectOptions.map((option) => option.value));
    if (watchedSubject && !allowedSubjectValues.has(watchedSubject)) {
      form.setValue("subject", "", { shouldValidate: true });
    }
  }, [divisionOptions, form, subjectOptions, watchedDivision, watchedSubject]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/courses/${courseId}`, {
        curriculum: values.curriculum,
        grade: values.grade,
        subject: values.subject,
        divisions: [values.division],
      });
      toast.success("تم تحديث تصنيف الكورس");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("تعذر حفظ تصنيف الكورس");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedGrade = GRADE_OPTIONS.find((item) => item.value === initialData.grade);
  const selectedSubject = SUBJECT_OPTIONS.find((item) => item.value === initialData.subject);
  const selectedCurriculum = CURRICULUM_OPTIONS.find((item) => item.value === initialData.curriculum);
  const selectedDivision = COURSE_DIVISION_OPTIONS.find((item) =>
    (initialData.divisions ?? []).includes(item.value)
  );

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        تصنيف الكورس (الصف / الشعبة / المادة)
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>إلغاء</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              تعديل التصنيف
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <div className="mt-4 space-y-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold">المنهج:</span> {selectedCurriculum?.label ?? "غير محدد"}
          </p>
          <p>
            <span className="font-semibold">الصف:</span> {selectedGrade?.label ?? "غير محدد"}
          </p>
          <p>
            <span className="font-semibold">المادة:</span> {selectedSubject?.label ?? "غير محدد"}
          </p>
          <p>
            <span className="font-semibold">الشعبة:</span>{" "}
            {selectedDivision?.label ?? "غير محدد"}
          </p>
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="curriculum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المنهج</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={scalarOrEmpty(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنهج" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRICULUM_OPTIONS.map((curriculum) => (
                        <SelectItem key={curriculum.value} value={curriculum.value}>
                          {curriculum.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الصف الدراسي</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={scalarOrEmpty(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الصف الدراسي" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GRADE_OPTIONS.map((grade) => (
                        <SelectItem key={grade.value} value={grade.value}>
                          {grade.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="division"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الشعبة</FormLabel>
                  <Select
                    disabled={isLoading || !watchedGrade}
                    onValueChange={(value) => field.onChange(value)}
                    value={scalarOrEmpty(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الشعبة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {divisionOptions.map((division) => (
                        <SelectItem key={division.value} value={division.value}>
                          {division.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المادة</FormLabel>
                  <Select
                    disabled={isLoading || !watchedGrade || !watchedDivision}
                    onValueChange={(value) => field.onChange(value)}
                    value={scalarOrEmpty(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المادة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjectOptions.map((subject) => (
                        <SelectItem key={subject.value} value={subject.value}>
                          {subject.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-x-2">
              <Button disabled={isLoading} type="submit">
                <Check className="h-4 w-4 mr-2" />
                حفظ التصنيف
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
