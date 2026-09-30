import { describe, expect, it } from 'vitest';

import { buildGraph, toMermaid } from './build-graph';

describe('buildGraph', () => {
  it('returns no nodes or edges for an empty list', () => {
    expect(buildGraph([])).toEqual({ nodes: [], edges: [] });
  });

  it('adds a node per entry when nothing declares composedOf', () => {
    const graph = buildGraph([
      { id: '1', title: 'Example/Button' },
      { id: '2', title: 'Example/Header' },
    ]);

    expect(graph.nodes).toEqual(['Example/Button', 'Example/Header']);
    expect(graph.edges).toEqual([]);
  });

  it('builds a chain from composedOf relationships', () => {
    const graph = buildGraph([
      { id: '1', title: 'Example/Button' },
      { id: '2', title: 'Example/Header', composedOf: ['Example/Button'] },
      { id: '3', title: 'Example/Page', composedOf: ['Example/Header'] },
    ]);

    expect(graph.nodes).toEqual(['Example/Button', 'Example/Header', 'Example/Page']);
    expect(graph.edges).toEqual([
      ['Example/Header', 'Example/Button'],
      ['Example/Page', 'Example/Header'],
    ]);
  });

  it('adds one edge per dependency when multiple components share one', () => {
    const graph = buildGraph([
      { id: '1', title: 'Example/Button' },
      { id: '2', title: 'Example/Header', composedOf: ['Example/Button'] },
      { id: '3', title: 'Example/Footer', composedOf: ['Example/Button'] },
    ]);

    expect(graph.edges).toEqual([
      ['Example/Header', 'Example/Button'],
      ['Example/Footer', 'Example/Button'],
    ]);
  });
});

describe('toMermaid', () => {
  it('declares every node and one arrow per edge', () => {
    const graph = buildGraph([
      { id: '1', title: 'Example/Button' },
      { id: '2', title: 'Example/Header', composedOf: ['Example/Button'] },
    ]);

    expect(toMermaid(graph)).toBe(
      [
        'graph TD',
        '  Example_Button["Example/Button"]',
        '  Example_Header["Example/Header"]',
        '  Example_Header --> Example_Button',
      ].join('\n')
    );
  });
});
