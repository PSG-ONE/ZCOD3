/**
 * Code node script for n8n that converts incoming items into a HTML table string.
 *
 * Usage:
 *   - Connect the Code node after any node that outputs data in the `json` property.
 *   - Copy & paste this script into the Code node (JavaScript mode).
 *   - The node outputs the generated HTML table string in the `output` field
 *     so you can use it directly in an email, webhook, or other nodes.
 */

// Gather all input items from previous nodes
const items = $input.all();

// Build the list of column names automatically from every row
const columns = Array.from(
  new Set(
    items.flatMap((item) => Object.keys(item.json ?? {})),
  ),
);

const hasData = items.length > 0 && columns.length > 0;

// Helper to escape HTML entities in cell values
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

let headerRow = '';
let bodyRows = '';

if (hasData) {
  // Compose the header and data rows when there is data
  headerRow = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('');

  bodyRows = items
    .map((item) => {
      const cells = columns.map((column) => {
        const value = item.json?.[column];
        return `<td>${value === undefined || value === null ? '' : escapeHtml(value)}</td>`;
      });
      return `<tr>${cells.join('')}</tr>`;
    })
    .join('');
} else {
  // Provide a minimal placeholder so the `output` field is never vacío
  headerRow = '<th>Mensaje</th>';
  bodyRows = '<tr><td>Sin datos disponibles para construir la tabla.</td></tr>';
}

const htmlTable = `
<table style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr style="background-color: #f0f0f0;">
      ${headerRow}
    </tr>
  </thead>
  <tbody>
    ${bodyRows}
  </tbody>
</table>
`;

// Expose the formatted table and metadata in the output
return [
  {
    json: {
      output: htmlTable.trim(),
      columns,
      rowCount: items.length,
      hasData,
    },
  },
];
