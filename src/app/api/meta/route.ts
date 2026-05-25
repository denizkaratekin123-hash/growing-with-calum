import { NextResponse } from "next/server";

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const META_AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "current"; // "current" or "new"

  if (!META_ACCESS_TOKEN || !META_AD_ACCOUNT_ID) {
    return NextResponse.json(
      { error: "Meta API credentials not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch campaigns first to identify current vs new
    const campaignsUrl = `https://graph.facebook.com/v21.0/${META_AD_ACCOUNT_ID}/campaigns?fields=id,name,status,objective,created_time&access_token=${META_ACCESS_TOKEN}`;
    const campaignsRes = await fetch(campaignsUrl);
    const campaignsData = await campaignsRes.json();

    if (campaignsData.error) {
      return NextResponse.json(
        { error: campaignsData.error.message },
        { status: 400 }
      );
    }

    // Get insights for the ad account (aggregated)
    const insightsUrl = `https://graph.facebook.com/v21.0/${META_AD_ACCOUNT_ID}/insights?fields=spend,impressions,clicks,ctr,cpc,actions,cost_per_action_type,reach,frequency&date_preset=last_30d&access_token=${META_ACCESS_TOKEN}`;
    const insightsRes = await fetch(insightsUrl);
    const insightsData = await insightsRes.json();

    if (insightsData.error) {
      return NextResponse.json(
        { error: insightsData.error.message },
        { status: 400 }
      );
    }

    // Get campaign-level insights
    const campaignInsightsUrl = `https://graph.facebook.com/v21.0/${META_AD_ACCOUNT_ID}/insights?fields=campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,actions,cost_per_action_type&level=campaign&date_preset=last_30d&access_token=${META_ACCESS_TOKEN}`;
    const campaignInsightsRes = await fetch(campaignInsightsUrl);
    const campaignInsightsData = await campaignInsightsRes.json();

    // Process the data
    const insights = insightsData.data?.[0] || {};
    const campaignInsights = campaignInsightsData.data || [];

    // Extract conversions (leads, purchases, etc.) from actions
    const actions = insights.actions || [];
    const costPerAction = insights.cost_per_action_type || [];

    const leads = actions.find((a: any) => a.action_type === "lead")?.value || 0;
    const purchases = actions.find((a: any) => a.action_type === "purchase")?.value || 0;
    const conversions = actions.find((a: any) =>
      a.action_type === "lead" ||
      a.action_type === "omni_complete_registration" ||
      a.action_type === "complete_registration"
    )?.value || 0;

    const costPerLead = costPerAction.find((a: any) => a.action_type === "lead")?.value || 0;
    const costPerPurchase = costPerAction.find((a: any) => a.action_type === "purchase")?.value || 0;

    // Format the response
    const metrics = {
      spend: parseFloat(insights.spend || 0).toFixed(2),
      impressions: parseInt(insights.impressions || 0).toLocaleString(),
      clicks: parseInt(insights.clicks || 0).toLocaleString(),
      ctr: parseFloat(insights.ctr || 0).toFixed(2),
      cpc: parseFloat(insights.cpc || 0).toFixed(2),
      reach: parseInt(insights.reach || 0).toLocaleString(),
      frequency: parseFloat(insights.frequency || 0).toFixed(2),
      leads: parseInt(leads).toLocaleString(),
      purchases: parseInt(purchases).toLocaleString(),
      conversions: parseInt(conversions).toLocaleString(),
      costPerLead: parseFloat(costPerLead).toFixed(2),
      costPerPurchase: parseFloat(costPerPurchase).toFixed(2),
    };

    const campaigns = campaignInsights.map((c: any) => ({
      id: c.campaign_id,
      name: c.campaign_name,
      spend: parseFloat(c.spend || 0).toFixed(2),
      impressions: parseInt(c.impressions || 0).toLocaleString(),
      clicks: parseInt(c.clicks || 0).toLocaleString(),
      ctr: parseFloat(c.ctr || 0).toFixed(2),
      cpc: parseFloat(c.cpc || 0).toFixed(2),
    }));

    return NextResponse.json({
      success: true,
      metrics,
      campaigns,
      totalCampaigns: campaignsData.data?.length || 0,
      dateRange: "Last 30 days",
    });
  } catch (error) {
    console.error("Meta API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Meta data" },
      { status: 500 }
    );
  }
}
