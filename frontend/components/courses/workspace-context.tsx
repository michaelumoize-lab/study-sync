"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface WorkspaceContextType {
  courseTitle: string | null;
  setCourseTitle: (title: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  courseTitle: null,
  setCourseTitle: () => {},
});

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [courseTitle, setCourseTitle] = useState<string | null>(null);

  return (
    <WorkspaceContext.Provider value={{ courseTitle, setCourseTitle }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

export function WorkspaceTitleSync({ title }: { title: string }) {
  const { setCourseTitle } = useWorkspace();

  useEffect(() => {
    setCourseTitle(title);
    return () => setCourseTitle(null);
  }, [title, setCourseTitle]);

  return null;
}
