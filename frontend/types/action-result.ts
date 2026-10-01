/**
 * Standardized response contract for all Server Actions in StudySync.
 * Ensures consistent error handling, type safety, and UI feedback across the app.
 */
export type ActionResult<T = void> =
  | {
      success: true;
      data: T;
      error?: never;
      fieldErrors?: never;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
      data?: never;
    };
