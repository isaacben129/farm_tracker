export async function handler(event) {
    try {
      const { name, breed, age, photo } = JSON.parse(event.body);
  
      const notionRes = await fetch(`https://api.notion.com/v1/pages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28"
        },
        body: JSON.stringify({
          parent: { database_id: process.env.NOTION_DB_ID },
          properties: {
            Name: { title: [{ text: { content: name } }] },
            Breed: { rich_text: [{ text: { content: breed } }] },
            Age: { number: parseInt(age) },
            Photo: { files: [{ name: "Cow Photo", external: { url: photo } }] }
          }
        })
      });
  
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }
  