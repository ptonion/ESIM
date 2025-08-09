import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './page';

test('fetches and renders plans for selected country', async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  // @ts-expect-error augment global
  global.window = dom.window as any;
  // @ts-expect-error augment global
  global.document = dom.window.document as any;
  // @ts-expect-error augment global
  global.navigator = dom.window.navigator as any;
  // @ts-expect-error augment global
  global.React = React;

  const fetchMock = mock.fn(async (input: RequestInfo) => {
    if (typeof input === 'string' && input === '/api/countries') {
      return new Response(JSON.stringify([{ iso2: 'JP', name: 'Japan' }]), { status: 200 });
    }
    if (typeof input === 'string' && input.startsWith('/api/plans')) {
      return new Response(
        JSON.stringify([
          {
            id: 'jp1',
            provider: 'Airalo',
            name: 'Japan Plan',
            dataGB: 1,
            validityDays: 7,
            priceUsd: 5,
            pricePerGBUsd: 5,
            hotspotAllowed: true,
            purchaseUrl: 'https://example.com/jp1'
          }
        ]),
        { status: 200 }
      );
    }
    return new Response('not found', { status: 404 });
  });
  // @ts-expect-error augment global
  global.fetch = fetchMock;

  const container = document.createElement('div');
  document.body.appendChild(container);

  await act(async () => {
    createRoot(container).render(<Home />);
  });

  const select = container.querySelector('select') as HTMLSelectElement;
  await act(async () => {
    select.value = 'JP';
    select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  });

  // wait for async state updates
  await new Promise((r) => setTimeout(r, 0));

  assert.ok(
    fetchMock.mock.calls.some((c) => String(c.arguments[0]).includes('/api/plans?country=JP'))
  );
  assert.match(container.textContent || '', /Japan Plan/);
});
