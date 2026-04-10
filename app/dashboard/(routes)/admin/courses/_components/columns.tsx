"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { SUBJECT_LABEL_BY_VALUE } from "@/lib/academics";

export type Course = {
    id: string;
    title: string;
    price: number;
    isPublished: boolean;
    createdAt: Date;
    imageUrl?: string | null;
    teacherName?: string | null;
    teacherImage?: string | null;
    subject?: string | null;
};

export const columns: ColumnDef<Course>[] = [
    {
        id: "teacherImagePrimary",
        header: "صورة المعلم",
        meta: { mobileLabel: "صورة المعلم" },
        enableSorting: false,
        cell: ({ row }) => {
            const url = row.original.teacherImage;
            return (
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted">
                    {url ? (
                        <img
                            src={url}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-muted-foreground">
                            —
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "title",
        meta: { mobileLabel: "العنوان" },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    العنوان
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "teacherName",
        meta: { mobileLabel: "المعلم" },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    المعلم
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => <div>{row.original.teacherName || "غير محدد"}</div>,
    },
    {
        accessorKey: "subject",
        meta: { mobileLabel: "المادة" },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    المادة
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const subjectValue = row.original.subject;
            const label = subjectValue ? SUBJECT_LABEL_BY_VALUE[subjectValue] ?? subjectValue : "غير محدد";
            return <div>{label}</div>;
        },
    },
    {
        accessorKey: "price",
        meta: { mobileLabel: "السعر" },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    السعر
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"));
            return <div>{formatPrice(price)}</div>;
        },
    },
    {
        accessorKey: "isPublished",
        meta: { mobileLabel: "الحالة" },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    الحالة
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const isPublished = row.getValue("isPublished") || false;
            return (
                <Badge variant={isPublished ? "default" : "secondary"}>
                    {isPublished ? "منشور" : "غير منشور"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "createdAt",
        meta: { mobileLabel: "تاريخ الإنشاء" },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    انشئ في
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return <div>{format(date, "dd/MM/yyyy", { locale: ar })}</div>;
        },
    }
]; 