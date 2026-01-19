'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab } from './overview-tab';
import { PortfolioTab } from './portfolio-tab';
import { AnalyticsTab } from './analytics-tab';
import { SettingsTab } from './settings-tab';

export function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    if (['overview', 'portfolio', 'analytics', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.push(`/dashboard?tab=${value}`);
  };

  const handleAddToPortfolio = (ticker: string) => {
    handleTabChange('portfolio');
  };

  const handleSelectTicker = (ticker: string) => {
    handleTabChange('overview');
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="container max-w-7xl mx-auto py-6 md:py-8 px-4 md:px-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsContent value="overview" className="mt-0 border-none p-0 outline-none">
            <OverviewTab onAddToPortfolio={handleAddToPortfolio} />
          </TabsContent>

          <TabsContent value="portfolio" className="mt-0 border-none p-0 outline-none">
            <PortfolioTab onSelectTicker={handleSelectTicker} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0 border-none p-0 outline-none">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="settings" className="mt-0 border-none p-0 outline-none">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>


    </main>
  );
}
