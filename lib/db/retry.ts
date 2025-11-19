import { db } from "./index";

/**
 * Execute a database query with retry logic for transient errors
 * Useful for handling ECONNRESET and other temporary connection issues
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Only retry on connection errors
      const isConnectionError = 
        (error as any)?.code === 'ECONNRESET' ||
        (error as any)?.code === 'ENOTFOUND' ||
        (error as any)?.code === 'ETIMEDOUT' ||
        (error as any)?.message?.includes('connection') ||
        (error as any)?.message?.includes('timeout');
      
      if (!isConnectionError || attempt === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
    }
  }
  
  throw lastError;
}

// Example usage:
// const users = await withRetry(() => db.select().from(users).where(eq(users.id, id)));
