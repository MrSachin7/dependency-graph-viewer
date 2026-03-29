export interface ActivityNodeData extends Record<string, unknown> {
  name: string;
  rto_hours: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
}

export interface ResourceNodeData extends Record<string, unknown> {
  name: string;
  resource_type: 'technology' | 'third_party' | 'people' | 'building' | 'equipment';
  contact: string;
  vendor?: string;
  isSPOF: boolean;
  dependencyCount: number;
  dependingActivityNames: string[];
}

export interface GraphJsonNode {
  id: string;
  type: 'activity' | 'resource';
  name: string;
  rto_hours?: number;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  owner?: string;
  resource_type?: 'technology' | 'third_party' | 'people' | 'building' | 'equipment';
  contact?: string;
  vendor?: string;
}

export interface GraphJsonEdge {
  from: string;
  to: string;
}

export interface GraphJson {
  nodes: GraphJsonNode[];
  dependencies: GraphJsonEdge[];
}
