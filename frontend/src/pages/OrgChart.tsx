import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  ChevronRight, 
  ChevronDown, 
  User, 
  Briefcase, 
  Layers, 
  Mail
} from 'lucide-react';

interface OrgNode {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  role: string;
  profileImage: string;
  status: string;
  children: OrgNode[];
}

export const OrgChart: React.FC = () => {
  const [treeData, setTreeData] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<OrgNode | null>(null);

  const fetchTree = async () => {
    try {
      setLoading(true);
      const res = await api.get('organization/tree');
      setTreeData(res.tree);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve organizational structure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Constructing organizational tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400">
        <h3 className="font-bold text-lg">Error loading hierarchy</h3>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Visual Hierarchy Tree */}
      <div className="lg:col-span-2 glass-panel border rounded-3xl p-6 lg:p-8 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Reporting Tree</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Click on any employee node to view their contact card and direct reports.
          </p>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {treeData.map((node) => (
            <TreeNode key={node._id} node={node} level={0} onSelect={setSelectedEmployee} selectedId={selectedEmployee?._id} />
          ))}
          {treeData.length === 0 && (
            <div className="text-center py-10 text-slate-500">No organizational data available.</div>
          )}
        </div>
      </div>

      {/* Selected Employee Card */}
      <div className="glass-panel border rounded-3xl p-6 lg:p-8 shadow-sm h-fit space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Contact Profile</h3>
        
        {selectedEmployee ? (
          <div className="space-y-6 animate-fade-in">
            {/* Avatar Header */}
            <div className="flex flex-col items-center text-center">
              <img 
                src={selectedEmployee.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedEmployee.name}`} 
                alt={selectedEmployee.name} 
                className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 shadow-sm"
              />
              <h4 className="text-lg font-extrabold text-slate-800 dark:text-white mt-4">{selectedEmployee.name}</h4>
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full mt-1">
                {selectedEmployee.designation}
              </p>
            </div>

            {/* Employee details */}
            <div className="space-y-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 text-sm">
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                <Layers className="w-4 h-4 text-slate-400" />
                <span><strong className="text-slate-700 dark:text-slate-300">Dept:</strong> {selectedEmployee.department}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span><strong className="text-slate-700 dark:text-slate-300">ID:</strong> {selectedEmployee.employeeId}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${selectedEmployee.email}`} className="hover:text-brand-500 truncate">
                  {selectedEmployee.email}
                </a>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                <User className="w-4 h-4 text-slate-400" />
                <span><strong className="text-slate-700 dark:text-slate-300">System Role:</strong> {selectedEmployee.role}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mr-1.5"
                  style={{ backgroundColor: selectedEmployee.status === 'Active' ? '#22c55e' : '#f59e0b' }} 
                />
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  {selectedEmployee.status}
                </span>
              </div>
            </div>

            {/* Direct Reports Count */}
            {selectedEmployee.children.length > 0 && (
              <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
                <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Direct Reports ({selectedEmployee.children.length})
                </h5>
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {selectedEmployee.children.map((child) => (
                    <div 
                      key={child._id}
                      onClick={() => setSelectedEmployee(child)}
                      className="flex items-center space-x-3 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 hover:border-brand-400 dark:hover:border-brand-500/50 cursor-pointer transition-all duration-200"
                    >
                      <img 
                        src={child.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${child.name}`} 
                        alt={child.name} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="overflow-hidden">
                        <h6 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{child.name}</h6>
                        <p className="text-[10px] text-slate-400 truncate">{child.designation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500 font-semibold text-sm">
            Select an employee from the tree to view contact information.
          </div>
        )}
      </div>
    </div>
  );
};

/* Recursive Tree Node Component */
interface TreeNodeProps {
  node: OrgNode;
  level: number;
  onSelect: (node: OrgNode) => void;
  selectedId?: string;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, onSelect, selectedId }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node._id;

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="space-y-2 select-none">
      {/* Node Row */}
      <div 
        onClick={() => onSelect(node)}
        style={{ paddingLeft: `${level * 16}px` }}
        className="flex items-center space-x-2 group cursor-pointer"
      >
        {/* Connection Line indicator */}
        {level > 0 && (
          <div className="w-4 h-px border-t border-dashed border-slate-300 dark:border-slate-700 mr-1 self-center" />
        )}
        
        {/* Toggle Collapse Button */}
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          {hasChildren ? (
            <button 
              onClick={toggleOpen}
              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500"
            >
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          )}
        </div>

        {/* Node Body Card */}
        <div 
          className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border flex-1 transition-all duration-200
            ${isSelected 
              ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10' 
              : 'border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
        >
          <img 
            src={node.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${node.name}`} 
            alt={node.name} 
            className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-brand-500 transition-colors">
              {node.name}
            </h4>
            <p className="text-[10px] text-slate-400 truncate font-medium">{node.designation}</p>
          </div>
          {node.children.length > 0 && (
            <span className="ml-auto text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
              {node.children.length} reports
            </span>
          )}
        </div>
      </div>

      {/* Children Nodes (Recursive) */}
      {hasChildren && isOpen && (
        <div className="relative">
          {/* Vertical alignment line guide */}
          <div 
            style={{ left: `${(level * 16) + 9}px` }}
            className="absolute top-0 bottom-2 w-px border-l border-dashed border-slate-300 dark:border-slate-700"
          />
          <div className="space-y-2">
            {node.children.map((child) => (
              <TreeNode 
                key={child._id} 
                node={child} 
                level={level + 1} 
                onSelect={onSelect} 
                selectedId={selectedId} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
