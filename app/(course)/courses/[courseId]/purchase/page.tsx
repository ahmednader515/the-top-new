"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Wallet, AlertCircle, Ticket, Check } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Course {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: number | null;
}

export default function PurchasePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const router = useRouter();
  const { courseId } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [code, setCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [codeRedeemed, setCodeRedeemed] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchUserBalance();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      } else {
        toast.error("حدث خطأ أثناء تحميل الكورس");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("حدث خطأ أثناء تحميل الكورس");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const response = await fetch("/api/user/balance");
      if (response.ok) {
        const data = await response.json();
        setUserBalance(data.balance);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleRedeemCode = async () => {
    if (!code.trim()) {
      toast.error("يرجى إدخال الكود");
      return;
    }

    setIsRedeeming(true);
    try {
      const response = await fetch("/api/codes/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("تم استبدال الكود بنجاح! تم شراء الكورس");
        setCodeRedeemed(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        const error = await response.text();
        if (error.includes("already been used")) {
          toast.error("هذا الكود مستخدم بالفعل");
        } else if (error.includes("already purchased")) {
          toast.error("لقد قمت بشراء هذه الكورس مسبقاً");
        } else if (error.includes("Invalid code")) {
          toast.error("كود غير صحيح");
        } else {
          toast.error(error || "حدث خطأ أثناء استبدال الكود");
        }
      }
    } catch (error) {
      console.error("Error redeeming code:", error);
      toast.error("حدث خطأ أثناء استبدال الكود");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handlePurchase = async () => {
    if (!course) return;

    setIsPurchasing(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/purchase`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("تم شراء الكورس بنجاح!");
        router.push("/dashboard");
      } else {
        const error = await response.text();
        if (error.includes("Insufficient balance")) {
          toast.error("رصيد غير كافي. يرجى إضافة رصيد إلى حسابك");
        } else if (error.includes("already purchased")) {
          toast.error("لقد قمت بشراء هذه الكورس مسبقاً");
        } else {
          toast.error(error || "حدث خطأ أثناء الشراء");
        }
      }
    } catch (error) {
      console.error("Error purchasing course:", error);
      toast.error("حدث خطأ أثناء الشراء");
    } finally {
      setIsPurchasing(false);
    }
  };

  const hasSufficientBalance = course && userBalance >= (course.price || 0);
  const paymentGatewayHref = `/dashboard/subscriptions/payment?courseId=${encodeURIComponent(courseId)}&next=${encodeURIComponent(`/courses/${courseId}`)}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">الكورس غير موجودة</h1>
          <Button asChild>
            <Link href="/dashboard">العودة إلى لوحة التحكم</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              رجوع
            </Button>
            <h1 className="text-2xl font-bold">شراء الكورس</h1>
          </div>

          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>
                {course.description || "لا يوجد وصف للكورس"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {course.imageUrl && (
                <div className="mb-4">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="text-2xl font-bold text-brand">
                {course.price?.toFixed(2) || "0.00"} جنيه
              </div>
            </CardContent>
          </Card>

          {/* Balance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                رصيد الحساب
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xl font-bold">
                    {userBalance.toFixed(2)} جنيه
                  </div>
                  {!hasSufficientBalance && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>رصيد غير كافي لشراء هذه الكورس</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Code Redemption */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                لديك كود خصم؟
              </CardTitle>
              <CardDescription>
                أدخل الكود للحصول على الكورس مجاناً
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="code" className="sr-only">
                    كود الخصم
                  </Label>
                  <Input
                    id="code"
                    placeholder="أدخل الكود هنا"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    disabled={isRedeeming || codeRedeemed}
                    className="text-center font-mono"
                  />
                </div>
                <Button
                  onClick={handleRedeemCode}
                  disabled={isRedeeming || !code.trim() || codeRedeemed}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isRedeeming ? (
                    "جاري الاستبدال..."
                  ) : codeRedeemed ? (
                    <>
                      <Check className="h-4 w-4 ml-2" />
                      تم الاستبدال
                    </>
                  ) : (
                    "استبدال الكود"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">أو</span>
            </div>
          </div>

          {/* Purchase Actions */}
          <div className="space-y-4">
            {!hasSufficientBalance && !codeRedeemed && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-amber-700 mb-4">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">رصيد غير كافٍ للشراء من الرصيد</span>
                  </div>
                  <p className="text-amber-700 mb-4">
                    يمكنك شحن الرصيد من صفحة الرصيد، أو الدفع مباشرة بالبطاقة بنفس سعر الكورس (
                    {(course.price || 0).toFixed(2)} جنيه).
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild variant="outline" className="border-amber-300 bg-white">
                      <Link href="/dashboard/balance">شحن الرصيد</Link>
                    </Button>
                    <Button asChild className="bg-brand hover:bg-brand/90">
                      <Link href={paymentGatewayHref}>ادفع بالبطاقة (نفس السعر)</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                onClick={handlePurchase}
                disabled={isPurchasing || !hasSufficientBalance || codeRedeemed}
                className="w-full bg-brand hover:bg-brand/90 text-white"
                size="lg"
              >
                {isPurchasing ? (
                  "جاري الشراء..."
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Wallet className="h-5 w-5" />
                    شراء من الرصيد
                  </div>
                )}
              </Button>
              {codeRedeemed ? (
                <Button variant="outline" size="lg" className="w-full border-slate-300" disabled>
                  <CreditCard className="h-5 w-5 ml-2" />
                  ادفع بالبطاقة
                </Button>
              ) : (
                <Button asChild variant="outline" size="lg" className="w-full border-slate-300">
                  <Link href={paymentGatewayHref}>
                    <CreditCard className="h-5 w-5 ml-2" />
                    ادفع بالبطاقة
                  </Link>
                </Button>
              )}
            </div>

            {!codeRedeemed && (
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  سعر الكورس: {course.price?.toFixed(2) || "0.00"} جنيه — يُخصم من الرصيد أو يُدفع عبر
                  البوابة مباشرة.
                </p>
                <p className="mt-1">بعد إتمام الدفع ستصلك صلاحية الكورس فوراً.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 