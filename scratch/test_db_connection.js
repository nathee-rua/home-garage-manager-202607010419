const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  'vehicles',
  'service_rules',
  'service_events',
  'repair_events',
  'renewals',
  'planned_jobs',
  'providers',
  'attachments',
  'service_categories'
];

async function testConnection() {
  console.log("=== STARTING DATABASE CONNECTION TEST FOR ALL TABLES ===");
  console.log("Connecting to:", supabaseUrl);
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.log(`❌ Table "${table}": Connection FAILED - ${error.message}`);
    } else {
      // Fetch actual rows (limit 2)
      const { data: rows } = await supabase.from(table).select('*').limit(2);
      console.log(`✅ Table "${table}": Connection SUCCESSFUL`);
      console.log(`   - Row count: ${count}`);
      console.log(`   - Sample data: ${JSON.stringify(rows)}`);
    }
  }
}

testConnection();
