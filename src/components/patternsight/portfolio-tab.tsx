'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Download, Upload, FileText, Sparkles, Loader2 } from 'lucide-react';
import { getPortfolio, removeFromPortfolio, exportPortfolioToJSON, exportPortfolioToCSV, importPortfolioFromJSON, importTickerList } from '@/lib/portfolio';
import type { PortfolioItem } from '@/lib/portfolio';
import { useToast } from '@/hooks/use-toast';
import type { Quote } from '@/lib/market-data';
import { getPortfolioAnalysis } from '@/app/actions';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

type PortfolioCardProps = {
  item: PortfolioItem;
  currentQuote: Quote | null;
  onRemove: () => void;
  onView: () => void;
};

function PortfolioCard({ item, currentQuote, onRemove, onView }: PortfolioCardProps) {
  if (!currentQuote) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const gainLoss = currentQuote.price - item.priceAtAdd;
  const gainLossPercent = (gainLoss / item.priceAtAdd) * 100;
  const isPositive = gainLoss >= 0;
  const dateAdded = new Date(item.dateAdded).toLocaleDateString();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{item.ticker}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onView}>
              View
            </Button>
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-2xl font-bold">${currentQuote.price.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Day Change</p>
              <p className={`text-lg font-semibold ${currentQuote.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {currentQuote.change >= 0 ? '+' : ''}{currentQuote.change.toFixed(2)} ({currentQuote.changePercent >= 0 ? '+' : ''}{currentQuote.changePercent.toFixed(2)}%)
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Price at Add</p>
                <p className="font-semibold">${item.priceAtAdd.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gain/Loss</p>
                <p className={`font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}${gainLoss.toFixed(2)} ({isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%)
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Added: {dateAdded}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type PortfolioTabProps = {
  onSelectTicker?: (ticker: string) => void;
};

export function PortfolioTab({ onSelectTicker }: PortfolioTabProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [quotes, setQuotes] = useState<Record<string, Quote | null>>({});
  const [loading, setLoading] = useState(false);
  const [alertInputs, setAlertInputs] = useState<Record<string, string>>({});
  const [alerts, setAlerts] = useState<
    { ticker: string; direction: 'above' | 'below'; price: number }[]
  >([]);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<{
    summary: string;
    strengths: string[];
    risks: string[];
    recommendations: string[];
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPortfolio();
    loadAlerts();
  }, []);

  const loadPortfolio = () => {
    const items = getPortfolio();
    setPortfolio(items);
    fetchQuotesForPortfolio(items);
  };

  const loadAlerts = () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('patternsight_alerts');
      if (raw) setAlerts(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  };

  const saveAlerts = (next: typeof alerts) => {
    setAlerts(next);
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('patternsight_alerts', JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const fetchQuotesForPortfolio = async (items: PortfolioItem[]) => {
    if (items.length === 0) return;

    setLoading(true);
    const quotesMap: Record<string, Quote | null> = {};

    try {
      // Fetch quotes in parallel (but rate-limited)
      const quotePromises = items.map(async (item) => {
        try {
          const response = await fetch(`/api/quote?t=${item.ticker}`);
          if (response.ok) {
            const quote = await response.json();
            return { ticker: item.ticker, quote };
          }
        } catch (error) {
          console.error(`Failed to fetch quote for ${item.ticker}:`, error);
        }
        return { ticker: item.ticker, quote: null };
      });

      const results = await Promise.all(quotePromises);
      results.forEach(({ ticker, quote }) => {
        quotesMap[ticker] = quote;
      });

      setQuotes(quotesMap);
    } catch (error) {
      console.error('Error fetching portfolio quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (ticker: string) => {
    removeFromPortfolio(ticker);
    loadPortfolio();
    toast({
      title: 'Removed from Portfolio',
      description: `${ticker} has been removed from your portfolio.`,
    });
  };

  const handleView = (ticker: string) => {
    if (onSelectTicker) {
      onSelectTicker(ticker);
    }
  };

  // Alerts handling
  const handleAddAlert = (ticker: string, direction: 'above' | 'below') => {
    const priceInput = alertInputs[ticker];
    const price = priceInput ? Number(priceInput) : NaN;
    if (Number.isNaN(price)) {
      toast({ variant: 'destructive', title: 'Invalid price', description: 'Enter a number.' });
      return;
    }
    const next = alerts.filter(a => a.ticker !== ticker || a.direction !== direction);
    next.push({ ticker, direction, price });
    saveAlerts(next);
    toast({ title: 'Alert saved', description: `${ticker} ${direction} ${price}` });
  };

  const alertMatches = (ticker: string, price: number) =>
    alerts.filter(
      a =>
        a.ticker.toUpperCase() === ticker.toUpperCase() &&
        ((a.direction === 'above' && price >= a.price) ||
          (a.direction === 'below' && price <= a.price))
    );

  // Calculate portfolio summary
  const totalValue = portfolio.reduce((sum, item) => {
    const quote = quotes[item.ticker];
    return sum + (quote?.price || item.priceAtAdd);
  }, 0);

  const totalCost = portfolio.reduce((sum, item) => sum + item.priceAtAdd, 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  // Allocation data for chart
  const allocationData = portfolio.map(item => {
    const quote = quotes[item.ticker];
    const value = quote?.price || item.priceAtAdd;
    return { name: item.ticker, value };
  });

  // Performance line (rough: use priceAtAdd vs current)
  const performanceData = portfolio.map(item => {
    const quote = quotes[item.ticker];
    const value = quote?.price || item.priceAtAdd;
    const gain = value - item.priceAtAdd;
    return {
      name: item.ticker,
      value,
      gain,
    };
  });

  // Signals
  const signals = (() => {
    if (portfolio.length === 0) return [];
    const mapped = portfolio.map(item => {
      const q = quotes[item.ticker];
      const changePct = q ? q.changePercent : 0;
      const gain = q ? q.price - item.priceAtAdd : 0;
      return { ticker: item.ticker, changePct, gain };
    });
    const sortedChange = [...mapped].sort((a, b) => (b.changePct || 0) - (a.changePct || 0));
    const sortedGain = [...mapped].sort((a, b) => (b.gain || 0) - (a.gain || 0));
    const topGainer = sortedChange[0];
    const topLoser = sortedChange[sortedChange.length - 1];
    return [
      topGainer ? `Top intraday mover: ${topGainer.ticker} (${topGainer.changePct.toFixed(2)}%)` : null,
      topLoser ? `Biggest intraday drop: ${topLoser.ticker} (${topLoser.changePct.toFixed(2)}%)` : null,
      sortedGain[0] ? `Best since add: ${sortedGain[0].ticker} (+${sortedGain[0].gain.toFixed(2)})` : null,
    ].filter(Boolean) as string[];
  })();

  // Generate portfolio AI analysis
  const generatePortfolioAnalysis = async () => {
    if (portfolio.length === 0) return;
    
    setAnalyzing(true);
    try {
      const portfolioData = JSON.stringify(
        portfolio.map(item => {
          const q = quotes[item.ticker];
          const gain = q ? q.price - item.priceAtAdd : 0;
          const gainPercent = q ? ((q.price - item.priceAtAdd) / item.priceAtAdd) * 100 : 0;
          return {
            ticker: item.ticker,
            priceAtAdd: item.priceAtAdd,
            currentPrice: q?.price || item.priceAtAdd,
            gain,
            gainPercent,
            dayChange: q?.changePercent || 0,
            dateAdded: item.dateAdded,
          };
        })
      );
      
      const analysis = await getPortfolioAnalysis(portfolioData);
      setPortfolioAnalysis(analysis);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: error.message || 'Could not generate portfolio analysis.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Auto-generate analysis when portfolio changes
  useEffect(() => {
    if (portfolio.length > 0 && Object.keys(quotes).length > 0) {
      generatePortfolioAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio.length, Object.keys(quotes).length]);

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      {portfolio.length > 0 && (
        <Card className="bg-secondary">
          <CardHeader>
            <CardTitle>Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gain/Loss %</p>
                <p className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
                </p>
              </div>
            </div>
            {/* Allocation Chart */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-56">
                <p className="text-sm text-muted-foreground mb-2">Allocation</p>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocationData} dataKey="value" nameKey="name" outerRadius={80} label>
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}`} fill={['#22c55e', '#3b82f6', '#f97316', '#e11d48', '#a855f7'][index % 5]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="h-56">
                <p className="text-sm text-muted-foreground mb-2">Value & Gain</p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" name="Value" />
                    <Line type="monotone" dataKey="gain" stroke="#22c55e" name="Gain" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* AI Portfolio Analysis */}
            {portfolioAnalysis && (
              <Card className="mt-4 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <CardTitle>AI Portfolio Analysis</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={generatePortfolioAnalysis}
                      disabled={analyzing}
                    >
                      {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <CardDescription className="mb-2">Summary</CardDescription>
                    <p className="text-sm text-muted-foreground">{portfolioAnalysis.summary}</p>
                  </div>
                  {portfolioAnalysis.strengths.length > 0 && (
                    <div>
                      <CardDescription className="mb-2">Strengths</CardDescription>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {portfolioAnalysis.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {portfolioAnalysis.risks.length > 0 && (
                    <div>
                      <CardDescription className="mb-2">Risks</CardDescription>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {portfolioAnalysis.risks.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {portfolioAnalysis.recommendations.length > 0 && (
                    <div>
                      <CardDescription className="mb-2">Recommendations</CardDescription>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {portfolioAnalysis.recommendations.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => fetchQuotesForPortfolio(portfolio)}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh Prices'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const json = exportPortfolioToJSON();
                  const blob = new Blob([json], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `portfolio-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast({ title: 'Portfolio exported', description: 'JSON file downloaded' });
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const csv = exportPortfolioToCSV();
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast({ title: 'Portfolio exported', description: 'CSV file downloaded' });
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowImport(!showImport)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </div>
            {showImport && (
              <div className="mt-4 p-4 border rounded-lg space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Import Portfolio (JSON)</label>
                  <textarea
                    className="w-full p-2 border rounded text-sm font-mono"
                    rows={6}
                    placeholder='{"items": [{"ticker": "AAPL", "dateAdded": "2025-01-01T00:00:00.000Z", "priceAtAdd": 150}]}'
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const result = importPortfolioFromJSON(importText);
                        if (result.success) {
                          toast({ title: 'Import successful', description: `Added ${result.count} stocks` });
                          setImportText('');
                          setShowImport(false);
                          loadPortfolio();
                        } else {
                          toast({ variant: 'destructive', title: 'Import failed', description: result.error });
                        }
                      }}
                    >
                      Import JSON
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const tickers = importText.split(/[,\n]/).map(t => t.trim()).filter(Boolean);
                        const result = importTickerList(tickers);
                        if (result.success) {
                          toast({ title: 'Import successful', description: `Added ${result.count} tickers` });
                          setImportText('');
                          setShowImport(false);
                          loadPortfolio();
                        } else {
                          toast({ variant: 'destructive', title: 'Import failed', description: result.errors.join(', ') });
                        }
                      }}
                    >
                      Import Ticker List
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const text = event.target?.result as string;
                            setImportText(text);
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Load File
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Portfolio Items */}
      {portfolio.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Your portfolio is empty.
              </p>
              <p className="text-sm text-muted-foreground">
                Add stocks from the Overview tab to track them here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {portfolio.map((item) => (
            <PortfolioCard
              key={item.ticker}
              item={item}
              currentQuote={quotes[item.ticker] || null}
              onRemove={() => handleRemove(item.ticker)}
              onView={() => handleView(item.ticker)}
            />
          ))}
        </div>
      )}

      {/* Signals + Alerts */}
      {portfolio.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Signals & Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {signals.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {signals.map(sig => (
                  <li key={sig}>{sig}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No signals yet.</p>
            )}

            <div className="space-y-3">
              <p className="text-sm font-medium">Price Alerts</p>
              {portfolio.map(item => (
                <div key={`alert-${item.ticker}`} className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm w-16">{item.ticker}</span>
                  <Input
                    type="number"
                    placeholder="Price"
                    value={alertInputs[item.ticker] || ''}
                    onChange={e => setAlertInputs(prev => ({ ...prev, [item.ticker]: e.target.value }))}
                    className="w-28"
                  />
                  <Button size="sm" variant="outline" onClick={() => handleAddAlert(item.ticker, 'above')}>Above</Button>
                  <Button size="sm" variant="outline" onClick={() => handleAddAlert(item.ticker, 'below')}>Below</Button>
                  <span className="text-xs text-muted-foreground">
                    {(() => {
                      const quote = quotes[item.ticker];
                      const matches = quote ? alertMatches(item.ticker, quote.price) : [];
                      return matches.length
                        ? `Triggered: ${matches.map(m => `${m.direction} ${m.price}`).join(', ')}`
                        : 'No triggers';
                    })()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
