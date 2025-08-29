



if (richImageKey) {
  properties[richImageKey] = { rich_text: [{ type: 'text', text: { content: `images-base64: ${meta}` } }] };
  } else if (notesRichKey) {
  properties[notesRichKey] = { rich_text: [{ type: 'text', text: { content: `images-base64: ${meta}` } }] };
  }
  
  
  
  // Children relation: try to resolve to notion page ids
  const relations = [];
  if (children && Array.isArray(children) && children.length > 0 && childrenKey) {
  for (const c of children) {
  try {
  if (looksLikeNotionId(c)) {
  relations.push({ id: c });
  continue;
  }
  
  
  // Otherwise assume c is a tag/title to search for
  const filter = {
  property: titleKey,
  title: { equals: String(c) }
  };
  
  
  const qRes = await notion.databases.query({ database_id: NOTION_DATABASE_ID, filter, page_size: 1 });
  if (qRes.results && qRes.results.length > 0) {
  relations.push({ id: qRes.results[0].id });
  } else {
  // not found: skip. (Alternatively we could create a page for the child if desired.)
  console.warn(`Child not found in Notion DB for title: ${c}`);
  }
  } catch (innerErr) {
  console.error('Error resolving child', c, innerErr.message || innerErr);
  }
  }
  
  
  if (relations.length > 0) {
  properties[childrenKey] = { relation: relations };
  }
  }
  
  
  // If owner was not mapped earlier to a property but owner exists, append to notes
  if (!ownerKey && owner) {
  const txt = `Owner: ${owner}`;
  if (notesRichKey) properties[notesRichKey] = { rich_text: [{ type: 'text', text: { content: txt } }] };
  }
  
  
  // Create the page
  const createRes = await notion.pages.create({ parent: { database_id: NOTION_DATABASE_ID }, properties });
  console.log("Notion response:", createRes);
  
  
  // Instead of returning the entire Notion response (which can contain circular or complex structures),
  // return a small, safe object with the page id and a readable title. Log full response server-side if needed.
  const pageInfo = { id: createRes.id };
  const titleText = extractTitleFromPage(createRes, titleKey);
  if (titleText) pageInfo.title = titleText;
  if (createRes.url) pageInfo.url = createRes.url;
  
  
  // Log the full createRes for debugging in server logs (do not expose to client)
  console.log('Notion page created:', createRes.id);
  
  
  return {try: { statusCode: 201, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ success: true, notionPage: pageInfo }) },
   catch (err) {
  // Helpful server-side logging for Netlify function logs
  console.error("Notion error:", err.body || err.message || err);
  console.error('Error in addCow function:', err);
  const detail = err && err.message ? err.message : String(err);
  return { statusCode: 500, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Server error', detail }) };
  }
  };
  
