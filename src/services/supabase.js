const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = () => SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your_');

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async request(endpoint, options = {}) {
    if (!this.url || !this.key) {
      return { data: null, error: { message: 'Supabase not configured' }, status: 500 };
    }
    const response = await fetch(`${this.url}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.key,
        ...(options.headers || {}),
      },
    });
    const data = await response.json();
    return { data, error: response.ok ? null : data, status: response.status };
  }

  auth = {
    signUp: async (email, password) => {
      if (!isConfigured()) {
        const demoId = 'demo-' + Date.now();
        return { data: { user: { id: demoId } }, error: null };
      }
      return this.request('/auth/v1/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    signIn: async (email, password) => {
      if (!isConfigured()) {
        const demoId = 'demo-' + Date.now();
        return { data: { user: { id: demoId, email }, session: { access_token: 'demo-token-' + Date.now() } }, error: null };
      }
      return this.request('/auth/v1/token?grant_type=password', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    signOut: async () => {
      if (!isConfigured()) return { error: null };
      return this.request('/auth/v1/logout', { method: 'POST' });
    },
    getSession: async () => {
      if (!isConfigured()) return { data: { session: null }, error: null };
      return this.request('/auth/v1/session', { method: 'GET' });
    },
    getUser: async () => {
      if (!isConfigured()) return { data: { user: { id: 'demo-user' } }, error: null };
      return this.request('/auth/v1/user', { method: 'GET' });
    },
  };

  from(table) {
    const self = this;
    return {
      select: (columns = '*') => ({
        eq: (column, value) => ({
          single: async () => {
            if (!isConfigured()) return { data: null, error: null };
            return self.request(`/${table}?${column}=${encodeURIComponent(value)}&limit=1`, { method: 'GET' });
          },
          order: (column, { ascending = true } = {}) => ({
            limit: (n) => ({
              then: (cb) => cb({ data: [], error: null })
            })
          }),
        }),
        order: () => ({
          limit: () => ({ data: [], error: null })
        }),
      }),
      insert: async (data) => {
        if (!isConfigured()) {
          console.log(`[Demo] Insert into ${table}:`, data);
          return { data: [{ ...data, id: 'demo-' + Date.now() }], error: null };
        }
        return self.request(`/${table}`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      },
      update: (data) => ({
        eq: async (column, value) => {
          if (!isConfigured()) {
            console.log(`[Demo] Update ${table}:`, { column, value, data });
            return { data: [data], error: null };
          }
          return self.request(`/${table}?${column}=${encodeURIComponent(value)}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          });
        },
      }),
      delete: () => ({
        eq: async (column, value) => {
          if (!isConfigured()) return { data: null, error: null };
          return self.request(`/${table}?${column}=${encodeURIComponent(value)}`, { method: 'DELETE' });
        },
      }),
    };
  }

  storage = {
    from: (bucket) => ({
      upload: async (path, file) => {
        if (!isConfigured()) {
          return { data: { path: `demo/${path}` }, error: null };
        }
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${this.url}/storage/v1/object/${bucket}/${path}`, {
          method: 'POST',
          headers: { 'apikey': this.key },
          body: formData,
        });
        const data = await response.json();
        return { data, error: response.ok ? null : data };
      },
      getPublicUrl: (path) => ({ data: { publicUrl: `${this.url}/storage/v1/object/public/${bucket}/${path}` } }),
    }),
  };
}

export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const saveAssessment = async (userId, assessment) => {
  const { data, error } = await supabase.from('assessments').insert({
    user_id: userId,
    total_score: assessment.totalScore,
    risk_level: assessment.riskLevel.level,
    breakdown: assessment.breakdown,
    country_scores: assessment.countryScores,
    risk_factors: assessment.risks,
    action_plans: assessment.actions,
  });
  
  return { data, error };
};

export const getUserAssessments = async (userId) => {
  const { data, error } = await supabase.from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export default supabase;
