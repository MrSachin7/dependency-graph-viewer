import type { Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import type { GraphJson, ActivityNodeData, ResourceNodeData } from '@/types/graph.types';

export function transformGraphData(raw: GraphJson): {
  nodes: Node<ActivityNodeData | ResourceNodeData>[];
  edges: Edge[];
} {
  // Count how many times each node id appears as a dependency target
  const depCounts = new Map<string, number>();
  for (const dep of raw.dependencies) {
    depCounts.set(dep.to, (depCounts.get(dep.to) ?? 0) + 1);
  }

  // Map each resource id to the names of activities that point to it
  const dependingActivityNamesMap = new Map<string, string[]>();
  const activityNames = new Map<string, string>(
    raw.nodes.filter((n) => n.type === 'activity').map((n) => [n.id, n.name])
  );
  for (const dep of raw.dependencies) {
    const name = activityNames.get(dep.from) ?? dep.from;
    const existing = dependingActivityNamesMap.get(dep.to) ?? [];
    dependingActivityNamesMap.set(dep.to, [...existing, name]);
  }

  const nodes: Node<ActivityNodeData | ResourceNodeData>[] = raw.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: { x: 0, y: 0 }, // dagre overwrites in useDagreLayout
    data:
      n.type === 'activity'
        ? ({
            name: n.name,
            rto_hours: n.rto_hours!,
            priority: n.priority!,
            owner: n.owner!,
          } satisfies ActivityNodeData)
        : ((): ResourceNodeData => {
            const dependencyCount = depCounts.get(n.id) ?? 0;
            return {
              name: n.name,
              resource_type: n.resource_type!,
              contact: n.contact!,
              vendor: n.vendor,
              isSPOF: dependencyCount > 1,
              dependencyCount,
              dependingActivityNames: dependingActivityNamesMap.get(n.id) ?? [],
            } satisfies ResourceNodeData;
          })(),
  }));

  const edges: Edge[] = raw.dependencies.map((dep, i) => ({
    id: `e-${dep.from}-${dep.to}-${i}`,
    source: dep.from,
    target: dep.to,
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569', width: 18, height: 18 },
    markerStart: { type: MarkerType.Arrow, color: '#94a3b8', width: 8, height: 8 },
    style: { stroke: '#64748b', strokeWidth: 1.5 },
  }));

  return { nodes, edges };
}
