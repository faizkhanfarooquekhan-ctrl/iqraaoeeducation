export const STUDENT_ID = "iqraaoe@123";
export const STUDENT_PASSWORD = "9665700883";
export const ADMIN_ID = "admin@iqra";
export const ADMIN_PASSWORD = "adminboss123";

export function verifyStudent(id: string, password: string) {
  return id.trim() === STUDENT_ID && password === STUDENT_PASSWORD;
}

export function verifyAdmin(id: string, password: string) {
  return id.trim() === ADMIN_ID && password === ADMIN_PASSWORD;
}

export function safeNext(raw: string | null | undefined, fallback: string) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return fallback;
  }
  return raw;
}
