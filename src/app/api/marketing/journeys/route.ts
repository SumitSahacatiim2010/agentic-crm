import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge-client';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const journey_id = searchParams.get('journey_id');

        if (journey_id) {
            const { data: journey } = await insforge.database.from('marketing_journeys').select('*').eq('journey_id', journey_id).single();
            const { data: nodes } = await insforge.database.from('journey_nodes').select('*').eq('journey_id', journey_id);
            // edges aren't in current DB schema from P7, but simulated here via config or separate table if it existed
            // returning format expected by JourneyBuilder
            return NextResponse.json({ journey, nodes: nodes ?? [], edges: [] });
        } else {
            const { data } = await insforge.database
                .from('marketing_journeys')
                .select('journey_id, name, status, campaign_type, created_at')
                .order('created_at', { ascending: false });
            return NextResponse.json(data ?? []);
        }
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
    try {
        const { journey_id, name, campaign_type, description, nodes, edges, status } = await req.json();
        if (!name || (!nodes?.length && !journey_id)) return NextResponse.json({ error: 'name and nodes required' }, { status: 400 });

        let jid = journey_id;

        if (jid) {
            // Update existing
            await insforge.database.from('marketing_journeys')
                .update({
                    name,
                    campaign_type,
                    description,
                    status: status || 'Draft',
                    updated_at: new Date().toISOString()
                }).eq('journey_id', jid);

            // Replace nodes
            await insforge.database.from('journey_nodes').delete().eq('journey_id', jid);
        } else {
            // Create new
            const { data } = await insforge.database.from('marketing_journeys')
                .insert([{ name, campaign_type, description, status: status || 'Draft' }])
                .select('journey_id').limit(1);
            jid = (data as any)?.[0]?.journey_id;
        }

        // Insert nodes (add edges to config if edges provided to persist them since there's no journey_edges table)
        if (nodes && nodes.length > 0) {
            const nodeRows = nodes.map((n: any) => ({
                journey_id: jid,
                instance_id: n.instanceId || n.instance_id,
                node_type: n.type || n.node_type,
                node_label: n.label || n.node_label,
                node_action: n.node_action ?? null,
                position_x: n.x ?? n.position_x ?? 0,
                position_y: n.y ?? n.position_y ?? 0,
                config: n.config ? { ...n.config, edges } : { edges },
            }));
            await insforge.database.from('journey_nodes').insert(nodeRows);
        }

        return NextResponse.json({ journey_id: jid }, { status: 201 });
    } catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }); }
}
