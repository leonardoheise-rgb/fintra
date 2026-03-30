import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { resetRuntimeDisplayPreferences } from '../shared/preferences/displayPreferences';

beforeEach(() => {
  window.localStorage.clear();
  window.history.pushState({}, '', '/');
  resetRuntimeDisplayPreferences();
});

afterEach(() => {
  cleanup();
});
