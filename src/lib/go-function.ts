import { buildPlayRedirect } from "./redirect";

export interface GoPagesEnv {
  MEGAPOT_PLAY_DESTINATION?: string;
}

export function onRequest(context: { env: GoPagesEnv }): Response {
  return Response.redirect(
    buildPlayRedirect(context.env.MEGAPOT_PLAY_DESTINATION),
    302,
  );
}
