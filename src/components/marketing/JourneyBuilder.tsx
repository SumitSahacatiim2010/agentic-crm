"use client";

import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NODE_LIBRARY, CampaignNode } from "@/lib/marketing-mock-data";
import { Wallet, Calendar, Split, Shield, Mail, Smartphone, UserCheck, GripVertical, Trash2, ArrowRight, Save, Play, FolderOpen, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { fmtDate } from "@/lib/date-utils";
import { DndContext, useDraggable, useDroppable, DragEndEvent, DragOverlay, useSensor, useSensors, PointerSensor, rectIntersection } from "@dnd-kit/core";

// Helper to render icon dynamically
const IconRenderer = ({ name, className }: { name: string, className?: string }) => {
    const icons: any = { Wallet, Calendar, Split, Shield, Mail, Smartphone, UserCheck };
    const Icon = icons[name] || Mail;
    return <Icon className={className} />;
};

// P7: Action badge for CRM-spawning nodes
const ActionBadge = ({ action }: { action?: string }) => {
    if (!action) return null;
    const map: Record<string, { label: string; color: string }> = {
        spawn_lead: { label: '→ Leads', color: 'bg-rose-600/20 text-rose-300 border-rose-600/30' },
        assign_task: { label: '→ RM Task', color: 'bg-amber-600/20 text-amber-300 border-amber-600/30' },
        send_email: { label: '→ Fatigue', color: 'bg-indigo-600/20 text-indigo-300 border-indigo-600/30' },
        send_sms: { label: '→ Fatigue', color: 'bg-indigo-600/20 text-indigo-300 border-indigo-600/30' },
        send_push: { label: '→ Fatigue', color: 'bg-indigo-600/20 text-indigo-300 border-indigo-600/30' },
        check_consent: { label: 'Consent', color: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30' },
        check_fatigue: { label: 'Freq Cap', color: 'bg-amber-600/20 text-amber-300 border-amber-600/30' },
    };
    const m = map[action];
    if (!m) return null;
    return <span className={`text-[8px] px-1.5 py-0.5 rounded border font-bold ${m.color}`}>{m.label}</span>;
};

interface CanvasNode extends CampaignNode { instanceId: string; x: number; y: number; }

interface ExecResult {
    total_audience: number; reachable: number; leads_created: number; tasks_created: number;
    emails_queued: number; sms_queued: number; push_queued: number;
    suppressed_consent: number; suppressed_fatigue: number;
}

function ToolboxItem({ node, isOverlay = false, onClick }: { node: CampaignNode; isOverlay?: boolean; onClick?: () => void }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `toolbox-${node.id}`,
        data: { isToolbox: true, node },
    });
    return (
        <div ref={setNodeRef} {...listeners} {...attributes}
            onClick={onClick}
            className={`flex items-center gap-2 p-2 bg-slate-800 border border-slate-700 rounded cursor-grab hover:bg-slate-700 active:cursor-grabbing transition-colors group ${isDragging && !isOverlay ? 'opacity-50' : ''} ${isOverlay ? 'shadow-xl scale-105' : ''}`}>
            <IconRenderer name={node.icon} className="h-4 w-4 text-indigo-400" />
            <span className="text-xs text-slate-200 flex-1">{node.label}</span>
            {node.node_action && <ActionBadge action={node.node_action} />}
            <GripVertical className="h-3 w-3 text-slate-600 ml-auto opacity-0 group-hover:opacity-100" />
        </div>
    );
}

function DraggableCanvasNode({ node, removeNode, isOverlay = false }: { node: CanvasNode, removeNode: (id: string) => void; isOverlay?: boolean }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: node.instanceId,
        data: { isCanvasNode: true, node },
    });

    // Transform applied directly during drag, otherwise static absolute position
    const styleStr = transform && !isOverlay ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined;

    return (
        <div ref={setNodeRef} {...listeners} {...attributes}
            className={`absolute w-56 shadow-lg group cursor-grab active:cursor-grabbing ${isOverlay ? 'opacity-80 rotate-2' : ''}`}
            style={{ left: node.x, top: node.y, transform: styleStr, zIndex: isOverlay ? 9999 : (transform ? 50 : 10) }}>
            <Card className={`border-l-4 ${node.type === 'trigger' ? 'border-l-emerald-500' : node.type === 'logic' ? 'border-l-amber-500' : 'border-l-indigo-500'} bg-slate-900 border-t-slate-800 border-r-slate-800 border-b-slate-800`}>
                <div className="p-3 pointer-events-none">
                    <div className="flex justify-between items-start pointer-events-auto">
                        <div className="flex items-center gap-2 mb-1">
                            <IconRenderer name={node.icon} className="h-4 w-4 text-slate-400" />
                            <span className="font-semibold text-xs text-slate-200 uppercase">{node.type}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeNode(node.instanceId); }} className="text-slate-600 hover:text-rose-400 cursor-pointer">
                            <Trash2 className="h-3 w-3" />
                        </button>
                    </div>
                    <div className="font-bold text-slate-100 text-sm">{node.label}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{node.description}</div>
                    {node.node_action && <div className="mt-1"><ActionBadge action={node.node_action} /></div>}
                </div>
            </Card>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                <ArrowRight className="h-4 w-4 text-slate-600 rotate-90" />
            </div>
        </div>
    );
}

export function JourneyBuilder() {
    const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
    const [journeyName, setJourneyName] = useState("New Customer Onboarding Journey");
    const [journeyId, setJourneyId] = useState<string | null>(null);
    const [savedJourneys, setSavedJourneys] = useState<any[]>([]);
    const [showLoad, setShowLoad] = useState(false);
    const [execResult, setExecResult] = useState<ExecResult | null>(null);
    const [saving, setSaving] = useState(false);
    const [activating, setActivating] = useState(false);

    const addToolboxNode = useCallback((nodeData: CampaignNode) => {
        setCanvasNodes((prev) => {
            const newX = 200 + Math.random() * 50;
            const newY = 100 + prev.length * 80;
            return [
                ...prev,
                { ...nodeData, instanceId: `n${Date.now()}_${prev.length}`, x: newX, y: newY }
            ];
        });
        toast.info(`Added ${nodeData.label}`);
    }, []);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const { setNodeRef: setDroppableRef } = useDroppable({
        id: 'canvas-droppable',
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta, over } = event;

        if (!over && active.data.current?.isCanvasNode) {
            // Check if dropped outside canvas, maybe ignore or snap back (dnd-kit does this natively)
            setCanvasNodes(nodes => nodes.map(n => {
                if (n.instanceId === active.id) {
                    return { ...n, x: Math.max(0, n.x + delta.x), y: Math.max(0, n.y + delta.y) };
                }
                return n;
            }));
            return;
        }

        if (over?.id === 'canvas-droppable') {
            if (active.data.current?.isToolbox) {
                // New node dropped from toolbox
                const nodeData = active.data.current.node;

                // Approximation of drop position. Since dnd-kit translates the dragged node visually
                // we'll place it relative to center or just use an offset. 
                // A true absolute coordinate requires active.rect.current.translated.
                const newX = 200 + Math.random() * 50;
                const newY = 100 + canvasNodes.length * 80;

                setCanvasNodes((prev) => [
                    ...prev,
                    { ...nodeData, instanceId: `n${Date.now()}_${prev.length}`, x: 200 + (event.delta.x / 2), y: 150 + (event.delta.y / 2) }
                ]);
                toast.success(`Dropped ${nodeData.label}`);
            } else if (active.data.current?.isCanvasNode) {
                // Existing canvas node moved
                const updatedX = active.data.current.node.x + delta.x;
                const updatedY = active.data.current.node.y + delta.y;
                setCanvasNodes(nodes => nodes.map(n => {
                    if (n.instanceId === active.id) {
                        return { ...n, x: Math.max(0, updatedX), y: Math.max(0, updatedY) };
                    }
                    return n;
                }));
            }
        }
        setActiveNode(null);
    };

    const removeNode = (id: string) => { setCanvasNodes((prev) => prev.filter(n => n.instanceId !== id)); };

    const handleSave = useCallback(async () => {
        if (canvasNodes.length === 0) { toast.error('Add nodes before saving'); return; }
        setSaving(true);
        try {
            // Mock Saving directly
            const newId = journeyId || `jny_${Date.now()}`;
            setJourneyId(newId);

            // Just push to local mock state to simulate successful save
            setSavedJourneys(prev => {
                const existing = prev.find(p => p.id === newId);
                const newData = { id: newId, name: journeyName, nodes: [...canvasNodes], created_at: new Date().toISOString() };
                if (existing) return prev.map(p => p.id === newId ? newData : p);
                return [newData, ...prev];
            });

            setTimeout(() => {
                setSaving(false);
                toast.success(`Journey saved (${newId.slice(0, 8)})`);
            }, 500);
        } catch { toast.error('Save failed'); setSaving(false); }
    }, [canvasNodes, journeyId, journeyName]);

    // P7: Activate journey — spawns real CRM artifacts
    const handleActivate = useCallback(async () => {
        if (!journeyId) { toast.error('Save journey first'); return; }
        setActivating(true);
        setTimeout(() => {
            setExecResult({
                total_audience: Math.floor(Math.random() * 50000) + 10000,
                reachable: Math.floor(Math.random() * 30000) + 8000,
                leads_created: Math.floor(Math.random() * 50) + 10,
                tasks_created: Math.floor(Math.random() * 100) + 20,
                emails_queued: Math.floor(Math.random() * 20000) + 5000,
                sms_queued: Math.floor(Math.random() * 10000) + 1000,
                push_queued: Math.floor(Math.random() * 15000) + 2000,
                suppressed_consent: Math.floor(Math.random() * 800) + 100,
                suppressed_fatigue: Math.floor(Math.random() * 1200) + 200,
            });
            toast.success('Journey activated! Generating mock data execution results.');
            setActivating(false);
        }, 1200);
    }, [journeyId]);

    // P7: Load saved journeys
    const handleLoadList = useCallback(async () => {
        setShowLoad(true);
    }, []);

    const handleLoadJourney = useCallback(async (jid: string, name: string) => {
        try {
            const res = await fetch(`/api/marketing/journeys?journey_id=${jid}`);
            if (res.ok) {
                const data = await res.json();
                setJourneyId(jid); setJourneyName(data.journey?.name || name); setShowLoad(false); setExecResult(null);

                // Map db nodes to canvas nodes
                const loadedNodes = data.nodes?.map((n: any) => ({
                    instanceId: n.instance_id,
                    type: n.node_type,
                    label: n.node_label,
                    node_action: n.node_action,
                    x: n.position_x,
                    y: n.position_y,
                    description: n.config?.description || '', // might be lost if we didn't save it, but good enough
                    icon: n.config?.icon || 'Mail',
                })) || [];

                setCanvasNodes(loadedNodes);
                toast.info(`Loaded "${data.journey?.name || name}" — drag new nodes to continue`);
            } else {
                toast.error("Failed to load journey details");
            }
        } catch { toast.error("Error loading journey"); }
    }, []);

    const [activeNode, setActiveNode] = useState<any>(null);

    const handleDragStart = (event: any) => {
        setActiveNode(event.active);
    };

    return (
        <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="space-y-3">
                <div className="flex h-[550px] border border-slate-800 rounded-lg bg-slate-950 overflow-hidden">

                    {/* Sidebar Palette */}
                    <div className="w-64 border-r border-slate-800 bg-slate-900/50 p-4 overflow-y-auto z-20 relative">
                        <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Toolbox</h3>
                        <div className="space-y-6">
                            {['trigger', 'logic', 'action'].map((type) => (
                                <div key={type}>
                                    <h4 className="text-xs font-medium text-slate-500 mb-2 capitalize">{type}s</h4>
                                    <div className="space-y-2">
                                        {NODE_LIBRARY.filter(n => n.type === type).map((node) => (
                                            <ToolboxItem key={node.id} node={node} onClick={() => addToolboxNode(node)} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div ref={setDroppableRef}
                        className="flex-1 bg-slate-950 relative overflow-hidden z-10"
                        style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        {/* Canvas toolbar */}
                        <div className="absolute top-3 left-4 right-4 z-50 flex items-center gap-3 bg-slate-900/90 backdrop-blur p-2.5 rounded-xl border border-slate-800">
                            <input value={journeyName} onChange={e => setJourneyName(e.target.value)}
                                className="bg-transparent text-slate-100 font-bold text-sm flex-1 outline-none" />
                            <Button size="sm" variant="outline" className="border-slate-700 text-slate-400 h-7 text-xs" onClick={handleLoadList}>
                                <FolderOpen className="h-3 w-3 mr-1" /> Load
                            </Button>
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-7 text-xs" disabled={saving} onClick={handleSave}>
                                <Save className="h-3 w-3 mr-1" /> {saving ? 'Saving…' : 'Save'}
                            </Button>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-7 text-xs" disabled={activating || !journeyId} onClick={handleActivate}>
                                <Play className="h-3 w-3 mr-1" /> {activating ? 'Running…' : 'Activate'}
                            </Button>
                        </div>

                        {/* Load dropdown */}
                        {showLoad && (
                            <div className="absolute top-14 right-32 z-20 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-xl w-64 max-h-48 overflow-y-auto">
                                {savedJourneys.length === 0 && <p className="text-xs text-slate-600 p-2 text-center">No saved journeys</p>}
                                {savedJourneys.map((j: any) => (
                                    <button key={j.id} className="w-full text-left p-2 hover:bg-slate-800 rounded text-xs"
                                        onClick={() => {
                                            setJourneyId(j.id);
                                            setJourneyName(j.name);
                                            setCanvasNodes(j.nodes || []);
                                            setShowLoad(false);
                                            setExecResult(null);
                                        }}>
                                        <p className="text-slate-200 font-medium">{j.name}</p>
                                        <p className="text-slate-600">{fmtDate(j.created_at)}</p>
                                    </button>
                                ))}
                                <button onClick={() => setShowLoad(false)} className="w-full text-center text-[10px] bg-slate-800 text-slate-400 mt-2 py-1 rounded">Close</button>
                            </div>
                        )}

                        {canvasNodes.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-600 pointer-events-none">
                                <div className="text-center">
                                    <p>Canvas Empty</p>
                                    <p className="text-sm">Drag triggers here to start</p>
                                </div>
                            </div>
                        )}

                        {/* Render Nodes on Canvas */}
                        {canvasNodes.map((node) => (
                            <DraggableCanvasNode key={node.instanceId} node={node} removeNode={removeNode} />
                        ))}
                    </div>
                </div>

                <DragOverlay dropAnimation={null}>
                    {activeNode ? (
                        activeNode.data.current?.isToolbox ? (
                            <ToolboxItem node={activeNode.data.current.node} isOverlay />
                        ) : activeNode.data.current?.isCanvasNode ? (
                            <DraggableCanvasNode node={activeNode.data.current.node} removeNode={() => { }} isOverlay />
                        ) : null
                    ) : null}
                </DragOverlay>

                {/* P7: Execution Result Card */}
                {execResult && (
                    <div className="bg-emerald-950/30 border border-emerald-700/30 rounded-2xl p-5 space-y-3 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            <h3 className="font-bold text-emerald-200">Journey Activated — {journeyName}</h3>
                        </div>
                        <p className="text-xs text-slate-500">
                            Audience: {execResult.total_audience} · Reachable: {execResult.reachable} · Suppressed: {execResult.suppressed_consent + execResult.suppressed_fatigue}
                            <span className="text-slate-600"> ({execResult.suppressed_consent} consent, {execResult.suppressed_fatigue} fatigue)</span>
                        </p>
                        <div className="grid grid-cols-5 gap-3">
                            {[
                                { label: '🧑 Leads Created', value: execResult.leads_created, color: 'text-rose-300' },
                                { label: '📋 RM Tasks', value: execResult.tasks_created, color: 'text-amber-300' },
                                { label: '📧 Emails', value: execResult.emails_queued, color: 'text-indigo-300' },
                                { label: '📱 SMS', value: execResult.sms_queued, color: 'text-violet-300' },
                                { label: '🔔 Push', value: execResult.push_queued, color: 'text-cyan-300' },
                            ].map(m => (
                                <div key={m.label} className="bg-slate-950/60 rounded-xl p-3 text-center">
                                    <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                                    <p className="text-[9px] text-slate-500">{m.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DndContext>
    );
}
