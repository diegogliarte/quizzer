import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "$env/static/public";

const supabase: Handle = async ({ event, resolve }) => {
  /**
   * Creates a Supabase client specific to this server request.
   *
   * The Supabase client gets the Auth token from the request cookies.
   */
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        /**
         * SvelteKit's cookies API requires `path` to be explicitly set in
         * the cookie options. Setting `path` to `/` replicates previous/
         * standard behavior.
         */
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: "/" });
          });
        },
      },
    },
  );

  /**
   * Unlike `supabase.auth.getSession()`, which returns the session _without_
   * validating the JWT, this function also calls `getUser()` to validate the
   * JWT before returning the session.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession();
    if (!session) {
      return { session: null, user: null };
    }

    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser();
    if (error) {
      // JWT validation has failed
      return { session: null, user: null };
    }

    return { session, user };
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      /**
       * Supabase libraries use the `content-range` and `x-supabase-api-version`
       * headers, so we need to tell SvelteKit to pass it through.
       */
      return name === "content-range" || name === "x-supabase-api-version";
    },
  });
};

const protectedRoutes = ["/dashboard", "/quiz", "/profile", "/unauthorized"];

const authGuard: Handle = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  const requiresAuth = protectedRoutes.some((route) =>
    event.url.pathname.startsWith(route),
  );
  const isAuthPage = event.url.pathname.startsWith("/auth");

  if (!session && requiresAuth) {
    return redirect(303, "/auth/login");
  }

  if (session && isAuthPage) {
    return redirect(303, "/");
  }

  if (!session && isAuthPage) {
    return resolve(event);
  }

  const { data: whitelist, error } = await event.locals.supabase
    .from("whitelist")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  if (error && !whitelist) {
    if (event.url.pathname === "/unauthorized") {
      return resolve(event);
    }
    return redirect(303, "/unauthorized");
  }

  if (whitelist && event.url.pathname === "/unauthorized") {
    return redirect(303, "/");
  }

  return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
