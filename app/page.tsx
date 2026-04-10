"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, BookOpen, Award, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { ScrollProgress } from "@/components/scroll-progress";
import { useEffect, useState } from "react";
import { db } from "@/lib/db"; // Import db client
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Define types based on Prisma schema
type Course = {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Purchase = {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

type CourseWithProgress = Course & {
  chapters: { id: string }[];
  quizzes: { id: string }[];
  purchases: Purchase[];
  progress: number;
};

export default function HomePage() {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        // Fetch courses from public API endpoint
        const response = await fetch("/api/courses/public");
        
        if (!response.ok) {
          console.error("Failed to fetch courses:", response.status, response.statusText);
          return;
        }
        
        const data = await response.json();
        console.log("Fetched courses:", data); // Debug log
        setCourses(data);

      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="h-full w-full bg-background">
      <Navbar />
      <ScrollProgress />
      {/* Hero Section */}
      <section id="hero-section" className="relative min-h-screen flex flex-col items-center overflow-hidden pt-20 md:pt-0">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between py-4 md:py-12 lg:py-20 w-full h-full min-h-[calc(100vh-5rem)] gap-0">
          {/* Text Section - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-0 md:mb-12 lg:mb-16 mt-20 md:mt-12 lg:mt-20"
          >
            <h1 className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-bold mb-3 md:mb-6 lg:mb-8">
              <span className="text-brand">اكاديمية القمة</span>
            </h1>
            <p className="text-base sm:text-lg md:text-3xl lg:text-4xl font-bold text-muted-foreground mb-4 md:mb-12 lg:mb-16">
              #طريقك_الي_النجاح
            </p>
            <div className="flex flex-col items-center gap-2 md:gap-6 lg:gap-8 w-full mb-0 pb-0 -mb-2 md:mb-0">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 md:gap-4 w-full sm:w-auto">
                <Button asChild className="bg-brand hover:bg-brand/90 text-white text-sm md:text-xl px-3 md:px-8 py-2 md:py-4 h-auto w-[75vw] sm:w-48 md:w-64">
                  <Link href="/sign-up">
                    انشاء الحساب
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-brand text-brand hover:bg-brand/10 text-sm md:text-xl px-3 md:px-8 py-2 md:py-4 h-auto w-[75vw] sm:w-48 md:w-64">
                  <Link href="/sign-in">
                    تسجيل الدخول
                  </Link>
                </Button>
              </div>
              <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white text-base md:text-xl px-4 md:px-8 py-3 md:py-4 h-auto w-[95vw] sm:w-64 md:w-80 lg:w-96 mb-0">
                <Link href="https://download2289.mediafire.com/4xwbxvmhylrgFW2Ky-0fWn9Y_pvhyuyHs5Cmzo-qxe4bu14nYJaFOboeKfEw1ASwzMFfpW747ntWo5d0YilZSJlpasc2GOggdbKcapIEa5C2SEinMsHcL2GEDSU0lOgSff3BAJv_W2yGAYgSdQP_bbmws4lfNLcDA3IdM_wAiLTukA/tmmzb8imjktk1v3/theTop.apk" target="_blank" rel="noopener noreferrer">
                  <Download className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  حمل التطبيق
                </Link>
              </Button>
            </div>
          </motion.div>
          
          {/* Mobile Image */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative -top-20 md:top-0 md:mt-auto mb-0 pt-0 pb-0 flex justify-center w-full md:px-2 overflow-visible md:overflow-hidden"
          >
            <div className="relative w-[220vw] sm:w-full max-w-[220vw] sm:max-w-xs md:max-w-lg lg:max-w-2xl xl:max-w-3xl scale-150 sm:scale-100">
              <Image
                src="/the-mobile.png"
                alt="Mobile App"
                width={640}
                height={1280}
                className="object-contain w-full h-auto max-h-[80vh] md:max-h-none"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Curriculum Selection Section */}
      <section id="curriculum-section" className="py-20 bg-muted/50">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">اختر منهجك التعليمي</h2>
            <p className="text-muted-foreground">نقدم لك مناهج تعليمية متخصصة تناسب احتياجاتك</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
          >
            {/* Arabic Curriculum Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-card rounded-2xl overflow-hidden border shadow-lg hover:shadow-xl transition-all"
            >
              <div className="relative h-64 bg-gradient-to-br from-green-600 to-green-800">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <BookOpen className="h-16 w-16 text-white/80" />
                  <h3 className="text-3xl font-bold text-white">المنهج العربي</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-4">المنهج العربي</h4>
                <ul className="space-y-3 mb-6 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>من الصف الرابع الابتدائي إلى المرحلة الثانوية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>مناهج معتمدة من وزارة التعليم</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>مواد دراسية شاملة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>تقييمات دورية ومتابعة مستمرة</span>
                  </li>
                </ul>
                <Button
                  asChild
                  className="w-full bg-brand hover:bg-brand/90 text-white"
                >
                  <Link href="/sign-up?curriculum=عربي">
                    ابدأ مع المنهج العربي
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Languages Curriculum Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-card rounded-2xl overflow-hidden border shadow-lg hover:shadow-xl transition-all"
            >
              <div className="relative h-64 bg-gradient-to-br from-red-600 to-red-800">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <BookOpen className="h-16 w-16 text-white/80" />
                  <h3 className="text-3xl font-bold text-white">منهج اللغات</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-4">منهج اللغات</h4>
                <ul className="space-y-3 mb-6 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>من الصف الرابع الابتدائي إلى المرحلة الثانوية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>مناهج معتمدة من وزارة التعليم</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>مواد دراسية شاملة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>تقييمات دورية ومتابعة مستمرة</span>
                  </li>
                </ul>
                <Button
                  asChild
                  className="w-full bg-brand hover:bg-brand/90 text-white"
                >
                  <Link href="/sign-up?curriculum=لغات">
                    ابدأ مع منهج اللغات
                  </Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">آراء الطلاب</h2>
            <p className="text-muted-foreground">ماذا يقول طلابنا عن تجربتهم معنا</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "عصام اسامة",
                grade: "الصف الأول الثانوي",
                testimonial: "تجربة رائعة مع الاكاديمية، شرح مميز وطريقة سهلة في توصيل المعلومة"
              },
              {
                name: "سيف طارق",
                grade: "الصف الثاني الثانوي",
                testimonial: "المنهج منظم جداً والشرح واضح، ساعدني في فهم المواد بشكل أفضل"
              },
              {
                name: "عمر جمال",
                grade: "الصف الأول الثانوي",
                testimonial: "أفضل منصة تعليمية استخدمتها، المحتوى غني والشرح مبسط"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-lg p-6 shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden">
                    <Image
                      src="/male.png"
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="mr-4">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.grade}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  &ldquo;{testimonial.testimonial}&rdquo;
                </p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">مميزات المنصة</h2>
            <p className="text-muted-foreground">اكتشف ما يجعل منصتنا مميزة</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold mb-2">جودة عالية</h3>
              <p className="text-muted-foreground">أفضل اكاديمية متخصصة</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold mb-2">مجتمع نشط</h3>
              <p className="text-muted-foreground">انضم إلى مجتمع من الطلاب النشطين والمتفوقين والأوائل</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-xl font-semibold mb-2">شهادات تقدير</h3>
              <p className="text-muted-foreground">احصل على شهادات تقدير عند إكمال الكورسات</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">ابدأ رحلة التعلم معنا</h2>
            <p className="text-muted-foreground mb-8">
              انضم إلينا اليوم وابدأ رحلة النجاح
            </p>
            <Button size="lg" asChild className="bg-brand hover:bg-brand/90 text-white">
              <Link href="/sign-up">
                سجل الآن <ArrowRight className="mr-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 