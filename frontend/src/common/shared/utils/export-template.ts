interface PdfTemplateProps {
  title: string;
  head: string;
  body: string;
  filters?: string;
  timestamp: string;
}

export function getPdfTemplate({ title, head, body, filters, timestamp }: PdfTemplateProps) {
  return `
    <html>
      <head>
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

          body {
            font-family: 'Inter', -apple-system, sans-serif;
            padding: 40px;
            color: #0f172a;
            line-height: 1.5;
            background-color: #fff;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 20px;
          }

          .brand {
            display: flex;
            flex-direction: column;
          }

          .brand-name {
            font-size: 24px;
            font-weight: 800;
            color: #00bfff;
            letter-spacing: -0.02em;
            text-transform: uppercase;
          }

          .brand-subtitle {
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
            margin-top: -2px;
          }

          .doc-info {
            text-align: right;
          }

          h1 {
            font-size: 28px;
            font-weight: 800;
            margin: 0 0 8px 0;
            color: #1e293b;
            letter-spacing: -0.03em;
          }

          .filters {
            font-size: 13px;
            color: #64748b;
            font-weight: 500;
            margin: 0;
          }

          .timestamp {
            font-size: 11px;
            color: #94a3b8;
            margin-top: 8px;
          }

          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 24px;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }

          th {
            background: #f8fafc;
            color: #475569;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 14px 12px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
          }

          td {
            padding: 12px;
            font-size: 12px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
          }

          tr:last-child td {
            border-bottom: none;
          }

          tr:nth-child(even) {
            background-color: #fbfcfe;
          }

          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
            font-weight: 500;
          }

          @media print {
            body { padding: 20px; }
            .header { margin-bottom: 20px; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">
            <span class="brand-name">Nagma Tattoo</span>
            <span class="brand-subtitle">Management System</span>
          </div>
          <div class="doc-info">
            <h1>${title}</h1>
            <p class="filters">${filters || 'Riepilogo dati contabili'}</p>
            <div class="timestamp">Generato il ${timestamp}</div>
          </div>
        </div>

        <table>
          <thead><tr>${head}</tr></thead>
          <tbody>${body}</tbody>
        </table>

        <div class="footer">
          <span>&copy; ${new Date().getFullYear()} Nagma Tattoo Studio - Documento ad uso contabile</span>
          <span>Pagina 1 di 1</span>
        </div>
      </body>
    </html>
  `;
}
