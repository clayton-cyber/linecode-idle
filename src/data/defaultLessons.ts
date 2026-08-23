import { Lesson } from '../types/lesson';

export const defaultLessons: Lesson[] = [
  {
    id: 'python-binary-search',
    title: 'Binary Search Algorithm (Python)',
    language: 'python',
    difficulty: 'Beginner',
    description: 'Master the classic O(log n) divide-and-conquer search on sorted arrays line-by-line.',
    createdAt: 1700000000000,
    lines: [
      {
        id: 'py-bs-1',
        lineNumber: 1,
        code: 'def binary_search(arr, target):',
        explanation: 'Define the `binary_search` function taking a sorted array `arr` and a `target` element to find.',
        hint: 'Use the `def` keyword followed by function name and parameters in parentheses.',
        category: 'definition'
      },
      {
        id: 'py-bs-2',
        lineNumber: 2,
        code: '    left = 0',
        explanation: 'Initialize the `left` pointer to index `0`, marking the beginning of our search space.',
        hint: 'Indent 4 spaces and set left = 0.',
        category: 'logic'
      },
      {
        id: 'py-bs-3',
        lineNumber: 3,
        code: '    right = len(arr) - 1',
        explanation: 'Initialize the `right` pointer to `len(arr) - 1`, the last valid index of the array.',
        hint: 'Subtract 1 from the array length.',
        category: 'logic'
      },
      {
        id: 'py-bs-4',
        lineNumber: 4,
        code: '    while left <= right:',
        explanation: 'Loop as long as the search window is valid (`left` has not crossed `right`).',
        hint: 'Standard `while` loop condition.',
        category: 'control'
      },
      {
        id: 'py-bs-5',
        lineNumber: 5,
        code: '        mid = (left + right) // 2',
        explanation: 'Calculate the middle index using integer floor division `//` to avoid floating points.',
        hint: 'Use `(left + right) // 2` with 8-space indentation.',
        category: 'logic'
      },
      {
        id: 'py-bs-6',
        lineNumber: 6,
        code: '        if arr[mid] == target:',
        explanation: 'Check if the element at the midpoint is equal to the target value.',
        hint: 'Compare arr[mid] with target using `==`.',
        category: 'control'
      },
      {
        id: 'py-bs-7',
        lineNumber: 7,
        code: '            return mid',
        explanation: 'Target found! Return the index `mid` immediately.',
        hint: 'Return the index.',
        category: 'return'
      },
      {
        id: 'py-bs-8',
        lineNumber: 8,
        code: '        elif arr[mid] < target:',
        explanation: 'If the midpoint element is smaller than target, the target must be in the right half.',
        hint: 'Use `elif` to check if arr[mid] < target.',
        category: 'control'
      },
      {
        id: 'py-bs-9',
        lineNumber: 9,
        code: '            left = mid + 1',
        explanation: 'Discard the left half by advancing `left` past `mid`.',
        hint: 'Set left = mid + 1.',
        category: 'logic'
      },
      {
        id: 'py-bs-10',
        lineNumber: 10,
        code: '        else:',
        explanation: 'Otherwise, the midpoint element is greater than target; target must be in the left half.',
        hint: 'Use `else:` clause.',
        category: 'control'
      },
      {
        id: 'py-bs-11',
        lineNumber: 11,
        code: '            right = mid - 1',
        explanation: 'Discard the right half by moving `right` before `mid`.',
        hint: 'Set right = mid - 1.',
        category: 'logic'
      },
      {
        id: 'py-bs-12',
        lineNumber: 12,
        code: '    return -1',
        explanation: 'If the loop finishes without finding the target, return `-1` to indicate not found.',
        hint: 'Indented 4 spaces inside function body, return -1.',
        category: 'return'
      }
    ]
  },
  {
    id: 'javascript-async-fetch',
    title: 'Async API Fetch with Error Handling (JavaScript)',
    language: 'javascript',
    difficulty: 'Intermediate',
    description: 'Learn modern asynchronous JavaScript patterns, try/catch error boundaries, and HTTP response handling.',
    createdAt: 1700000001000,
    lines: [
      {
        id: 'js-fetch-1',
        lineNumber: 1,
        code: 'async function fetchUserProfile(userId) {',
        explanation: 'Declare an asynchronous function `fetchUserProfile` that receives a `userId` argument.',
        hint: 'Use `async function` declaration syntax.',
        category: 'definition'
      },
      {
        id: 'js-fetch-2',
        lineNumber: 2,
        code: '  try {',
        explanation: 'Begin a `try` block to catch potential network errors or non-200 HTTP responses.',
        hint: 'Start try block with 2-space indentation.',
        category: 'control'
      },
      {
        id: 'js-fetch-3',
        lineNumber: 3,
        code: '    const url = `https://api.example.com/users/${userId}`;',
        explanation: 'Construct the dynamic REST endpoint URL using template literals and string interpolation.',
        hint: 'Use backticks and `${userId}` placeholder.',
        category: 'logic'
      },
      {
        id: 'js-fetch-4',
        lineNumber: 4,
        code: '    const response = await fetch(url);',
        explanation: 'Await the HTTP Promise returned by the native `fetch` API.',
        hint: 'Use `const response = await fetch(url);`.',
        category: 'logic'
      },
      {
        id: 'js-fetch-5',
        lineNumber: 5,
        code: '    if (!response.ok) {',
        explanation: 'Check if the HTTP response status is NOT in the 200-299 success range.',
        hint: 'Evaluate `!response.ok`.',
        category: 'control'
      },
      {
        id: 'js-fetch-6',
        lineNumber: 6,
        code: '      throw new Error(`HTTP Error: ${response.status}`);',
        explanation: 'Explicitly throw an `Error` containing the HTTP status code to jump to the catch block.',
        hint: 'Throw a new Error instance.',
        category: 'return'
      },
      {
        id: 'js-fetch-7',
        lineNumber: 7,
        code: '    }',
        explanation: 'Close the `if (!response.ok)` check block.',
        hint: 'Closing brace `}`.',
        category: 'control'
      },
      {
        id: 'js-fetch-8',
        lineNumber: 8,
        code: '    const data = await response.json();',
        explanation: 'Parse the response stream into a JavaScript object via `await response.json()`.',
        hint: 'Await the JSON stream parsing.',
        category: 'logic'
      },
      {
        id: 'js-fetch-9',
        lineNumber: 9,
        code: '    return data;',
        explanation: 'Return the parsed profile data object to the caller.',
        hint: 'Return the parsed data variable.',
        category: 'return'
      },
      {
        id: 'js-fetch-10',
        lineNumber: 10,
        code: '  } catch (error) {',
        explanation: 'Catch any network failures, JSON parsing bugs, or explicitly thrown errors.',
        hint: 'Catch clause with error parameter.',
        category: 'control'
      },
      {
        id: 'js-fetch-11',
        lineNumber: 11,
        code: '    console.error("Failed to fetch user:", error.message);',
        explanation: 'Log a descriptive error message to the console for observability.',
        hint: 'Use console.error with message.',
        category: 'logic'
      },
      {
        id: 'js-fetch-12',
        lineNumber: 12,
        code: '    return null;',
        explanation: 'Gracefully return `null` as fallback so callers can handle absence safely.',
        hint: 'Return null fallback.',
        category: 'return'
      },
      {
        id: 'js-fetch-13',
        lineNumber: 13,
        code: '  }',
        explanation: 'Close the `try/catch` block.',
        hint: 'Closing brace for catch.',
        category: 'control'
      },
      {
        id: 'js-fetch-14',
        lineNumber: 14,
        code: '}',
        explanation: 'Close the `fetchUserProfile` function declaration.',
        hint: 'Final closing brace.',
        category: 'definition'
      }
    ]
  },
  {
    id: 'react-use-debounce',
    title: 'Custom useDebounce Hook (TypeScript / React)',
    language: 'typescript',
    difficulty: 'Intermediate',
    description: 'Build a production-grade React hook to debounce fast changing values like search inputs.',
    createdAt: 1700000002000,
    lines: [
      {
        id: 'react-db-1',
        lineNumber: 1,
        code: 'import { useState, useEffect } from "react";',
        explanation: 'Import core React hooks `useState` for state tracking and `useEffect` for timer lifecycle.',
        hint: 'Import named hooks from "react".',
        category: 'import'
      },
      {
        id: 'react-db-2',
        lineNumber: 2,
        code: 'export function useDebounce<T>(value: T, delay: number = 300): T {',
        explanation: 'Define generic hook `useDebounce<T>` with a default delay of 300 milliseconds.',
        hint: 'Export function with generic type T and default delay parameter.',
        category: 'definition'
      },
      {
        id: 'react-db-3',
        lineNumber: 3,
        code: '  const [debouncedValue, setDebouncedValue] = useState<T>(value);',
        explanation: 'Create local state initialized with the incoming value.',
        hint: 'Use useState<T>(value) destructured.',
        category: 'logic'
      },
      {
        id: 'react-db-4',
        lineNumber: 4,
        code: '  useEffect(() => {',
        explanation: 'Trigger effect whenever `value` or `delay` changes.',
        hint: 'Call useEffect with an arrow function.',
        category: 'control'
      },
      {
        id: 'react-db-5',
        lineNumber: 5,
        code: '    const timer = setTimeout(() => {',
        explanation: 'Set a timeout to update the debounced state after the specified delay.',
        hint: 'Create setTimeout callback.',
        category: 'logic'
      },
      {
        id: 'react-db-6',
        lineNumber: 6,
        code: '      setDebouncedValue(value);',
        explanation: 'Set the new value once the timer finishes.',
        hint: 'Invoke setDebouncedValue(value).',
        category: 'logic'
      },
      {
        id: 'react-db-7',
        lineNumber: 7,
        code: '    }, delay);',
        explanation: 'Pass `delay` as the timeout duration in milliseconds.',
        hint: 'Close setTimeout with delay argument.',
        category: 'logic'
      },
      {
        id: 'react-db-8',
        lineNumber: 8,
        code: '    return () => {',
        explanation: 'Return a cleanup function that runs if `value` changes again before the timer fires.',
        hint: 'Return cleanup arrow function.',
        category: 'return'
      },
      {
        id: 'react-db-9',
        lineNumber: 9,
        code: '      clearTimeout(timer);',
        explanation: 'Clear the pending timer to prevent outdated updates (debouncing core mechanism).',
        hint: 'Call clearTimeout(timer).',
        category: 'logic'
      },
      {
        id: 'react-db-10',
        lineNumber: 10,
        code: '    };',
        explanation: 'Close the cleanup function definition.',
        hint: 'Closing brace with semicolon.',
        category: 'control'
      },
      {
        id: 'react-db-11',
        lineNumber: 11,
        code: '  }, [value, delay]);',
        explanation: 'Dependency array: rerun effect only when `value` or `delay` changes.',
        hint: 'Array containing `[value, delay]`.',
        category: 'control'
      },
      {
        id: 'react-db-12',
        lineNumber: 12,
        code: '  return debouncedValue;',
        explanation: 'Return the stabilized debounced value.',
        hint: 'Return debouncedValue.',
        category: 'return'
      },
      {
        id: 'react-db-13',
        lineNumber: 13,
        code: '}',
        explanation: 'Close the `useDebounce` hook function.',
        hint: 'Closing brace.',
        category: 'definition'
      }
    ]
  },
  {
    id: 'sql-aggregation-query',
    title: 'Top Customers by Monthly Spend (SQL)',
    language: 'sql',
    difficulty: 'Beginner',
    description: 'Learn SQL multi-table JOINs, SUM aggregations, and ranking filters.',
    createdAt: 1700000003000,
    lines: [
      {
        id: 'sql-1',
        lineNumber: 1,
        code: 'SELECT',
        explanation: 'Initiate the projection query to retrieve specific columns.',
        hint: 'SELECT keyword.',
        category: 'definition'
      },
      {
        id: 'sql-2',
        lineNumber: 2,
        code: '  c.customer_id,',
        explanation: 'Select customer ID from the customers alias `c`.',
        hint: 'c.customer_id with trailing comma.',
        category: 'logic'
      },
      {
        id: 'sql-3',
        lineNumber: 3,
        code: '  c.name AS customer_name,',
        explanation: 'Select customer name and alias it as `customer_name`.',
        hint: 'c.name AS customer_name,',
        category: 'logic'
      },
      {
        id: 'sql-4',
        lineNumber: 4,
        code: '  SUM(o.total_amount) AS total_spent',
        explanation: 'Aggregate the total purchase amount across all matching orders.',
        hint: 'SUM function with alias total_spent.',
        category: 'logic'
      },
      {
        id: 'sql-5',
        lineNumber: 5,
        code: 'FROM customers c',
        explanation: 'Query from the `customers` table with shorthand alias `c`.',
        hint: 'FROM customers c',
        category: 'definition'
      },
      {
        id: 'sql-6',
        lineNumber: 6,
        code: 'JOIN orders o ON c.customer_id = o.customer_id',
        explanation: 'Inner join the `orders` table matching primary/foreign keys.',
        hint: 'JOIN orders o ON c.customer_id = o.customer_id',
        category: 'logic'
      },
      {
        id: 'sql-7',
        lineNumber: 7,
        code: "WHERE o.order_date >= '2026-01-01'",
        explanation: 'Filter orders placed on or after January 1st, 2026.',
        hint: 'WHERE filter with date string.',
        category: 'control'
      },
      {
        id: 'sql-8',
        lineNumber: 8,
        code: 'GROUP BY c.customer_id, c.name',
        explanation: 'Group non-aggregated customer columns for aggregation.',
        hint: 'GROUP BY with both selected customer columns.',
        category: 'control'
      },
      {
        id: 'sql-9',
        lineNumber: 9,
        code: 'ORDER BY total_spent DESC',
        explanation: 'Order highest spenders first in descending order.',
        hint: 'ORDER BY total_spent DESC',
        category: 'control'
      },
      {
        id: 'sql-10',
        lineNumber: 10,
        code: 'LIMIT 10;',
        explanation: 'Cap result set to top 10 customers and terminate query with semicolon.',
        hint: 'LIMIT 10;',
        category: 'control'
      }
    ]
  }
];
