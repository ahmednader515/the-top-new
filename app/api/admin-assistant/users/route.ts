import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN_ASSISTANT") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const scope = req.nextUrl.searchParams.get("scope");
        if (scope === "progress" || scope === "management") {
            const activePurchaseWhere = {
                status: "ACTIVE" as const,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            };

            const users = await db.user.findMany({
                select: {
                    id: true,
                    fullName: true,
                    phoneNumber: true,
                    parentPhoneNumber: true,
                    role: true,
                    balance: true,
                    createdAt: true,
                    updatedAt: true,
                    purchases: {
                        where: {
                            ...activePurchaseWhere,
                            course: {
                                userId: session.user.id,
                            },
                        },
                        select: {
                            id: true,
                            courseId: true,
                        },
                    },
                    userProgress: {
                        where: {
                            chapter: {
                                course: {
                                    userId: session.user.id,
                                },
                            },
                        },
                        select: {
                            id: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc"
                }
            });

            const teacherStudents = users
                .filter((user) => user.role === "STUDENT" && user.purchases.length > 0)
                .map((user) => ({
                    id: user.id,
                    fullName: user.fullName,
                    phoneNumber: user.phoneNumber,
                    parentPhoneNumber: user.parentPhoneNumber,
                    role: user.role,
                    balance: user.balance,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    _count: {
                        purchases: user.purchases.length,
                        userProgress: user.userProgress.length,
                    },
                }));

            return NextResponse.json(teacherStudents);
        }

        const users = await db.user.findMany({
            select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                parentPhoneNumber: true,
                role: true,
                balance: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        courses: true,
                        purchases: true,
                        userProgress: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("[ADMIN_USERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 