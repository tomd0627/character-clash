const http = require("http");

async function testSearch(charName) {
  return new Promise((resolve) => {
    http
      .get(
        "http://localhost:5000/api/characters/search/" +
          encodeURIComponent(charName),
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              console.log(
                '✓ Search for "' + charName + '" returned:',
                Array.isArray(parsed)
                  ? "ARRAY with " + parsed.length + " item(s)"
                  : "OBJECT",
              );
              if (Array.isArray(parsed) && parsed.length > 0) {
                console.log("  - ID: " + parsed[0].id);
                console.log("  - Name: " + parsed[0].name);
              }
            } catch (e) {
              console.log("✗ Failed to parse response for " + charName);
            }
            resolve();
          });
        },
      )
      .on("error", (e) => {
        console.log("✗ Error: " + e.message);
        resolve();
      });
  });
}

(async () => {
  console.log("Testing search endpoints...\n");
  await testSearch("sailor moon");
  await testSearch("tanjiro");
  await testSearch("inuyasha");
})();
