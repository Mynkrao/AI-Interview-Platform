// src/test/setup.js
// Vitest global setup: wires jest-dom matchers (toBeInTheDocument, etc.)
// and clears sessionStorage/localStorage between tests so persistence
// tests never leak state into one another.

import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

afterEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});
