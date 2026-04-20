import { NextResponse, type NextRequest } from "next/server";
import {
  deleteRuntimeAuthConfig,
  generateOwnerToken,
  getPublicStatus,
  isRuntimeWriteAllowed,
  readRuntimeAuthConfig,
  writeRuntimeAuthConfig,
} from "@/lib/auth/runtime-config";

/** Récupère l’état (sans secrets). */
export async function GET() {
  const status = await getPublicStatus();
  return NextResponse.json(status);
}

type Body = {
  authSecret?: string;
  discord?: {
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
  };
  steam?: {
    realm?: string;
  };
};

/**
 * Met à jour la config runtime.
 * - 1ʳᵉ écriture : libre, génère un `ownerToken` retourné une seule fois.
 * - Écritures suivantes : header `x-rp-admin-token` requis.
 * - En production sans `ALLOW_RUNTIME_AUTH_CONFIG=true` : 403.
 */
export async function POST(request: NextRequest) {
  if (!isRuntimeWriteAllowed()) {
    return NextResponse.json(
      {
        error:
          "Modification désactivée en production. Définissez ALLOW_RUNTIME_AUTH_CONFIG=true pour activer.",
      },
      { status: 403 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const current = await readRuntimeAuthConfig();
  const provided = request.headers.get("x-rp-admin-token");
  let newToken: string | undefined;

  if (current.ownerToken) {
    if (provided !== current.ownerToken) {
      return NextResponse.json(
        { error: "Token admin invalide. Réinitialisez la config si vous l’avez perdu." },
        { status: 401 },
      );
    }
  } else {
    newToken = generateOwnerToken();
  }

  const next = {
    authSecret: body.authSecret?.trim() || undefined,
    discord: {
      clientId: body.discord?.clientId?.trim() || undefined,
      clientSecret: body.discord?.clientSecret?.trim() || undefined,
      redirectUri: body.discord?.redirectUri?.trim() || undefined,
    },
    steam: {
      realm: body.steam?.realm?.trim() || undefined,
    },
    ownerToken: newToken ?? current.ownerToken,
  };

  await writeRuntimeAuthConfig(next);
  const status = await getPublicStatus();

  return NextResponse.json({
    ok: true,
    ownerToken: newToken,
    status,
  });
}

/** Réinitialise la config runtime (efface aussi le token). */
export async function DELETE(request: NextRequest) {
  if (!isRuntimeWriteAllowed()) {
    return NextResponse.json({ error: "Désactivé en production." }, { status: 403 });
  }
  const current = await readRuntimeAuthConfig();
  const provided = request.headers.get("x-rp-admin-token");
  if (current.ownerToken && provided !== current.ownerToken) {
    return NextResponse.json({ error: "Token admin invalide." }, { status: 401 });
  }
  await deleteRuntimeAuthConfig();
  const status = await getPublicStatus();
  return NextResponse.json({ ok: true, status });
}
