async function testSearch() {
  const query = 'RM 11-03';
  const url = `https://ticker24watches.com/wp-json/wc/store/v1/products?search=${encodeURIComponent(query)}&per_page=5`;
  console.log(`Querying: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log(`Status: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`Found ${data.length} matches.`);
      if (data.length > 0) {
        console.log(`First match:`);
        console.log(`Name: ${data[0].name}`);
        console.log(`Images:`, data[0].images.map(img => img.src));
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testSearch();
