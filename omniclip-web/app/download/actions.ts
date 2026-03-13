"use server";

import { redirect } from "next/navigation";

const GITHUB_PAT = process.env.GITHUB_PAT!;
const GITHUB_OWNER = process.env.GITHUB_OWNER ?? "jsunnykhan";
const GITHUB_REPO = process.env.GITHUB_REPO ?? "omniclip";

type AssetPlatform = "windows" | "mac-arm" | "mac-intel" | "linux";

const assetPatterns: Record<AssetPlatform, RegExp> = {
  "windows":   /\.exe$/i,
  "mac-arm":   /aarch64\.dmg$/i,
  "mac-intel": /x64\.dmg$/i,
  "linux":     /\.AppImage$/i,
};

async function fetchLatestRelease() {
  if (!GITHUB_PAT) {
    throw new Error("GITHUB_PAT is not configured");
  }
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 300 }, // cache 5 minutes
    }
  );
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export async function getLatestRelease() {
  try {
    const release = await fetchLatestRelease();
    return {
      version: release.tag_name as string,
      publishedAt: release.published_at as string,
      assets: release.assets as Array<{ name: string; browser_download_url: string; size: number }>,
    };
  } catch (e) {
    console.error("Failed to fetch release:", e);
    return null;
  }
}

export async function downloadRelease(formData: FormData) {
  const platform = formData.get("platform") as AssetPlatform;
  if (!platform || !assetPatterns[platform]) {
    throw new Error("Invalid platform");
  }

  const release = await fetchLatestRelease();
  const assets: Array<{ name: string; browser_download_url: string }> = release.assets;

  const asset = assets.find((a) => assetPatterns[platform].test(a.name));
  if (!asset) throw new Error("Asset not found for your platform");

  // Return the URL instead of redirecting so the client can trigger the browser download
  return asset.browser_download_url;
}
