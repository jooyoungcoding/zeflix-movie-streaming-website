import { createServerSupabaseClient } from "@/libs/supabaseServer";
import { Profile } from "@/types/Profile";
import {
  SignUpRequest,
  SignUpResponse,
  LoginRequest,
  LoginResponse,
} from "../auth.type";

export const findProfileByUsername = async (
  username: string
): Promise<Profile | null> => {
  const supabaseServer = await createServerSupabaseClient();
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Profile) || null;
};

export const findProfileById = async (
  profileId: string
): Promise<Profile | null> => {
  const supabaseServer = await createServerSupabaseClient();
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  let profile = (data as Profile) || null;

  // If avatar_url or profile is missing, check server user metadata to auto-sync
  try {
    const supabaseServer = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (user && user.id === profileId) {
      const metaAvatar =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null;
      const metaName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        null;

      if (!profile) {
        const username =
          user.user_metadata?.user_name ||
          user.email?.split("@")[0] ||
          `user_${user.id.slice(0, 8)}`;

        const { data: newProfile } = await supabaseServer
          .from("profiles")
          .upsert(
            {
              profile_id: user.id,
              email: user.email || "",
              username,
              display_name: metaName || username,
              avatar_url: metaAvatar,
            },
            { onConflict: "profile_id" }
          )
          .select()
          .single();

        if (newProfile) {
          profile = newProfile as Profile;
        }
      } else if (!profile.avatar_url && metaAvatar) {
        await supabaseServer
          .from("profiles")
          .update({ avatar_url: metaAvatar })
          .eq("profile_id", profileId);
        profile = { ...profile, avatar_url: metaAvatar };
      }
    }
  } catch {
    // Ignore cookie/SSR error in non-request contexts
  }

  return profile;
};

export const findProfileByEmail = async (
  email: string
): Promise<Profile | null> => {
  const supabaseServer = await createServerSupabaseClient();
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Profile) || null;
};

export const signUpRepository = async (
  data: SignUpRequest,
  originUrl?: string
): Promise<SignUpResponse> => {
  const supabaseServer = await createServerSupabaseClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    originUrl ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const cleanSiteUrl = siteUrl.replace(/\/+$/, "");

  // Generate unique username for DB constraint safety if needed
  let finalUsername = data.username;
  try {
    const existingByUsername = await findProfileByUsername(data.username);
    if (existingByUsername && existingByUsername.email !== data.email) {
      finalUsername = `${data.username}_${Math.floor(1000 + Math.random() * 9000)}`;
    }
  } catch {
    // If lookup fails, use data.username
  }

  const { data: authData, error: authError } = await supabaseServer.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${cleanSiteUrl}/verify`,
      data: {
        username: finalUsername,
        display_name: data.username,
      },
    },
  });

  if (authError) {
    throw authError;
  }

  const user = authData.user;
  if (!user) {
    throw new Error("Failed to register user");
  }

  const { data: profileData } = await supabaseServer
    .from("profiles")
    .upsert(
      {
        profile_id: user.id,
        email: user.email || data.email,
        username: finalUsername,
        display_name: data.username,
        avatar_url: null,
      },
      { onConflict: "profile_id" }
    )
    .select()
    .single();

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile: (profileData as Profile) || null,
    message: "Registration successful! Please check your email to verify your account.",
  };
};

export const loginRepository = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  // Must use server client so Supabase can set session cookies via the SSR adapter
  const supabaseServer = await createServerSupabaseClient();

  const { data: authData, error: authError } =
    await supabaseServer.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

  if (authError) {
    if (authError.message.toLowerCase().includes("email not confirmed")) {
      throw new Error("Email not confirmed. Please verify your email before logging in.");
    }
    throw authError;
  }

  const user = authData.user;
  if (!user) {
    throw new Error("Failed to sign in");
  }

  // Strict check: account must have confirmed email
  if (!user.email_confirmed_at && !user.confirmed_at) {
    await supabaseServer.auth.signOut();
    throw new Error("Email not confirmed. Please verify your email before logging in.");
  }

  // Retrieve user profile
  const { data: profileData, error: profileError } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to query profile on login:", profileError);
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile: (profileData as Profile) || null,
    message: "Login successful!",
    session: authData.session
      ? {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        }
      : null,
  };
};

export const googleLoginRepository = async (): Promise<string> => {
  const supabaseServer = await createServerSupabaseClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  const cleanSiteUrl = siteUrl.replace(/\/+$/, "");

  const { data, error } = await supabaseServer.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${cleanSiteUrl}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.url) {
    throw new Error("Google OAuth URL was not generated");
  }

  return data.url;
};

export const exchangeCodeForSessionRepository = async (
  code: string
): Promise<void> => {
  const supabaseServer = await createServerSupabaseClient();
  const { data, error } = await supabaseServer.auth.exchangeCodeForSession(code);

  if (error) {
    throw error;
  }

  // Sync profile for authenticated OAuth user
  if (data?.user) {
    const user = data.user;
    const { data: existingProfile } = await supabaseServer
      .from("profiles")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle();

    const username =
      existingProfile?.username ||
      user.user_metadata?.user_name ||
      user.user_metadata?.full_name?.replace(/\s+/g, "").toLowerCase() ||
      user.email?.split("@")[0] ||
      `user_${user.id.slice(0, 8)}`;

    const displayName =
      existingProfile?.display_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      username;

    const avatarUrl =
      existingProfile?.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null;

    await supabaseServer.from("profiles").upsert(
      {
        profile_id: user.id,
        email: user.email || existingProfile?.email || "",
        username: username,
        display_name: displayName,
        avatar_url: avatarUrl,
      },
      { onConflict: "profile_id" }
    );
  }
};

export const getCurrentUserRepository = async (): Promise<{
  user: { id: string; email?: string };
  profile: Profile | null;
} | null> => {
  const supabaseServer = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  const avatarUrl =
    profile?.avatar_url ||
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null;

  const displayName =
    profile?.display_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    profile?.username ||
    null;

  const mergedProfile: Profile = profile
    ? {
        ...profile,
        avatar_url: avatarUrl,
        display_name: displayName,
      }
    : {
        profile_id: user.id,
        email: user.email || "",
        username:
          user.user_metadata?.user_name ||
          user.email?.split("@")[0] ||
          `user_${user.id.slice(0, 8)}`,
        display_name: displayName,
        avatar_url: avatarUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile: mergedProfile,
  };
};

export const logoutRepository = async (): Promise<void> => {
  const supabaseServer = await createServerSupabaseClient();
  const { error } = await supabaseServer.auth.signOut();

  if (error) {
    throw error;
  }
};




