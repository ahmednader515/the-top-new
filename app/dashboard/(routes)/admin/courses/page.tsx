import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { CoursesTable } from "./_components/courses-table";
import { columns } from "./_components/columns";
import { Button } from "@/components/ui/button";
import { PlusCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SUBJECT_OPTIONS, SUBJECT_LABEL_BY_VALUE } from "@/lib/academics";
import { SubscriptionPlansAdminClient } from "../subscriptions/_components/subscription-plans-admin-client";

type CoursesPageProps = {
    searchParams?: Promise<{ tab?: string }>;
};

const CoursesPage = async ({ searchParams }: CoursesPageProps) => {
    const { userId, user } = await auth();

    if (!userId) {
        return redirect("/");
    }

    const isAdmin = user?.role === "ADMIN";
    const courseBasePath = isAdmin ? "/dashboard/admin/courses" : "/dashboard/teacher/courses";
    const params = searchParams ? await searchParams : {};
    const activeTab =
        isAdmin && params?.tab === "subscriptions" ? "subscriptions" : "courses";

    const courses =
        activeTab === "courses"
            ? await db.course.findMany({
                  where: isAdmin ? {} : { userId },
                  include: {
                      user: {
                          select: {
                              fullName: true,
                              image: true,
                          },
                      },
                      chapters: {
                          select: {
                              id: true,
                              isPublished: true,
                          }
                      },
                      quizzes: {
                          select: {
                              id: true,
                              isPublished: true,
                          }
                      },
                  },
                  orderBy: {
                      createdAt: "desc",
                  },
              }).then(courses => courses.map(course => ({
                  ...course,
                  price: course.price || 0,
                  teacherName: course.user?.fullName || "غير محدد",
                  teacherImage: course.teacherImageUrl || course.user?.image || null,
                  subject: course.subject || null,
                  publishedChaptersCount: course.chapters.filter(ch => ch.isPublished).length,
                  publishedQuizzesCount: course.quizzes.filter(q => q.isPublished).length,
              })))
            : [];

    const plans =
        activeTab === "subscriptions"
            ? await db.$queryRaw<
                  Array<{
                      id: string;
                      title: string;
                      description: string | null;
                      price: number;
                      chaptersPerCourse: number;
                      targetSubject: string;
                      features: string[];
                      isActive: boolean;
                      sortOrder: number;
                      createdAt: Date;
                      updatedAt: Date;
                  }>
              >(Prisma.sql`
                SELECT
                  id,
                  title,
                  description,
                  price,
                  "chaptersPerCourse" AS "chaptersPerCourse",
                  "targetSubject" AS "targetSubject",
                  features,
                  "isActive" AS "isActive",
                  "sortOrder" AS "sortOrder",
                  "createdAt" AS "createdAt",
                  "updatedAt" AS "updatedAt"
                FROM "SubscriptionPlan"
                ORDER BY "sortOrder" ASC, "createdAt" DESC
              `)
            : [];

    const subjectOptions = [
        { value: "ALL_SUBJECTS", label: "كل المواد" },
        ...SUBJECT_OPTIONS.map((subject) => ({
            value: subject.value,
            label: SUBJECT_LABEL_BY_VALUE[subject.value] ?? subject.label,
        })),
    ];

    const unpublishedCourses = courses.filter(course => !course.isPublished);
    const hasUnpublishedCourses = activeTab === "courses" && unpublishedCourses.length > 0;

    return (
        <div className="p-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{isAdmin ? "إدارة الكورسات والاشتراكات" : "كورساتي"}</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                        {isAdmin && activeTab === "subscriptions"
                            ? "إدارة خطط الاشتراك من نفس صفحة الكورسات."
                            : isAdmin
                            ? "عرض وإدارة كل الكورسات المنشأة في المنصة، مع بيانات صاحب الكورس والمادة لكل كورس."
                            : "أنشئ كورسًا جديدًا ثم أدِر كل شيء من صفحة واحدة: التفاصيل، الدروس، الاختبارات، نتائج الطلاب، والمسجّلين. استخدم زر «تعديل الكورس» بجانب أي كورس."}
                    </p>
                </div>

                {isAdmin && (
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                        <Link href={courseBasePath}>
                            <Button
                                variant={activeTab === "courses" ? "default" : "outline"}
                                className="h-12 w-full text-base sm:h-10 sm:w-auto sm:text-sm"
                            >
                                الكورسات
                            </Button>
                        </Link>
                        <Link href={`${courseBasePath}?tab=subscriptions`}>
                            <Button
                                variant={activeTab === "subscriptions" ? "default" : "outline"}
                                className="h-12 w-full text-base sm:h-10 sm:w-auto sm:text-sm"
                            >
                                الاشتراكات
                            </Button>
                        </Link>
                    </div>
                )}

                {activeTab === "courses" && (
                    <div className="flex justify-start sm:justify-end">
                        <Link href={`${courseBasePath}/create`} className="shrink-0">
                            <Button className="h-12 w-full bg-brand text-base text-white hover:bg-brand/90 sm:h-10 sm:w-auto sm:text-sm">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                إنشاء كورس جديد
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {hasUnpublishedCourses && (
                <Alert className="mt-6 border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <div className="mb-2">
                            <strong>لنشر الكورسات على الصفحة الرئيسية، تحتاج إلى:</strong>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>إضافة عنوان للكورس</li>
                            <li>إضافة وصف للكورس</li>
                            <li>إضافة صورة للكورس</li>
                            <li>إضافة درس واحد على الأقل ونشره</li>
                            <li>النقر على زر "نشر" في صفحة إعدادات الكورس</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            <div className="mt-6">
                {activeTab === "subscriptions" ? (
                    <SubscriptionPlansAdminClient
                        initialPlans={plans.map((plan) => ({
                            ...plan,
                            createdAt: plan.createdAt.toISOString(),
                        }))}
                        subjectOptions={subjectOptions}
                    />
                ) : (
                    <CoursesTable columns={columns} data={courses} courseBasePath={courseBasePath} />
                )}
            </div>
        </div>
    );
};

export default CoursesPage;
