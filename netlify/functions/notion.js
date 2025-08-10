const fetch = require('node-fetch');

exports.handler = async function(event, context){
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const NOTION_DB_ID = process.env.NOTION_DB_ID;

  if(!NOTION_TOKEN || !NOTION_DB_ID){
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' , 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'GET,OPTIONS'},
      body: JSON.stringify({ error: 'NOTION_TOKEN and NOTION_DB_ID must be set in environment variables' })
    };
  }

  const qs = event.queryStringParameters || {};
  const op = qs.op || 'list';

  try{
    if(op === 'list'){
      // Query the database (no filters) — paginated
      const url = `https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page_size: 100 })
      });
      if(!res.ok){
        const text = await res.text();
        return { statusCode: 502, headers:{'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ error: 'Notion API error', details: text }) };
      }
      const json = await res.json();
      // return results array
      return { statusCode: 200, headers:{ 'Content-Type':'application/json','Access-Control-Allow-Origin':'*' }, body: JSON.stringify(json.results) };
    }
    else if(op === 'get'){
      const id = qs.id;
      if(!id) return { statusCode:400, headers:{'Access-Control-Allow-Origin':'*'}, body: 'Missing id' };
      const url = `https://api.notion.com/v1/pages/${id}`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': '2022-06-28' } });
      if(!res.ok) return { statusCode:502, headers:{'Access-Control-Allow-Origin':'*'}, body: 'Notion error' };
      const json = await res.json();
      return { statusCode:200, headers:{ 'Content-Type':'application/json','Access-Control-Allow-Origin':'*' }, body: JSON.stringify(json) };
    }
    else{
      return { statusCode:400, headers:{'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ error: 'Unknown op' }) };
    }
  }catch(err){
    console.error('Function error', err);
    return { statusCode:500, headers:{'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ error: String(err) }) };
  }
};