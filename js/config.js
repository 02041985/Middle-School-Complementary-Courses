// Public Supabase settings. The publishable key is safe in the browser: row-level security
// limits every teacher to their own rows in planbook_docs.
window.PB_CONFIG = {
  supabaseUrl: "https://zbvicgxsstbebcgykitm.supabase.co",
  supabaseKey: "sb_publishable__pkhBsx_5OB0TDRaCJZKTA_OUv_0f_3"
};

// School sign-up without a confirmation email: @maplewood.school accounts are created already confirmed by the
// pb-signup function, so sign-up never waits on the email limit. Other addresses use normal sign-up.
// Teachers still need the administrator's approval in the teacher portal.
(function () {
  const lib = window.supabase;
  if (!lib || lib.__pbSignup) return;
  lib.__pbSignup = true;
  const create = lib.createClient;
  lib.createClient = function (url, key, opts) {
    const client = create.call(this, url, key, opts);
    if (!client || !client.auth || typeof client.auth.signUp !== "function") return client;
    const signUp = client.auth.signUp.bind(client.auth);
    client.auth.signUp = async function (args) {
      const email = String((args && args.email) || "").trim().toLowerCase();
      if (/@maplewood\.school$/.test(email)) {
        try {
          const r = await fetch(url + "/functions/v1/pb-signup", { method: "POST", headers: { "content-type": "application/json", apikey: key },
            body: JSON.stringify({ email, password: args.password, data: (args.options && args.options.data) || {} }) });
          const j = await r.json().catch(() => ({}));
          if (!r.ok && j.error) return { data: { user: null, session: null }, error: { message: j.error } };
          if (r.ok && !j.fallback) {
            const s = await client.auth.signInWithPassword({ email, password: args.password });
            if (!s.error) return { data: { user: s.data.user, session: s.data.session }, error: null };
            return { data: { user: null, session: null }, error: { message: j.exists ? "That email already has an account. Sign in instead, or use Forgot password." : s.error.message } };
          }
        } catch (e) { /* fall back to normal sign-up */ }
      }
      return signUp(args);
    };
    return client;
  };
})();
