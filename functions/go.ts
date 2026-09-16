import { buildPlayRedirect } from "../src/lib/redirect";

interface PagesEnv {
  MEGAPOT_PLAY_DESTINATION?: string;
}

export function onRequest(context: { env: PagesEnv }): Response {
  return Response.redirect(
    buildPlayRedirect(context.env.MEGAPOT_PLAY_DESTINATION),
    302,
  );
}
