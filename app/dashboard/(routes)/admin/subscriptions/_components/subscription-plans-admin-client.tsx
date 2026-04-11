"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  SUBSCRIPTION_MONTHLY_CHAPTERS,
  SUBSCRIPTION_MONTHLY_DAYS,
  SUBSCRIPTION_TERM_CHAPTERS,
  SUBSCRIPTION_TERM_DAYS,
  defaultTitleForChapters,
} from "@/lib/subscription-plans";

type SubjectOption = {
  value: string;
  label: string;
};

type SubscriptionPlanItem = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  chaptersPerCourse: number;
  targetSubject: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

type PlanKind = "MONTHLY" | "TERM";

type FormState = {
  planKind: PlanKind;
  description: string;
  price: string;
  targetSubject: string;
  featuresText: string;
  isActive: "true" | "false";
  sortOrder: string;
};

const INITIAL_FORM: FormState = {
  planKind: "MONTHLY",
  description: "",
  price: "",
  targetSubject: "ALL_SUBJECTS",
  featuresText: "",
  isActive: "true",
  sortOrder: "0",
};

function chaptersForKind(kind: PlanKind): number {
  return kind === "TERM" ? SUBSCRIPTION_TERM_CHAPTERS : SUBSCRIPTION_MONTHLY_CHAPTERS;
}

function kindFromChapters(chapters: number): PlanKind {
  return chapters === SUBSCRIPTION_TERM_CHAPTERS ? "TERM" : "MONTHLY";
}

export function SubscriptionPlansAdminClient({
  initialPlans,
  subjectOptions,
}: {
  initialPlans: SubscriptionPlanItem[];
  subjectOptions: SubjectOption[];
}) {
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>(initialPlans);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const sortedPlans = useMemo(
    () =>
      [...plans].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }),
    [plans]
  );

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingPlanId(null);
  };

  const parseFeatures = (text: string) =>
    text
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  const upsertPlanInState = (plan: SubscriptionPlanItem) => {
    setPlans((prev) => {
      const exists = prev.some((item) => item.id === plan.id);
      if (!exists) return [plan, ...prev];
      return prev.map((item) => (item.id === plan.id ? plan : item));
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const description = form.description.trim();
    const price = Number(form.price);
    const sortOrder = Number(form.sortOrder || 0);
    const features = parseFeatures(form.featuresText);
    const chaptersPerCourse = chaptersForKind(form.planKind);
    const title = defaultTitleForChapters(chaptersPerCourse);

    if (!Number.isFinite(price) || price <= 0 || features.length === 0) {
      toast.error("أدخل سعراً صحيحاً ومميزات للاشتراك");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title,
        description,
        price,
        chaptersPerCourse,
        targetSubject: form.targetSubject,
        features,
        isActive: form.isActive === "true",
        sortOrder: Number.isFinite(sortOrder) ? Math.trunc(sortOrder) : 0,
      };

      const endpoint = editingPlanId
        ? `/api/admin/subscription-plans/${editingPlanId}`
        : "/api/admin/subscription-plans";
      const method = editingPlanId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "فشل حفظ الخطة");
      }

      const savedPlan = (await response.json()) as SubscriptionPlanItem;
      upsertPlanInState(savedPlan);
      toast.success(editingPlanId ? "تم تحديث الخطة" : "تم إنشاء الخطة");
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء الحفظ";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (plan: SubscriptionPlanItem) => {
    setEditingPlanId(plan.id);
    setForm({
      planKind: kindFromChapters(plan.chaptersPerCourse),
      description: plan.description ?? "",
      price: String(plan.price),
      targetSubject: plan.targetSubject,
      featuresText: plan.features.join("\n"),
      isActive: plan.isActive ? "true" : "false",
      sortOrder: String(plan.sortOrder),
    });
  };

  const handleDelete = async (planId: string) => {
    const confirmed = window.confirm("هل تريد حذف خطة الاشتراك هذه نهائياً؟");
    if (!confirmed) return;

    setIsDeleting(planId);
    try {
      const response = await fetch(`/api/admin/subscription-plans/${planId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "تعذر حذف الخطة");
      }
      setPlans((prev) => prev.filter((item) => item.id !== planId));
      toast.success("تم حذف الخطة");
      if (editingPlanId === planId) {
        resetForm();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء الحذف";
      toast.error(message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6" dir="rtl">
      <h1 className="text-2xl font-bold">إدارة خطط الاشتراك</h1>

      <Card>
        <CardHeader>
          <CardTitle>{editingPlanId ? "تعديل خطة اشتراك" : "إنشاء خطة اشتراك جديدة"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">نوع الخطة</label>
              <Select
                value={form.planKind}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, planKind: value as PlanKind }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={6}
                  className="max-h-64 overflow-y-auto"
                >
                  <SelectItem value="MONTHLY">
                    شهري — {SUBSCRIPTION_MONTHLY_CHAPTERS} دروس لكل كورس، {SUBSCRIPTION_MONTHLY_DAYS} يوماً
                  </SelectItem>
                  <SelectItem value="TERM">
                    ترم — {SUBSCRIPTION_TERM_CHAPTERS} درساً لكل كورس، {SUBSCRIPTION_TERM_DAYS} يوماً
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                العنوان يُحفظ تلقائياً ({defaultTitleForChapters(chaptersForKind(form.planKind))}). الوصول
                يجمع بين عدد الدروس بالترتيب ومدة الخطة؛ عند التجديد تُضاف المدة من نهاية الفترة الحالية لكل
                كورس.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">السعر (جنيه)</label>
              <Input
                type="number"
                min="1"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">المادة المستهدفة</label>
              <Select
                value={form.targetSubject}
                onValueChange={(value) => setForm((prev) => ({ ...prev, targetSubject: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المادة" />
                </SelectTrigger>
                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={6}
                  className="max-h-64 overflow-y-auto"
                >
                  {subjectOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">الحالة</label>
              <Select
                value={form.isActive}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, isActive: value as "true" | "false" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent
                  side="bottom"
                  align="start"
                  sideOffset={6}
                  className="max-h-64 overflow-y-auto"
                >
                  <SelectItem value="true">مفعلة</SelectItem>
                  <SelectItem value="false">غير مفعلة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">الوصف (اختياري)</label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="وصف مختصر للخطة"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">المميزات (كل ميزة في سطر)</label>
              <Textarea
                rows={5}
                value={form.featuresText}
                onChange={(e) => setForm((prev) => ({ ...prev, featuresText: e.target.value }))}
                placeholder={"ميزة 1\nميزة 2\nميزة 3"}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ترتيب الظهور</label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" disabled={isSaving} className="bg-brand hover:bg-brand/90">
                {isSaving ? "جاري الحفظ..." : editingPlanId ? "حفظ التعديلات" : "إنشاء الخطة"}
              </Button>
              {editingPlanId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  إلغاء
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>كل خطط الاشتراك</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedPlans.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد خطط حتى الآن.</p>
          ) : (
            <div className="space-y-3">
              {sortedPlans.map((plan) => {
                const subjectLabel =
                  subjectOptions.find((option) => option.value === plan.targetSubject)?.label ??
                  plan.targetSubject;
                return (
                  <div key={plan.id} className="rounded-lg border p-3 md:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{plan.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {subjectLabel} • {plan.price} جنيه • {plan.chaptersPerCourse} دروس/كورس •{" "}
                          {plan.chaptersPerCourse === SUBSCRIPTION_TERM_CHAPTERS
                            ? SUBSCRIPTION_TERM_DAYS
                            : SUBSCRIPTION_MONTHLY_DAYS}{" "}
                          يوم/كورس • ترتيب {plan.sortOrder} • {plan.isActive ? "مفعلة" : "غير مفعلة"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                          تعديل
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(plan.id)}
                          disabled={isDeleting === plan.id}
                        >
                          {isDeleting === plan.id ? "جاري الحذف..." : "حذف"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
