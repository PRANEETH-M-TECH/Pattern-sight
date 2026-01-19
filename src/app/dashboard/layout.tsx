'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { Home, LineChart, Settings, BarChart3, Search } from 'lucide-react';
import { Logo } from '@/components/patternsight/logo';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  const currentTab = searchParams.get('tab') || 'overview';

  const handleNavigation = (tab: string) => {
    router.push(`/dashboard?tab=${tab}`);
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar>
        <SidebarHeader className="p-4">
          <Logo onClick={toggleSidebar} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleNavigation('overview')}
                isActive={currentTab === 'overview'}
                tooltip="Dashboard"
              >
                <Home />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleNavigation('portfolio')}
                isActive={currentTab === 'portfolio'}
                tooltip="Portfolio"
              >
                <BarChart3 />
                <span>Portfolio</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleNavigation('analytics')}
                isActive={currentTab === 'analytics'}
                tooltip="Analytics"
              >
                <LineChart />
                <span>Analytics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => handleNavigation('settings')}
                isActive={currentTab === 'settings'}
                tooltip="Settings"
              >
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center px-4 md:px-6">
            <Logo onClick={toggleSidebar} />
            <div className="ml-auto flex items-center gap-4">
              <div className="hidden md:flex items-center text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                <span className="capitalize">{currentTab}</span>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
