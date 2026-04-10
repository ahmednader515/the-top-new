import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";

import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeStudentClassification } from "@/lib/academics";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (currentUser.role !== "STUDENT" && currentUser.role !== "USER") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const {
      fullName,
      phoneNumber,
      parentPhoneNumber,
      grade,
      division,
      curriculum,
      secondLanguage,
      password,
      confirmPassword,
    } = await req.json();

    if (!fullName || !phoneNumber || !parentPhoneNumber || !grade || !division || !secondLanguage) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    if (phoneNumber === parentPhoneNumber) {
      return new NextResponse("Phone number cannot be the same as parent phone number", { status: 400 });
    }

    const normalized = normalizeStudentClassification(grade, division, curriculum);
    if (!normalized) {
      return new NextResponse("Invalid academic classification", { status: 400 });
    }

    const duplicatedPhone = await db.user.findFirst({
      where: {
        phoneNumber,
        id: { not: currentUser.id },
      },
      select: { id: true },
    });
    if (duplicatedPhone) {
      return new NextResponse("Phone number already exists", { status: 400 });
    }

    const duplicatedParentPhone = await db.user.findFirst({
      where: {
        parentPhoneNumber,
        id: { not: currentUser.id },
      },
      select: { id: true },
    });
    if (duplicatedParentPhone) {
      return new NextResponse("Parent phone number already exists", { status: 400 });
    }

    let hashedPassword: string | undefined;
    if (password || confirmPassword) {
      if (!password || !confirmPassword) {
        return new NextResponse("Both password fields are required", { status: 400 });
      }
      if (password !== confirmPassword) {
        return new NextResponse("Passwords do not match", { status: 400 });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await db.user.update({
      where: { id: currentUser.id },
      data: {
        fullName,
        phoneNumber,
        parentPhoneNumber,
        grade,
        division: normalized.division,
        curriculum: normalized.curriculum,
        secondLanguage,
        ...(hashedPassword ? { hashedPassword } : {}),
      },
      select: {
        id: true,
        fullName: true,
        phoneNumber: true,
        parentPhoneNumber: true,
        grade: true,
        division: true,
        curriculum: true,
        secondLanguage: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("[USER_PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
