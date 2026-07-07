import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const iconBuffer = await readFile(path.join(process.cwd(), "public", "logo-icon.png"));
  const iconSrc = `data:image/png;base64,${iconBuffer.toString("base64")}`;
  const wordmarkBuffer = await readFile(path.join(process.cwd(), "public", "logo-wordmark.png"));
  const wordmarkSrc = `data:image/png;base64,${wordmarkBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAFAFA",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={iconSrc} width={160} height={141} style={{ marginBottom: 32 }} alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={wordmarkSrc} width={230} height={85} alt="Wazzy" />
        <div style={{ display: "flex", fontSize: 34, fontWeight: 500, color: "#64748B", marginTop: 20 }}>
          Your 24/7 AI Receptionist
        </div>
      </div>
    ),
    { ...size }
  );
}
