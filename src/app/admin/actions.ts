"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
  createChapter,
  createLesson,
  createTopic,
  deleteChapter,
  deleteLesson,
  deleteTopic,
  executeImport,
  moveItem,
  ServiceError,
  updateChapter,
  updateLesson,
  updateTopic,
} from "@/lib/admin/content-service";
import { buildImportPlan, type ImportPlan } from "@/lib/admin/import-plan";
import { parseChapterForm, parseLessonForm, parseTopicForm, type FieldErrors } from "@/lib/admin/validation";
import { checkPassword, endAdminSession, isAdminConfigured, requireAdmin, startAdminSession } from "@/lib/auth/admin";
import { CATALOG_TAG } from "@/lib/content/catalog";
import type { ContentTable } from "@/lib/content/types";
import { getAdminRepository, RepositoryError } from "@/lib/data";
import { mnAdmin } from "@/lib/i18n/mn-admin";

const E = mnAdmin.errors;

export type FormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
};

function toFormState(error: unknown): FormState {
  if (error instanceof ServiceError) return { status: "error", message: error.message, fieldErrors: error.fieldErrors };
  if (error instanceof RepositoryError && error.code === "not_configured") return { status: "error", message: E.notConfigured };
  console.error(error);
  return { status: "error", message: E.generic };
}

/** Нийтийн хуудсуудын кэшийг шинэчилнэ. */
function refreshPublicContent() {
  updateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// Нэвтрэх
// ---------------------------------------------------------------------------

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  if (!isAdminConfigured()) return { status: "error", message: mnAdmin.login.notConfigured };
  const password = form.get("password");
  if (typeof password !== "string" || !(await checkPassword(password))) {
    // Нууц үг таах оролдлогыг удаашруулна.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { status: "error", fieldErrors: { password: mnAdmin.login.wrongPassword } };
  }
  await startAdminSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Сэдэв, бүлэг, хичээл хадгалах
// ---------------------------------------------------------------------------

export async function saveTopicAction(id: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseTopicForm(form);
  if (!parsed.ok) return { status: "error", message: E.fixErrors, fieldErrors: parsed.errors };
  try {
    const repo = getAdminRepository();
    if (id) await updateTopic(repo, id, parsed.value);
    else await createTopic(repo, parsed.value);
  } catch (error) {
    return toFormState(error);
  }
  refreshPublicContent();
  redirect(`/admin?flash=${id ? "saved" : "created"}`);
}

export async function saveChapterAction(id: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseChapterForm(form);
  if (!parsed.ok) return { status: "error", message: E.fixErrors, fieldErrors: parsed.errors };
  try {
    const repo = getAdminRepository();
    if (id) await updateChapter(repo, id, parsed.value);
    else await createChapter(repo, parsed.value);
  } catch (error) {
    return toFormState(error);
  }
  refreshPublicContent();
  redirect(`/admin?flash=${id ? "saved" : "created"}#topic-${parsed.value.topic_id}`);
}

export async function saveLessonAction(id: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseLessonForm(form);
  if (!parsed.ok) return { status: "error", message: E.fixErrors, fieldErrors: parsed.errors };
  try {
    const repo = getAdminRepository();
    if (id) await updateLesson(repo, id, parsed.value);
    else await createLesson(repo, parsed.value);
  } catch (error) {
    return toFormState(error);
  }
  refreshPublicContent();
  redirect(`/admin?flash=${id ? "saved" : "created"}#chapter-${parsed.value.chapter_id}`);
}

// ---------------------------------------------------------------------------
// Устгах, дараалал өөрчлөх
// ---------------------------------------------------------------------------

const TABLES: readonly ContentTable[] = ["topics", "chapters", "lessons"];

function tableFrom(value: FormDataEntryValue | null): ContentTable | null {
  return TABLES.find((t) => t === value) ?? null;
}

export async function deleteAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const table = tableFrom(form.get("table"));
  const id = form.get("id");
  if (!table || typeof id !== "string") return { status: "error", message: E.notFound };
  try {
    const repo = getAdminRepository();
    if (table === "topics") await deleteTopic(repo, id);
    else if (table === "chapters") await deleteChapter(repo, id);
    else await deleteLesson(repo, id);
  } catch (error) {
    return toFormState(error);
  }
  refreshPublicContent();
  redirect("/admin?flash=deleted");
}

export async function moveAction(form: FormData): Promise<void> {
  await requireAdmin();
  const table = tableFrom(form.get("table"));
  const id = form.get("id");
  const direction = form.get("direction") === "up" ? -1 : 1;
  if (!table || typeof id !== "string") return;
  try {
    await moveItem(getAdminRepository(), table, id, direction);
  } catch (error) {
    console.error(error);
    redirect("/admin?flash=error");
  }
  refreshPublicContent();
  redirect(`/admin#${table.slice(0, -1)}-${id}`);
}

// ---------------------------------------------------------------------------
// CSV импорт
// ---------------------------------------------------------------------------

export type ImportState = {
  status: "idle" | "preview" | "done" | "error";
  message?: string;
  plan?: ImportPlan;
  /** Шалгасан агуулгыг "Оруулах" алхамд дахин илгээхэд хадгална */
  csv?: string;
  result?: { lessons: number; topics: number; chapters: number; skipped: number };
};

const MAX_CSV_BYTES = 2 * 1024 * 1024;

async function readCsv(form: FormData): Promise<string | { error: string }> {
  const file = form.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_CSV_BYTES) return { error: mnAdmin.import.tooLarge };
    return file.text();
  }
  const pasted = form.get("csv");
  if (typeof pasted === "string" && pasted.trim()) {
    if (new TextEncoder().encode(pasted).length > MAX_CSV_BYTES) return { error: mnAdmin.import.tooLarge };
    return pasted;
  }
  return { error: mnAdmin.import.empty };
}

export async function importAction(_prev: ImportState, form: FormData): Promise<ImportState> {
  await requireAdmin();
  const csv = await readCsv(form);
  if (typeof csv !== "string") return { status: "error", message: csv.error };

  try {
    const repo = getAdminRepository();
    // Оруулахын өмнө үргэлж дахин шалгана (энэ хооронд агуулга өөрчлөгдсөн байж болно).
    const plan = buildImportPlan(csv, await repo.loadAll({ includeUnpublished: true }));
    if (plan.fileError) return { status: "error", message: plan.fileError };
    if (form.get("mode") !== "commit" || !plan.canCommit) return { status: "preview", plan, csv };

    const result = await executeImport(repo, plan);
    refreshPublicContent();
    return { status: "done", result };
  } catch (error) {
    const state = toFormState(error);
    return { status: "error", message: state.message };
  }
}
