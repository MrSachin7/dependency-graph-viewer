import { useEffect, useRef } from 'react';
import { useReactFlow, useNodesInitialized, type Node, type Edge } from '@xyflow/react';
import dagre from '@dagrejs/dagre';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 64; // uniform height for rank spacing

export function useDagreLayout(nodes: Node[], edges: Edge[], layoutKey: number): void {
  const nodesInitialized = useNodesInitialized();
  const { setNodes } = useReactFlow();
  const layoutApplied = useRef(false);

  // Reset the run-once guard whenever layoutKey changes so dagre re-runs
  useEffect(() => {
    layoutApplied.current = false;
  }, [layoutKey]);

  useEffect(() => {
    if (!nodesInitialized || layoutApplied.current) return;

    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 40 });

    nodes.forEach((node) => {
      g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    const positioned = nodes.map((node) => {
      const { x, y } = g.node(node.id);
      return {
        ...node,
        position: {
          x: x - NODE_WIDTH / 2,
          y: y - NODE_HEIGHT / 2,
        },
      };
    });

    setNodes(positioned);
    layoutApplied.current = true;
  }, [nodesInitialized, nodes, edges, setNodes, layoutKey]);
}
