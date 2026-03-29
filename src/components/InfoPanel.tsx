import type { Node } from '@xyflow/react';
import type { ActivityNodeData, ResourceNodeData } from '@/types/graph.types';

interface InfoPanelProps {
  selectedNode: Node<ActivityNodeData | ResourceNodeData> | null;
}

const PRIORITY_STYLES: Record<ActivityNodeData['priority'], string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

function Field({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}


function ActivityDetail({ node }: { node: Node<ActivityNodeData> }) {
  const { data } = node;
  const rtoLabel = data.rto_hours === 1 ? '1 hour' : `${data.rto_hours} hours`;
  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Activity</p>
        <h2 className="text-lg font-semibold text-gray-900 leading-tight">{data.name}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium bg-blue-100 text-blue-700 rounded-full px-3 py-1">Activity</span>
        <span className={`text-xs font-medium rounded-full px-3 py-1 ${PRIORITY_STYLES[data.priority]}`}>
          {data.priority.charAt(0).toUpperCase() + data.priority.slice(1)}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <Field label="RTO" value={rtoLabel} />
        <Field label="Owner" value={data.owner} />
      </div>
    </div>
  );
}

function ResourceDetail({ node }: { node: Node<ResourceNodeData> }) {
  const { data } = node;
  const typeLabel = data.resource_type.replace('_', ' ');
  const typeLabelFormatted = typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1);
  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Resource</p>
        <h2 className="text-lg font-semibold text-gray-900 leading-tight">{data.name}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-medium bg-green-100 text-green-700 rounded-full px-3 py-1">
          Resource — {typeLabelFormatted}
        </span>
      </div>
      {data.isSPOF && (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-sm text-amber-800">
            ⚠️ {data.dependencyCount} activities depend on this resource — single point of failure
          </div>
          {data.dependingActivityNames.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Depended on by</p>
              <ul className="flex flex-col gap-0.5 pl-1">
                {data.dependingActivityNames.map((actName) => (
                  <li key={actName} className="text-sm text-gray-700 flex items-start gap-1.5">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                    {actName}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
      <div className="flex flex-col gap-3">
        <Field label="Contact" value={data.contact} />
        {data.vendor && <Field label="Vendor" value={data.vendor} />}
      </div>
    </div>
  );
}

export default function InfoPanel({ selectedNode }: Readonly<InfoPanelProps>) {
  const visible = selectedNode !== null;
  return (
    <aside
      style={{ width: '320px' }}
      className={`absolute top-0 right-0 h-full bg-white border-l border-gray-200 flex flex-col overflow-y-auto shadow-lg transition-transform duration-200 ${visible ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {visible && (
        selectedNode.type === 'activity' ? (
          <ActivityDetail node={selectedNode as Node<ActivityNodeData>} />
        ) : (
          <ResourceDetail node={selectedNode as Node<ResourceNodeData>} />
        )
      )}
    </aside>
  );
}
