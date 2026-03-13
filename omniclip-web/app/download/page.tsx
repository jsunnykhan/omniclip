import type { Metadata } from "next";
import { getLatestRelease } from "./actions";
import { DownloadClient } from "@/app/download/download-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Download",
  description: "Download OmniClip for Windows, macOS (Apple Silicon & Intel), and Linux. Free universal clipboard sync.",
  openGraph: {
    title: "Download OmniClip",
    description: "Free download for Windows, macOS, and Linux.",
  },
};

export default async function DownloadPage() {
  let release = null;
  let error = null;

  try {
    release = await getLatestRelease();
  } catch {
    error = "Could not fetch the latest release. Please try again later.";
  }

  return <DownloadClient release={release} error={error} />;
}
