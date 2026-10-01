"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  Sparkles,
  LogOut,
  Loader2,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { UserAvatar } from "@/components/auth/user/user-avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth-client";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
}

export function AppSidebar({ user, className, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const [isLoading, setIsLoading] = React.useState(false);

  const isDashboardActive = pathname === "/dashboard";
  const isCoursesActive = pathname.startsWith("/courses") || pathname === "/dashboard#courses";
  const isSettingsActive = pathname.startsWith("/settings");

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      window.location.href = "/auth/sign-in";
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoading(false);
    }
  };

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className={className} {...props}>
      {/* Fixed Sticky Header matching main section h-16 continuous line */}
      <SidebarHeader className="h-16 shrink-0 border-b border-sidebar-border px-4 flex flex-col justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="gap-2.5 hover:bg-transparent active:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
            >
              <Link href="/dashboard" onClick={handleNavClick} className="flex items-center gap-2.5">
                <Logo size={32} />
                <span className="truncate font-bold text-base tracking-tight text-foreground group-data-[collapsible=icon]:hidden">
                  StudySync
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Independently Scrollable Navigation Content */}
      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel>Study Workspace</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isDashboardActive}
                tooltip="Dashboard"
              >
                <Link href="/dashboard" onClick={handleNavClick}>
                  <LayoutDashboard className="size-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCoursesActive && !isDashboardActive}
                tooltip="Courses"
              >
                <Link href="/dashboard#courses" onClick={handleNavClick}>
                  <BookOpen className="size-4" />
                  <span>Courses</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Preferences</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isSettingsActive}
                tooltip="Settings"
              >
                <Link href="/settings/account" onClick={handleNavClick}>
                  <Settings className="size-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Fixed Sticky Footer */}
      <SidebarFooter className="shrink-0 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 p-1.5 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
              <UserAvatar className="size-8 shrink-0" />
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-foreground text-xs sm:text-sm">
                  {user.name || user.email.split("@")[0]}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <SidebarMenuButton
                size="default"
                variant="outline"
                className="size-8 shrink-0 group-data-[collapsible=icon]:hidden hover:text-destructive cursor-pointer ml-auto"
                onClick={handleLogout}
                disabled={isLoading}
                tooltip="Sign out"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogOut className="size-4" />
                )}
                <span className="sr-only">Sign out</span>
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
