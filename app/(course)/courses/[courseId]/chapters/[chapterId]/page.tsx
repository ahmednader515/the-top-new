"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  FileText,
  Download,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PlyrVideoPlayer } from "@/components/plyr-video-player";

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  isFree: boolean;
  videoUrl: string | null;
  videoType: "UPLOAD" | "YOUTUBE" | null;
  youtubeVideoId: string | null;
  documentUrl: string | null;
  documentName: string | null;
  nextChapterId?: string;
  previousChapterId?: string;
  nextContentType?: 'chapter' | 'quiz' | null;
  previousContentType?: 'chapter' | 'quiz' | null;
  attachments?: {
    id: string;
    name: string;
    url: string;
    position: number;
    createdAt: Date;
  }[];
  userProgress?: {
    isCompleted: boolean;
  }[];
}

const ChapterPage = () => {
  const router = useRouter();
  const routeParams = useParams() as { courseId: string; chapterId: string };
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  console.log("🔍 ChapterPage render:", {
    chapterId: routeParams.chapterId,
    courseId: routeParams.courseId,
    hasChapter: !!chapter,
    chapterVideoUrl: chapter?.videoUrl,
    chapterVideoType: chapter?.videoType,
    loading,
    hasAccess
  });

  // Helper function to extract filename from URL
  const getFilenameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      
      if (filename) {
        // Decode URL encoding and handle special characters
        const decodedFilename = decodeURIComponent(filename);
        // Remove query parameters if any
        const cleanFilename = decodedFilename.split('?')[0];
        return cleanFilename || 'chapter-document';
      }
      return 'chapter-document';
    } catch {
      return 'chapter-document';
    }
  };

  // Helper function to download document
  const downloadDocument = async (url: string) => {
    try {
      const relative = `/api/courses/${routeParams.courseId}/chapters/${routeParams.chapterId}/document/download`;
      const absoluteUrl = typeof window !== 'undefined' ? new URL(relative, window.location.origin).toString() : relative;
      // Navigate directly to the download URL (more reliable for Android WebViews)
      window.location.href = absoluteUrl;
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open original URL
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Helper function to download attachment
  const downloadAttachment = async (url: string, name: string) => {
    try {
      // For uploadthing URLs, we'll use a different approach
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = name || getFilenameFromUrl(url);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(downloadUrl);
        toast.success("تم بدء تحميل الملف");
      } else {
        throw new Error('Failed to fetch file');
      }
    } catch (error) {
      console.error('Download failed:', error);
      
      // If CORS fails or any other error, use the browser's native download behavior
      const link = document.createElement('a');
      link.href = url;
      link.download = name || getFilenameFromUrl(url);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Try to trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("تم فتح الملف في تبويب جديد للتحميل");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("🔍 ChapterPage fetchData started");
      try {
        setIsLocked(false);

        let chapterResponse;
        try {
          chapterResponse = await axios.get(
            `/api/courses/${routeParams.courseId}/chapters/${routeParams.chapterId}`
          );
        } catch (error) {
          const axiosError = error as AxiosError;
          const status = axiosError.response?.status;

          // Locked chapter for a student who hasn't purchased the course
          if (status === 403) {
            setIsLocked(true);
            setChapter(null);
            setHasAccess(false);
            return;
          }

          throw error;
        }

        const [progressResponse, accessResponse] = await Promise.all([
          axios.get(`/api/courses/${routeParams.courseId}/progress`),
          axios.get(`/api/courses/${routeParams.courseId}/access`),
        ]);

        console.log("🔍 ChapterPage data fetched:", {
          chapterData: chapterResponse.data,
          progressData: progressResponse.data,
          accessData: accessResponse.data,
        });

        setChapter(chapterResponse.data);
        setIsCompleted(chapterResponse.data.userProgress?.[0]?.isCompleted || false);
        setCourseProgress(progressResponse.data.progress);
        setHasAccess(accessResponse.data.hasAccess);
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error("🔍 Error fetching data:", axiosError);
        if (axiosError.response) {
          console.error("🔍 Error response:", axiosError.response.data);
          toast.error(`فشل تحميل الدرس: ${axiosError.response.data}`);
        } else if (axiosError.request) {
          console.error("🔍 Error request:", axiosError.request);
          toast.error("فشل الاتصال بالخادم");
        } else {
          console.error("🔍 Error message:", axiosError.message);
          toast.error("حدث خطأ غير معروف");
        }
      } finally {
        console.log("🔍 ChapterPage fetchData completed, setting loading to false");
        setLoading(false);
      }
    };

    fetchData();
  }, [routeParams.courseId, routeParams.chapterId]);

  const onEnd = async () => {
    try {
      if (!isCompleted) {
        await axios.put(`/api/courses/${routeParams.courseId}/chapters/${routeParams.chapterId}/progress`);
        setIsCompleted(true);
        router.refresh();
      }
    } catch (error) {
      console.error("Error marking chapter as completed:", error);
      toast.error("فشل تحديث التقدم");
    }
  };

  const onNext = () => {
    if (chapter?.nextChapterId) {
      if (chapter.nextContentType === 'quiz') {
        router.push(`/courses/${routeParams.courseId}/quizzes/${chapter.nextChapterId}`);
      } else {
        router.push(`/courses/${routeParams.courseId}/chapters/${chapter.nextChapterId}`);
      }
    }
  };

  const onPrevious = () => {
    if (chapter?.previousChapterId) {
      if (chapter.previousContentType === 'quiz') {
        router.push(`/courses/${routeParams.courseId}/quizzes/${chapter.previousChapterId}`);
      } else {
        router.push(`/courses/${routeParams.courseId}/chapters/${chapter.previousChapterId}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">جاري التحميل...</div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" dir="rtl">
        <div className="w-full max-w-md rounded-2xl border bg-background p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-muted">
            <Lock className="h-8 w-8 text-slate-700" />
          </div>
          <h2 className="text-xl font-extrabold">هذا الدرس غير مشمول في خطتك</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            خطتك تتيح عدداً محدداً من الدروس لكل كورس بالترتيب، أو انتهت صلاحية اشتراكك السابق. يمكنك ترقية
            الخطة أو التجديد من صفحة الاشتراكات.
          </p>
          <div className="mt-5 grid gap-2">
            <Button
              type="button"
              onClick={() => router.push(`/dashboard/subscriptions`)}
              className="h-11 text-base font-semibold bg-brand hover:bg-brand/90"
            >
              خطط الاشتراك
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/courses/${routeParams.courseId}`)}
              className="h-11 text-base font-semibold"
            >
              رجوع للكورس
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">لم يتم العثور على الدرس</div>
      </div>
    );
  }

  if (!hasAccess && !chapter.isFree) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-semibold">هذا الدرس مغلق</h2>
          <p className="text-muted-foreground">شراء الكورس للوصول إلى جميع الدروس</p>
          <Button onClick={() => router.push(`/courses/${routeParams.courseId}/purchase`)}>
            شراء الكورس
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20" dir="rtl">
      {/* Mobile header replacement (navbar removed by layout) */}
      <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 md:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-base font-extrabold md:text-2xl">
                {chapter.title}
              </h1>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => router.push(`/courses/${routeParams.courseId}`)}
              aria-label="إغلاق"
              className="h-11 w-11 rounded-xl bg-muted text-slate-700 hover:bg-muted/80"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-4 pb-28 md:px-6 md:py-6">
        <div className="rounded-2xl border bg-background p-3 shadow-sm md:p-5">
          <div className="aspect-video overflow-hidden rounded-xl bg-black">
            {chapter.videoUrl ? (
              <PlyrVideoPlayer
                videoUrl={chapter.videoType === "UPLOAD" ? chapter.videoUrl : undefined}
                youtubeVideoId={chapter.videoType === "YOUTUBE" ? chapter.youtubeVideoId || undefined : undefined}
                videoType={(chapter.videoType as "UPLOAD" | "YOUTUBE") || "UPLOAD"}
                className="h-full w-full"
                onEnded={onEnd}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white">
                لا يوجد فيديو متاح
              </div>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            تحتاج أن تشاهد الفيديو للنهاية للحصول على علامة المشاهدة لهذا الفيديو
          </div>

            {/* Attachments Section */}
            {(chapter.attachments && chapter.attachments.length > 0) && (
              <div className="mt-6 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">مستندات الدرس</h3>
                </div>
                <div className="space-y-2">
                  {chapter.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center p-3 w-full bg-secondary/50 border-secondary/50 border text-secondary-foreground rounded-md">
                      <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                      <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {attachment.name || getFilenameFromUrl(attachment.url)}
                        </p>
                        <p className="text-xs text-muted-foreground">مستند الدرس</p>
                      </div>
                      <div className="mr-auto flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(attachment.url, '_blank')}
                        >
                          عرض
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadAttachment(attachment.url, attachment.name)}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          تحميل
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Legacy Document Section (for backward compatibility) */}
            {chapter.documentUrl && !chapter.attachments?.length && (
              <div className="mt-6 p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">مستند الدرس</h3>
                </div>
                <div className="flex items-center p-3 w-full bg-secondary/50 border-secondary/50 border text-secondary-foreground rounded-md">
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {chapter.documentName || getFilenameFromUrl(chapter.documentUrl || '')}
                    </p>
                    <p className="text-xs text-muted-foreground">مستند الدرس</p>
                  </div>
                  <div className="mr-auto flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(chapter.documentUrl!, '_blank')}
                    >
                      عرض المستند
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDocument(chapter.documentUrl!).catch(console.error)}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      تحميل
                    </Button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Fixed bottom bar (mobile + desktop), with swapped button positions */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <div
          className="mx-auto max-w-6xl px-4 py-3 md:px-6"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-between gap-3">
            {/* Next on the left: in RTL, first flex item is on the right → word then arrow = arrow after word */}
            <Button
              type="button"
              onClick={onNext}
              disabled={!chapter.nextChapterId}
              className="h-12 flex-1 bg-brand text-base font-semibold hover:bg-brand/90 inline-flex flex-row items-center justify-center gap-2"
            >
              <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
              <span>التالي</span>
            </Button>

            {/* Previous on the right: arrow before word → icon first in DOM */}
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={!chapter.previousChapterId}
              className="h-12 flex-1 text-base font-semibold inline-flex flex-row items-center justify-center gap-2"
            >
              <span>السابق</span>
              <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterPage; 