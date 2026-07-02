const { createClient } = require('@supabase/supabase-js');
const sb = createClient(
  'https://wfrkuswmdbxvitvcbvpp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indmcmt1c3dtZGJ4dml0dmNidnBwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkwMDAzNywiZXhwIjoyMDk4NDc2MDM3fQ.e8ZYXqsg0-vTxFbw8FxQE41hd5nbXQVmCz1ti3_08L0'
);

async function main() {
  const { data, error } = await sb.from('vehicles').select('*');
  console.log('Error:', error);
  console.log('Vehicles:', JSON.stringify(data, null, 2));
}
main();
