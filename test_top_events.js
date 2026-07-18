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
async function run() {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      name,
      slug,
      location_name,
      start_time,
      status,
      banner_image_url,
      participants (count),
      attendances (count)
    `)
    .eq('status', 'published')
    .order('start_time', { ascending: true })
    .limit(5);
  console.log('Error:', error);
  console.log('Data:', JSON.stringify(data, null, 2));
}
run();
