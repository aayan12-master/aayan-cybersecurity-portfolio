// Query the Supabase schema for roadmap_items column definitions
const url = 'https://veqweanbhzpxpfbfdria.supabase.co/rest/v1/roadmap_items?select=*&limit=1';
const apikey = 'sb_publishable_qX6TZJCgbmhjkbO33-sFJQ_7nzYBf7I';

async function main() {
  // 1. Fetch one row to see all columns returned by DB
  const res = await fetch(url, {
    headers: {
      'apikey': apikey,
      'Authorization': `Bearer ${apikey}`
    }
  });
  const rows = await res.json();
  if (rows.length > 0) {
    console.log('Columns returned by DB:', Object.keys(rows[0]));
    console.log('Sample row:', JSON.stringify(rows[0], null, 2));
  }

  // 2. Try inserting a minimal row WITHOUT created_at to confirm the error
  const testPayload = {
    id: 'schema-test-' + Math.random().toString(36).slice(2),
    year: 'Test',
    title: 'Schema Test',
    description: 'Testing schema',
    status: 'planned',
    order: 99
    // deliberately omitting created_at
  };

  console.log('\n--- INSERT without created_at ---');
  const insertRes = await fetch('https://veqweanbhzpxpfbfdria.supabase.co/rest/v1/roadmap_items', {
    method: 'POST',
    headers: {
      'apikey': apikey,
      'Authorization': `Bearer ${apikey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(testPayload)
  });
  console.log('Status:', insertRes.status, insertRes.statusText);
  const insertBody = await insertRes.text();
  console.log('Response:', insertBody);

  // 3. Try inserting WITH created_at to confirm it works
  const testPayloadWithDate = {
    ...testPayload,
    id: 'schema-test2-' + Math.random().toString(36).slice(2),
    created_at: new Date().toISOString()
  };

  console.log('\n--- INSERT with created_at ---');
  const insertRes2 = await fetch('https://veqweanbhzpxpfbfdria.supabase.co/rest/v1/roadmap_items', {
    method: 'POST',
    headers: {
      'apikey': apikey,
      'Authorization': `Bearer ${apikey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(testPayloadWithDate)
  });
  console.log('Status:', insertRes2.status, insertRes2.statusText);
  const insertBody2 = await insertRes2.text();
  console.log('Response:', insertBody2);

  // 4. Clean up any test rows that got inserted
  if (insertRes2.status === 201) {
    const del = await fetch(`https://veqweanbhzpxpfbfdria.supabase.co/rest/v1/roadmap_items?id=eq.${testPayloadWithDate.id}`, {
      method: 'DELETE',
      headers: {
        'apikey': apikey,
        'Authorization': `Bearer ${apikey}`
      }
    });
    console.log('\nCleanup delete status:', del.status);
  }
}

main().catch(console.error);
