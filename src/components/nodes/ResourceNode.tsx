import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import type { ResourceNodeData } from '@/types/graph.types';

type ResourceFlowNode = Node<ResourceNodeData, 'resource'>;

const TYPE_BADGES: Record<ResourceNodeData['resource_type'], string> = {
  technology: '💻 TECH',
  third_party: '🔗 3P',
  people: '👥 PEOPLE',
  building: '🏢 BLDG',
  equipment: '⚙️ EQUIP',
};

const ResourceNode = memo(function ResourceNode({ data, selected }: NodeProps<ResourceFlowNode>) {
  return (
    <div
      className={`relative w-40 bg-white border-2 border-green-600 rounded-md px-3 py-2 flex flex-col gap-1 transition-opacity duration-150${
        data.isSPOF && !selected ? ' ring-2 ring-amber-400' : selected ? ' ring-2 ring-blue-500' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="bg-green-400!" />
      {data.isSPOF && (
        <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-[18px] h-[18px] rounded-full bg-amber-400 text-white text-[10px] font-bold leading-none">
          {data.dependencyCount}
        </span>
      )}
      <span className="text-[13px] font-medium text-green-600 leading-tight truncate w-full">
        {data.name}
      </span>
      <span className="self-start text-[10px] font-medium text-gray-500 bg-gray-100 rounded px-1 leading-tight">
        {TYPE_BADGES[data.resource_type]}
      </span>
    </div>
  );
});

export default ResourceNode;
