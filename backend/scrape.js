const axios = require('axios');
const cheerio = require('cheerio');
const errorLogOperations = require('./errorLogOperations');

async function scrapeWayneData(access_id) {
  const URL = `https://wayne.edu/search-advanced?accessid=${access_id}`;

  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    const results = [];

    // Select each row in the table with class "table-stack"
    $('table.table-stack tbody tr').each((_, row) => {
      // Extract <td> cells
      const tds = $(row).find('td');

      // Name is in the first cell, inside an <a>:
      const rawName = tds.eq(0).find('a').text().trim(); // e.g. "Smith, John Robert"
      // Split into last/first if it’s always "LastName, FirstName"
      let firstName = '';
      let lastName = '';
      if (rawName.includes(',')) {
        const [last, first] = rawName.split(',');
        lastName = (last || '').trim();
        firstName = (first || '').trim();
        firstName = firstName.split(' ')[0]; // get only the first name, ignore the middle name
      } else {
        // If there's no comma (unusual case)
        firstName = rawName;
      }

      // Title (e.g., "Student Assistant")
      const title = tds.eq(1).text().trim();

      // Push the data object into our results array
      results.push({
        firstName,
        lastName,
        title
      });
    });

    return results;
  } catch (error) {
    errorLogOperations.logError(error);
    console.error('Error occurred while scraping:', error);
    return null;
  }
}

module.exports = { scrapeWayneData };
