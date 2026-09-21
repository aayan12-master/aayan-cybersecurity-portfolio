CREATE TABLE IF NOT EXISTS public.admin_login_rate_limits (
    ip_hash TEXT PRIMARY KEY,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    blocked_until TIMESTAMPTZ NULL,
    last_failed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_login_rate_limits ENABLE ROW LEVEL SECURITY;

-- No policies for public or authenticated. Only service_role can access.

-- Atomic record failure function
CREATE OR REPLACE FUNCTION atomic_record_login_failure(p_ip_hash TEXT, p_block_minutes INTEGER DEFAULT 15)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempts INTEGER;
    v_blocked_until TIMESTAMPTZ;
BEGIN
    INSERT INTO public.admin_login_rate_limits (ip_hash, failed_attempts, last_failed_at, updated_at, blocked_until)
    VALUES (p_ip_hash, 1, now(), now(), NULL)
    ON CONFLICT (ip_hash) DO UPDATE
    SET 
        failed_attempts = 
            CASE 
                WHEN public.admin_login_rate_limits.blocked_until IS NOT NULL AND public.admin_login_rate_limits.blocked_until < now() THEN 1
                ELSE public.admin_login_rate_limits.failed_attempts + 1 
            END,
        last_failed_at = now(),
        updated_at = now(),
        blocked_until = 
            CASE
                WHEN (
                    CASE 
                        WHEN public.admin_login_rate_limits.blocked_until IS NOT NULL AND public.admin_login_rate_limits.blocked_until < now() THEN 1
                        ELSE public.admin_login_rate_limits.failed_attempts + 1 
                    END
                ) >= 5 THEN now() + (p_block_minutes || ' minutes')::interval
                ELSE NULL
            END
    RETURNING failed_attempts, blocked_until INTO v_attempts, v_blocked_until;

    RETURN json_build_object(
        'failed_attempts', v_attempts,
        'blocked_until', v_blocked_until,
        'is_blocked', v_blocked_until IS NOT NULL AND v_blocked_until > now()
    )::jsonb;
END;
$$;

-- Atomic reset function (on success)
CREATE OR REPLACE FUNCTION atomic_reset_login_failures(p_ip_hash TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.admin_login_rate_limits
    SET 
        failed_attempts = 0,
        blocked_until = NULL,
        last_failed_at = NULL,
        updated_at = now()
    WHERE ip_hash = p_ip_hash;
END;
$$;

-- Read current status function (just to check before calling auth)
CREATE OR REPLACE FUNCTION check_login_rate_limit(p_ip_hash TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_blocked_until TIMESTAMPTZ;
BEGIN
    SELECT blocked_until INTO v_blocked_until
    FROM public.admin_login_rate_limits
    WHERE ip_hash = p_ip_hash;

    IF v_blocked_until IS NOT NULL AND v_blocked_until > now() THEN
        RETURN true; -- true means blocked
    END IF;

    RETURN false; -- false means not blocked
END;
$$;
