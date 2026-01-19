'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Download, Upload, AlertCircle } from 'lucide-react';
import { exportPortfolioToJSON, exportPortfolioToCSV, importPortfolioFromJSON, getPortfolio } from '@/lib/portfolio';
import { useState } from 'react';

export function SettingsTab() {
  const { toast } = useToast();
  const [portfolio] = useState(() => getPortfolio());

  const handleExportJSON = () => {
    try {
      exportPortfolioToJSON();
      toast({
        title: 'Export Successful',
        description: 'Portfolio exported to JSON file.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: error.message || 'Could not export portfolio.',
      });
    }
  };

  const handleExportCSV = () => {
    try {
      exportPortfolioToCSV();
      toast({
        title: 'Export Successful',
        description: 'Portfolio exported to CSV file.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: error.message || 'Could not export portfolio.',
      });
    }
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        importPortfolioFromJSON(content);
        toast({
          title: 'Import Successful',
          description: 'Portfolio imported successfully.',
        });
        // Reload page to refresh portfolio
        setTimeout(() => window.location.reload(), 1000);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: error.message || 'Could not import portfolio.',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClearCache = () => {
    try {
      // Clear sessionStorage (AI cache)
      sessionStorage.clear();
      // Clear localStorage (portfolio)
      localStorage.removeItem('pattern-sight-portfolio');
      toast({
        title: 'Cache Cleared',
        description: 'All cached data has been cleared.',
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Clear Failed',
        description: error.message || 'Could not clear cache.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-headline">Settings</h2>
        <p className="text-muted-foreground mt-2">
          Manage your portfolio data and application preferences.
        </p>
      </div>

      {/* Portfolio Management */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Management</CardTitle>
          <CardDescription>
            Export or import your portfolio data. Currently tracking {portfolio.length} stock{portfolio.length !== 1 ? 's' : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleExportJSON} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button onClick={handleExportCSV} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <Separator />
          <div>
            <Label htmlFor="import-json">Import Portfolio (JSON)</Label>
            <Input
              id="import-json"
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Cache */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Cache</CardTitle>
          <CardDescription>
            Clear cached data to refresh AI predictions and portfolio data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleClearCache} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All Cache
          </Button>
        </CardContent>
      </Card>


      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>About PatternSight</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            PatternSight is an AI-powered stock analysis tool that provides real-time market data,
            technical indicators, and intelligent predictions.
          </p>
          <p>
            <strong>Disclaimer:</strong> This application is for educational purposes only.
            Not financial advice. Always do your own research before making investment decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
