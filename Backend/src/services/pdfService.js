import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import he from 'he';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let browserInstance = null;

const getBrowser = async () => {
    if (!browserInstance) {
        browserInstance = await chromium.launch({ headless: true });
    }
    return browserInstance;
};

export const generatePdfFromHtml = async (htmlContent) => {
    let page;
    let context;

    try {
        let html = he.decode(htmlContent);

        // Strip markdown code-block fences thoroughly
        html = html.replace(/^```[a-z]*\s*/gi, '').replace(/\s*```$/gi, '');
        html = html.replace(/```html/gi, '').replace(/```/g, '');
        // Remove CV marker comments
        html = html.replace(/<!--\s*CV_START\s*-->/gi, '').replace(/<!--\s*CV_END\s*-->/gi, '');

        const printStyle = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Roboto:wght@300;400;500;700&display=swap');

                @page {
                    margin: 0;
                    size: A4;
                }

                *, *::before, *::after {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                html, body {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0;
                    padding: 0;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    font-family: 'Inter', 'Roboto', ui-sans-serif, system-ui, -apple-system, sans-serif;
                    font-size: 10pt;
                    line-height: 1.5;
                    color: #1a1a2e;
                    background: #ffffff;
                    overflow: hidden;
                }

                /* Ensure backgrounds render in print */
                div, section, aside, header, footer, nav, main, article {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }

                /* Icon fallback sizing */
                i, .fa, .ph, svg {
                    display: inline-block;
                    vertical-align: middle;
                }

                /* Prevent page breaks inside sections */
                section, .section, .experience-item, .education-item {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }

                /* Clean link styling for PDF */
                a {
                    color: inherit;
                    text-decoration: none;
                }

                /* Ensure images don't overflow */
                img {
                    max-width: 100%;
                    height: auto;
                }

                @media print {
                    html, body {
                        width: 210mm;
                        height: 297mm;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            </style>
        `;

        if (!html.toLowerCase().includes('<html')) {
            html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    ${printStyle}
                </head>
                <body>${html}</body>
                </html>
            `;
        } else {
            if (html.toLowerCase().includes('</head>')) {
                html = html.replace(/(<\/head>)/i, `${printStyle}$1`);
            } else if (html.toLowerCase().includes('<body')) {
                html = html.replace(/(<body)/i, `<head>${printStyle}</head>$1`);
            }
        }

        const browser = await getBrowser();
        context = await browser.newContext({
            viewport: { width: 794, height: 1123 }, // A4 at 96 DPI
        });
        page = await context.newPage();

        await page.setContent(html, { waitUntil: 'networkidle', timeout: 15000 });

        // Wait for fonts to load
        await page.evaluate(() => document.fonts?.ready).catch(() => {});
        // Small extra delay for any CDN resources (icons, fonts)
        await page.waitForTimeout(1000);

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', bottom: '0', left: '0', right: '0' },
            preferCSSPageSize: true
        });

        await page.close();
        await context.close();

        return pdfBuffer;
    } catch (error) {
        if (page) await page.close().catch(() => {});
        if (context) await context.close().catch(() => {});
        throw new Error(`PDF Generation failed: ${error.message}`);
    }
};

export const savePdfLocally = async (
    buffer,
    { folderName = 'generated', fileKey } = {}
) => {
    try {
        const resolvedKey =
            fileKey ||
            crypto.createHash('sha256').update(buffer).digest('hex');

        const hash = crypto
            .createHash('sha256')
            .update(resolvedKey)
            .digest('hex')
            .slice(0, 12);

        const fileName = `cv_${hash}.pdf`;
        const mediaPath = path.join(__dirname, '../../media', folderName);

        if (!fs.existsSync(mediaPath)) {
            fs.mkdirSync(mediaPath, { recursive: true });
        }

        const filePath = path.join(mediaPath, fileName);

        if (!fs.existsSync(filePath)) {
            await fs.promises.writeFile(filePath, buffer);
        }

        return {
            fileName,
            relativePath: `/media/${folderName}/${fileName}`
        };
    } catch (error) {
        throw new Error(`File Save failed: ${error.message}`);
    }
};
