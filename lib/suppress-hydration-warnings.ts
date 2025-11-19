// Aggressive suppression of hydration warnings caused by browser extensions
if (typeof window !== 'undefined') {
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = (...args: unknown[]) => {
    const errorString = args.join(' ');
    
    // Suppress all hydration-related errors
    if (
      errorString.includes('Hydration failed') ||
      errorString.includes('hydrated') ||
      errorString.includes('data-darkreader') ||
      errorString.includes('suppressHydrationWarning') ||
      errorString.includes('server rendered HTML') ||
      errorString.includes('client properties') ||
      errorString.includes('--darkreader-inline') ||
      errorString.includes('SSR-ed Client Component') ||
      errorString.includes('A tree hydrated but')
    ) {
      return;
    }
    
    originalError.apply(console, args);
  };
  
  console.warn = (...args: unknown[]) => {
    const warnString = args.join(' ');
    
    if (
      warnString.includes('Prop') && warnString.includes('did not match') ||
      warnString.includes('data-darkreader')
    ) {
      return;
    }
    
    originalWarn.apply(console, args);
  };
}

export {};
