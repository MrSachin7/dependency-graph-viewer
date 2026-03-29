import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { ActivityNodeData } from '@/types/graph.types';

type ActivityFlowNode = Node<ActivityNodeData, 'activity'>;

const ActivityNode = memo(function ActivityNode({ data, selected }: NodeProps<ActivityFlowNode>) {
  return (
    <div className={`w-40 h-16 bg-white border-2 border-blue-600 rounded-lg flex flex-col items-center justify-center px-3 py-2 overflow-hidden transition-opacity duration-150${selected ? ' ring-2 ring-blue-500' : ''}`}>
      <Handle type="target" position={Position.Top} className="bg-blue-400!" />
      <span className="text-[13px] font-medium text-blue-600 text-center leading-tight truncate w-full">
        {data.name}
      </span>
      <span className="text-[11px] text-blue-400 leading-tight">
        {data.rto_hours}h RTO
      </span>
      <Handle type="source" position={Position.Bottom} className="bg-blue-400!" />
    </div>
  );
});

export default ActivityNode;
