import { ipAddress } from '@vercel/functions';
import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

async function hashIp(ip: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(ip));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const ip = ipAddress(request) || '127.0.0.1';
    
    // Server-only secrets
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hashSecret = process.env.RATE_LIMIT_HASH_SECRET;
    const blockMinutes = parseInt(process.env.ADMIN_LOGIN_BLOCK_MINUTES || '15', 10);
    
    // Public keys available to Vercel build (or injected by Vercel integrations)
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey || !hashSecret) {
      console.error("Missing required server environment variables");
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const ipHash = await hashIp(ip, hashSecret);

    // 1. Check rate limit status using service role
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: limitCheck, error: limitError } = await adminSupabase.rpc('check_login_rate_limit', {
      p_ip_hash: ipHash
    });

    if (limitError) {
      console.error("Rate limit check error:", limitError);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    if (limitCheck === true) {
      return new Response(JSON.stringify({ error: 'Too many login attempts. Please try again later.' }), { 
        status: 429, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 2. Attempt login using ANON key
    const authSupabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: authData, error: authError } = await authSupabase.auth.signInWithPassword({
      email,
      password
    });

    // 3. Handle failure
    if (authError || !authData.session) {
      const { data: recordData, error: recordError } = await adminSupabase.rpc('atomic_record_login_failure', {
        p_ip_hash: ipHash,
        p_block_minutes: blockMinutes
      });

      if (recordError) {
        console.error("Failed to record login failure:", recordError);
      }

      if (recordData && recordData.is_blocked) {
        return new Response(JSON.stringify({ error: 'Too many login attempts. Please try again later.' }), { 
          status: 429, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      return new Response(JSON.stringify({ error: 'Invalid username or password.' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 4. Handle success
    const { error: resetError } = await adminSupabase.rpc('atomic_reset_login_failures', {
      p_ip_hash: ipHash
    });

    if (resetError) {
      console.error("Failed to reset login failures:", resetError);
    }

    // Return the session object that frontend needs
    return new Response(JSON.stringify({
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        user: authData.session.user
      }
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });

  } catch (error: any) {
    console.error("Login handler error:", error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
