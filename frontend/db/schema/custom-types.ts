import { customType } from "drizzle-orm/pg-core";

// ==========================================
// Custom 768-Dimension Vector for gemini-embedding-2
// ==========================================
export const vector768 = customType<{ data: number[] }>({
  dataType() {
    return "vector(768)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: unknown): number[] {
    if (typeof value === "string") {
      return value
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map(Number);
    }
    return value as number[];
  },
});
