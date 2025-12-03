'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, Loader2 } from 'lucide-react';

const formSchema = z.object({
  ticker: z.string().min(1, 'Ticker is required').max(10, 'Invalid ticker').toUpperCase(),
});

type StockFormProps = {
  onSubmit: (ticker: string) => void;
  loading: boolean;
};

export function StockForm({ onSubmit, loading }: StockFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticker: '',
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values.ticker);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-start gap-2">
        <FormField
          control={form.control}
          name="ticker"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="sr-only">Stock Ticker</FormLabel>
              <FormControl>
                <Input placeholder="e.g., AAPL, GOOGL, TSLA" {...field} aria-label="Stock Ticker" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Analyze
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
