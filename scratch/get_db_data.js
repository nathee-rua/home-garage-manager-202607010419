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

async function main() {
  console.log("=== CONNECTING TO SUPABASE ===");
  console.log("URL:", supabaseUrl);
  
  // 1. Fetch Auth Users
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error("Error fetching users:", authError.message);
  } else {
    console.log(`\n=== USERS (${users.length}) ===`);
    users.forEach(u => console.log(`- ID: ${u.id}\n  Username: ${u.user_metadata?.username || 'N/A'}\n  Email: ${u.email}\n  Created: ${u.created_at}`));
  }

  // 2. Fetch Vehicles
  const { data: vehicles, error: vError } = await supabase.from('vehicles').select('*');
  if (vError) {
    console.error("Error fetching vehicles:", vError.message);
  } else {
    console.log(`\n=== VEHICLES (${vehicles.length}) ===`);
    vehicles.forEach(v => console.log(`- ID: ${v.id}\n  Brand: ${v.brand}\n  Model: ${v.model}\n  Plate: ${v.plate_no}\n  Odometer: ${v.odometer} km\n  User ID: ${v.user_id}`));
  }

  // 3. Fetch Planned Jobs
  const { data: plannedJobs, error: pjError } = await supabase.from('planned_jobs').select('*');
  if (pjError) {
    console.error("Error fetching planned jobs:", pjError.message);
  } else {
    console.log(`\n=== PLANNED JOBS (${plannedJobs.length}) ===`);
    plannedJobs.forEach(pj => console.log(`- ID: ${pj.id}\n  Vehicle ID: ${pj.vehicle_id}\n  Title: ${pj.title}\n  Target Date: ${pj.target_date}\n  Target Odo: ${pj.target_odometer}\n  Priority: ${pj.priority}`));
  }

  // 4. Fetch Service Events
  const { data: serviceEvents, error: seError } = await supabase.from('service_events').select('*');
  if (seError) {
     console.error("Error fetching service events:", seError.message);
  } else {
     console.log(`\n=== SERVICE EVENTS (${serviceEvents.length}) ===`);
     serviceEvents.forEach(se => console.log(`- ID: ${se.id}\n  Vehicle ID: ${se.vehicle_id}\n  Category: ${se.category}\n  Cost Parts: ${se.cost_parts}\n  Cost Labor: ${se.cost_labor}`));
  }
}

main();
