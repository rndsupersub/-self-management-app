// components/Sidebar.js
"use client";

import { useState, useEffect } from "react";

export default function Sidebar({
  activities,
  selectedId,
  onSelect,
  collapsed,
  setCollapsed
}) {
  const [expanded, setExpanded] = useState({});

  // Auto expand parent dari selectedId
  useEffect(() => {
    if (!selectedId) return;

    const findParent = (items, targetId, path = []) => {
      for (const item of items) {
        if (item.id === targetId) return path;
        if (item.children) {
          const result = findParent(item.children, targetId, [...path, item.id]);
          if (result) return result;
        }
      }
      return null;
    };

    const parents = findParent(activities, selectedId);
    if (parents) {
      const newExpanded = { ...expanded };
      parents.forEach(id => { newExpanded[id] = true; });
      setExpanded(newExpanded);
    }
  }, [selectedId, activities]);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTree = (items, depth = 0) => {
    return items.map(item => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expanded[item.id];
      const isSelected = selectedId === item.id;

      return (
        <div key={item.id} className="select-none">
          <div
            className={`flex items-center gap-1 py-1.5 px-2 rounded cursor-pointer hover:bg-base-300 transition ${
              isSelected ? 'bg-primary/20 text-primary font-medium' : ''
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => {
              if (hasChildren) {
                toggleExpand(item.id);
              }
              onSelect(item.id);
            }}
          >
            {hasChildren && (
              <span className="text-xs w-4">
                {isExpanded ? '▼' : '▶'}
              </span>
            )}
            <span className="flex-1 text-sm truncate">{item.label}</span>
          </div>

          {hasChildren && isExpanded && (
            <div className="ml-2 border-l border-base-300 pl-1">
              {renderTree(item.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (collapsed) {
    return (
      <div className="h-full flex flex-col items-center py-4">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setCollapsed(false)}
          title="Expand sidebar"
        >
          ☰
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border-r border-base-300 bg-base-100">
      <div className="flex items-center justify-between p-2 border-b border-base-300">
        <span className="text-sm font-bold">📋 Aktivitas</span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setCollapsed(true)}
          title="Collapse sidebar"
        >
          «
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {renderTree(activities)}
      </div>

      <div className="p-2 border-t border-base-300 text-xs text-base-content/50">
        {activities.length} aktivitas
      </div>
    </div>
  );
}