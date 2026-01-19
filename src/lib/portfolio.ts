/**
 * Portfolio Management using localStorage
 * Handles storing and retrieving user's stock portfolio
 */

export interface PortfolioItem {
  ticker: string;
  dateAdded: string; // ISO date string
  priceAtAdd: number;
  notes?: string;
}

interface Portfolio {
  items: PortfolioItem[];
  lastUpdated: string;
}

const STORAGE_KEY = 'patternsight_portfolio';

/**
 * Get all portfolio items from localStorage
 */
export function getPortfolio(): PortfolioItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const portfolio: Portfolio = JSON.parse(stored);
    return portfolio.items || [];
  } catch (error) {
    console.error('Error reading portfolio from localStorage:', error);
    return [];
  }
}

/**
 * Add a stock to portfolio
 */
export function addToPortfolio(ticker: string, priceAtAdd: number, notes?: string): void {
  if (typeof window === 'undefined') return;

  const items = getPortfolio();
  
  // Check if already exists
  const existingIndex = items.findIndex(item => item.ticker.toUpperCase() === ticker.toUpperCase());
  
  if (existingIndex >= 0) {
    // Update existing item
    items[existingIndex] = {
      ...items[existingIndex],
      priceAtAdd,
      notes,
      dateAdded: items[existingIndex].dateAdded, // Keep original date
    };
  } else {
    // Add new item
    items.push({
      ticker: ticker.toUpperCase(),
      dateAdded: new Date().toISOString(),
      priceAtAdd,
      notes,
    });
  }

  savePortfolio(items);
}

/**
 * Remove a stock from portfolio
 */
export function removeFromPortfolio(ticker: string): void {
  if (typeof window === 'undefined') return;

  const items = getPortfolio().filter(
    item => item.ticker.toUpperCase() !== ticker.toUpperCase()
  );
  
  savePortfolio(items);
}

/**
 * Update a portfolio item
 */
export function updatePortfolioItem(
  ticker: string,
  updates: Partial<PortfolioItem>
): void {
  if (typeof window === 'undefined') return;

  const items = getPortfolio();
  const index = items.findIndex(
    item => item.ticker.toUpperCase() === ticker.toUpperCase()
  );

  if (index >= 0) {
    items[index] = { ...items[index], ...updates };
    savePortfolio(items);
  }
}

/**
 * Check if a ticker is in portfolio
 */
export function isInPortfolio(ticker: string): boolean {
  const items = getPortfolio();
  return items.some(item => item.ticker.toUpperCase() === ticker.toUpperCase());
}

/**
 * Get portfolio item for a ticker
 */
export function getPortfolioItem(ticker: string): PortfolioItem | null {
  const items = getPortfolio();
  return items.find(item => item.ticker.toUpperCase() === ticker.toUpperCase()) || null;
}

/**
 * Save portfolio to localStorage
 */
function savePortfolio(items: PortfolioItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    const portfolio: Portfolio = {
      items,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
  } catch (error) {
    console.error('Error saving portfolio to localStorage:', error);
  }
}

/**
 * Clear entire portfolio
 */
export function clearPortfolio(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export portfolio to JSON string
 */
export function exportPortfolioToJSON(): string {
  const items = getPortfolio();
  return JSON.stringify({ items, exportedAt: new Date().toISOString() }, null, 2);
}

/**
 * Export portfolio to CSV string
 */
export function exportPortfolioToCSV(): string {
  const items = getPortfolio();
  const headers = 'Ticker,Date Added,Price at Add,Notes\n';
  const rows = items.map(item => 
    `${item.ticker},"${item.dateAdded}",${item.priceAtAdd},"${item.notes || ''}"`
  ).join('\n');
  return headers + rows;
}

/**
 * Import portfolio from JSON string
 */
export function importPortfolioFromJSON(jsonString: string): { success: boolean; count: number; error?: string } {
  if (typeof window === 'undefined') {
    return { success: false, count: 0, error: 'Not available on server' };
  }

  try {
    const data = JSON.parse(jsonString);
    const items: PortfolioItem[] = Array.isArray(data.items) ? data.items : data;
    
    if (!Array.isArray(items)) {
      return { success: false, count: 0, error: 'Invalid portfolio format' };
    }

    // Validate items
    const validItems = items.filter(item => 
      item.ticker && 
      typeof item.priceAtAdd === 'number' &&
      item.dateAdded
    );

    if (validItems.length === 0) {
      return { success: false, count: 0, error: 'No valid portfolio items found' };
    }

    // Merge with existing portfolio (don't overwrite, merge)
    const existing = getPortfolio();
    const existingTickers = new Set(existing.map(i => i.ticker.toUpperCase()));
    
    const newItems = validItems.filter(item => 
      !existingTickers.has(item.ticker.toUpperCase())
    );

    const merged = [...existing, ...newItems];
    savePortfolio(merged);

    return { success: true, count: newItems.length };
  } catch (error: any) {
    return { success: false, count: 0, error: error.message || 'Failed to parse JSON' };
  }
}

/**
 * Import ticker list (simple array of tickers)
 */
export function importTickerList(tickers: string[]): { success: boolean; count: number; errors: string[] } {
  if (typeof window === 'undefined') {
    return { success: false, count: 0, errors: ['Not available on server'] };
  }

  const errors: string[] = [];
  const existing = getPortfolio();
  const existingTickers = new Set(existing.map(i => i.ticker.toUpperCase()));
  
  let added = 0;
  for (const ticker of tickers) {
    const upperTicker = ticker.trim().toUpperCase();
    if (!upperTicker) continue;
    
    if (existingTickers.has(upperTicker)) {
      errors.push(`${upperTicker}: Already in portfolio`);
      continue;
    }

    // Add with current price as placeholder (will be updated on refresh)
    addToPortfolio(upperTicker, 0, 'Imported');
    added++;
  }

  return { success: added > 0, count: added, errors };
}
