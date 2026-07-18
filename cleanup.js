const fs = require('fs');
const dotenvStr = fs.readFileSync('.env', 'utf8');
const env = {};
dotenvStr.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[match[1]] = val;
  }
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanup() {
  console.log('Deleting all events...');
  // Since we don't have a truncate RPC and Supabase requires a filter for delete, 
  // we filter by not equal to a fake uuid
  const { error: eErr } = await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (eErr) console.error('Events delete error:', eErr);
  else console.log('Events (and cascaded data) deleted successfully.');

  console.log('Deleting dummy admin users from DB...');
  const { error: uErr } = await supabase.from('users').delete().eq('role', 'admin');
  if (uErr) console.error('Users delete error:', uErr);
  else console.log('Dummy admins deleted from users table.');
}

cleanup();
