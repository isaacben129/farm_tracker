export async function handler(event) {
    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    const NOTION_DB_ID = process.env.NOTION_DB_ID;
  
    const headers = {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };
  
    if (event.httpMethod === 'GET') {
      const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
        method: 'POST',
        headers
      });
      const data = await res.json();
      return { statusCode: 200, body: JSON.stringify(data) };
    }
  
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parent: { database_id: NOTION_DB_ID },
          properties: {
            Name: { title: [{ text: { content: body.name } }] },
            Age: { number: body.age },
            Breed: { rich_text: [{ text: { content: body.breed } }] },
            "Milk Production (L/day)": { number: body.milk },
            Photo: { files: [{ name: "photo", external: { url: body.photoUrl } }] }
          }
        })
      });
      const data = await res.json();
      return { statusCode: 200, body: JSON.stringify(data) };
    }
  
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  