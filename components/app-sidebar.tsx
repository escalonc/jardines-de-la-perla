"use client";

import * as React from "react";
import { ShieldUser, House, Users, Squircle, LucideProps } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();

  const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const userName = user?.fullName ?? "";
  const userImage = user?.imageUrl ?? "";

  const data: {
    user: {
      name: string;
      email: string;
      avatar: string;
    };
    navMain: {
      name: string;
      url: string;
      icon: React.ComponentType<LucideProps>;
      role: Roles;
    }[];
  } = {
    user: {
      name: userName,
      email: userEmail,
      avatar: userImage,
    },
    navMain: [
      {
        name: "Residentes",
        url: "#",
        icon: House,
        role: "admin",
      },
      {
        name: "Visitas",
        url: "/dashboard/visits",
        icon: Users,
        role: "resident",
      },
      {
        name: "Seguridad",
        url: "#",
        icon: ShieldUser,
        role: "watchman",
      },
    ],
  };

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Squircle className="size-6" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    Jardines de La Perla
                  </span>
                  <span className="truncate text-xs">v0.0.1</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
