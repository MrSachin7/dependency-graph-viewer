"use client";
"use no memo";

import '@xyflow/react/dist/style.css'; // REQUIRED — missing this = blank canvas

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  useNodesInitialized,
  type Node,
  type Edge,
} from '@xyflow/react';
import ActivityNode from '@/components/nodes/ActivityNode';
import ResourceNode from '@/components/nodes/ResourceNode';
import InfoPanel from '@/components/InfoPanel';
import Toolbar from '@/components/Toolbar';
import { useDagreLayout } from '@/hooks/useDagreLayout';
import type { ActivityNodeData, ResourceNodeData } from '@/types/graph.types';

// MUST be at module scope — defining inside component body causes all 23 nodes to remount on every render
const nodeTypes = {
  activity: ActivityNode,
  resource: ResourceNode,
};

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function applySortOrder(
  nodes: Node<ActivityNodeData | ResourceNodeData>[],
  sortActivities: boolean,
  sortResources: boolean,
): Node<ActivityNodeData | ResourceNodeData>[] {
  return nodes.slice().sort((a, b) => {
    const aIsActivity = a.type === 'activity';
    const bIsActivity = b.type === 'activity';
    // Only sort within same type; preserve cross-type relative order
    if (aIsActivity !== bIsActivity) return 0;
    if (aIsActivity && sortActivities) {
      const aP = PRIORITY_ORDER[(a.data as ActivityNodeData).priority] ?? 99;
      const bP = PRIORITY_ORDER[(b.data as ActivityNodeData).priority] ?? 99;
      return aP - bP;
    }
    if (!aIsActivity && sortResources) {
      const aD = a.data as ResourceNodeData;
      const bD = b.data as ResourceNodeData;
      // SPOF first, then by dependencyCount descending
      if (aD.isSPOF !== bD.isSPOF) return aD.isSPOF ? -1 : 1;
      return bD.dependencyCount - aD.dependencyCount;
    }
    return 0;
  });
}

interface GraphCanvasProps {
  initialNodes: Node<ActivityNodeData | ResourceNodeData>[];
  initialEdges: Edge[];
}

// Inner component: must render inside <ReactFlow> context to use RF hooks
function GraphLayout({
  nodes,
  edges,
  onLayoutApplied,
  layoutKey,
}: {
  nodes: Node[];
  edges: Edge[];
  onLayoutApplied: () => void;
  layoutKey: number;
}) {
  const nodesInitialized = useNodesInitialized();
  useDagreLayout(nodes, edges, layoutKey);

  useEffect(() => {
    if (nodesInitialized) onLayoutApplied();
  }, [nodesInitialized, onLayoutApplied]);

  return null; // renders no DOM — side effects only
}

export default function GraphCanvas({ initialNodes, initialEdges }: Readonly<GraphCanvasProps>) {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [layoutReady, setLayoutReady] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [sortActivities, setSortActivities] = useState(false);
  const [sortResources, setSortResources] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);

  // Reset all transient state when initialNodes reference changes (i.e., after router.refresh()
  // delivers fresh server props). Multiple setStates here are intentional: they atomically reset
  // every piece of transient client state, equivalent to a fresh page load.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSortActivities(false);
    setSortResources(false);
    setLayoutKey(k => k + 1);
    setSelectedNodeId(null);
    /* eslint-enable react-hooks/set-state-in-effect */
    setNodes(initialNodes.map(n => ({ ...n, style: { ...n.style, opacity: 1 } })));
  }, [initialNodes, setNodes]);

  const handleReload = useCallback(() => {
    router.refresh();
  }, [router]);

  // Toggle handlers apply sort, update nodes, and bump layoutKey synchronously in event handlers —
  // avoids calling plain setState inside effects which triggers react-hooks/set-state-in-effect.
  const handleToggleSortActivities = useCallback(() => {
    setSortActivities(prev => {
      const next = !prev;
      setNodes(applySortOrder(initialNodes, next, sortResources).map(n => ({ ...n, style: { ...n.style, opacity: 1 } })));
      setLayoutKey(k => k + 1);
      setSelectedNodeId(null);
      return next;
    });
  }, [initialNodes, sortResources, setNodes]);

  const handleToggleSortResources = useCallback(() => {
    setSortResources(prev => {
      const next = !prev;
      setNodes(applySortOrder(initialNodes, sortActivities, next).map(n => ({ ...n, style: { ...n.style, opacity: 1 } })));
      setLayoutKey(k => k + 1);
      setSelectedNodeId(null);
      return next;
    });
  }, [initialNodes, sortActivities, setNodes]);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(prev => prev === node.id ? null : node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  useEffect(() => {
    if (selectedNodeId === null) {
      setNodes(nds => nds.map(n => ({ ...n, style: { ...n.style, opacity: 1 } })));
      setEdges(eds => eds.map(e => ({ ...e, style: { ...e.style, opacity: 1 } })));
      return;
    }
    // Read current edges inside the functional updater — avoids adding `edges` to deps,
    // which would cause the effect to re-run after every setEdges call (infinite loop).
    setEdges(eds => {
      const connectedNodeIds = new Set<string>([selectedNodeId]);
      const connectedEdgeIds = new Set<string>();
      eds.forEach(e => {
        if (e.source === selectedNodeId || e.target === selectedNodeId) {
          connectedEdgeIds.add(e.id);
          connectedNodeIds.add(e.source);
          connectedNodeIds.add(e.target);
        }
      });
      setNodes(nds =>
        nds.map(n => ({ ...n, style: { ...n.style, opacity: connectedNodeIds.has(n.id) ? 1 : 0.2 } }))
      );
      return eds.map(e => ({ ...e, style: { ...e.style, opacity: connectedEdgeIds.has(e.id) ? 1 : 0.2 } }));
    });
  }, [selectedNodeId, setNodes, setEdges]);

  const selectedNode = selectedNodeId
    ? (nodes.find(n => n.id === selectedNodeId) as Node<ActivityNodeData | ResourceNodeData> | undefined) ?? null
    : null;

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        onReload={handleReload}
        sortActivities={sortActivities}
        onToggleSortActivities={handleToggleSortActivities}
        sortResources={sortResources}
        onToggleSortResources={handleToggleSortResources}
      />
      <div style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>
        <div
          style={{ flex: 1, height: '100%' }}
          className={layoutReady ? 'opacity-100 transition-opacity duration-300' : 'opacity-0'}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            fitView
            fitViewOptions={{ padding: 0.1 }}
            attributionPosition="bottom-right"
          >
            <Background
              variant={BackgroundVariant.Dots}
              color="#d1d5db"
              gap={20}
              size={1}
            />
            <Controls />
            <GraphLayout
              nodes={nodes}
              edges={edges}
              onLayoutApplied={() => setLayoutReady(true)}
              layoutKey={layoutKey}
            />
          </ReactFlow>
        </div>
        <InfoPanel selectedNode={selectedNode} />
      </div>
    </div>
  );
}
