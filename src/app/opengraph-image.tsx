import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Alphard — Run Expansion like a pipeline";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "radial-gradient(ellipse at top left, rgba(38,109,240,0.18) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(124,58,237,0.18) 0%, transparent 60%), #0F1218",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Top: logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="36" height="24" viewBox="0 0 50 34">
            <path
              d="M28.5534 0.939226C27.7358 0.313075 26.6038 0 25.0943 0C23.5849 0 22.3899 0.313075 21.5723 0.939226C20.7547 1.56538 20.0629 2.31677 19.434 3.25599L0 34H8.49056L24.7799 7.51381L24.8428 7.57643L32.956 20.6004L36.6037 26.4236L41.3836 33.9374H50L30.6918 3.19337C30.0629 2.31676 29.3711 1.56538 28.5534 0.939226Z"
              fill="#fff"
            />
          </svg>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>Alphard</div>
        </div>

        {/* Middle: headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 18,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 4, background: "#266DF0" }} />
            The Expansion OS for Account Managers
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 600,
              letterSpacing: "-0.045em",
              lineHeight: 1.0,
            }}
          >
            <span>Run </span>
            <span
              style={{
                background: "linear-gradient(135deg, #266DF0 0%, #7C3AED 60%, #F5360F 100%)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Expansion
            </span>
            <span> like a pipeline.</span>
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.65)",
              maxWidth: 920,
              lineHeight: 1.4,
            }}
          >
            Every signal in your book — usage, champion moves, ticket velocity, renewal proximity — fused into one ranked daily list of expansion plays.
          </div>
        </div>

        {/* Bottom: domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "rgba(255,255,255,0.40)",
            fontSize: 18,
            fontFamily: "monospace",
          }}
        >
          <div>alphard.global</div>
          <div>Sandbox · Live demo · No credit card</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
