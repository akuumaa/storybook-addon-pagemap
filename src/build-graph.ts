export interface ComponentEntry {
  id: string;
  title: string;
  composedOf?: string[];
}

export interface ComponentGraph {
  nodes: string[];
  edges: [from: string, to: string][];
}

/** Aggregates every story's `composedOf` parameter into one graph across the whole Storybook. */
export function buildGraph(entries: ComponentEntry[]): ComponentGraph {
  const nodes = new Set<string>();
  const edges: [string, string][] = [];

  for (const entry of entries) {
    nodes.add(entry.title);

    for (const child of entry.composedOf ?? []) {
      nodes.add(child);
      edges.push([entry.title, child]);
    }
  }

  return { nodes: [...nodes], edges };
}

/** Mermaid node ids can't contain `/` or spaces, so titles like `Example/Button` need sanitizing. */
function toNodeId(title: string): string {
  return title.replace(/[^a-zA-Z0-9]/g, '_');
}

/** Renders a graph as a Mermaid flowchart definition, labeling nodes with their real title. */
export function toMermaid(graph: ComponentGraph): string {
  const lines = ['graph TD'];

  for (const node of graph.nodes) {
    lines.push(`  ${toNodeId(node)}["${node}"]`);
  }

  for (const [from, to] of graph.edges) {
    lines.push(`  ${toNodeId(from)} --> ${toNodeId(to)}`);
  }

  return lines.join('\n');
}
