import { readFileSync } from 'fs';
import { join } from 'path';
import type { GraphJson } from '@/types/graph.types';
import { transformGraphData } from '@/lib/graph';
import GraphCanvas from '@/components/GraphCanvas';

export default function Page() {
  const raw: GraphJson = JSON.parse(
    readFileSync(join(process.cwd(), 'data', 'graph.json'), 'utf-8')
  );
  const { nodes, edges } = transformGraphData(raw);
  return <GraphCanvas initialNodes={nodes} initialEdges={edges} />;
}
