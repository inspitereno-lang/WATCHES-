async function testFetch() {
  let page = 1;
  let all = [];
  while (true) {
    const url = `https://ticker24watches.com/wp-json/wc/store/v1/products?per_page=100&page=${page}`;
    console.log(`Fetching page ${page}...`);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!res.ok) {
        console.log(`Stop status: ${res.status}`);
        break;
      }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        console.log(`Empty page.`);
        break;
      }
      all = all.concat(data);
      console.log(`Fetched ${data.length} products. Total so far: ${all.length}`);
      page++;
      // Just a small safety break to avoid infinite loops in test
      if (page > 15) break;
    } catch (e) {
      console.error('Error:', e.message);
      break;
    }
  }
  console.log(`Total retrieved: ${all.length}`);
}

testFetch();
