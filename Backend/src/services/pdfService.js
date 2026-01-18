import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import he from 'he';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePdfFromHtml = async (htmlContent) => {
    let browser = null;
    try {
        let html = he.decode(htmlContent);
        html = html.replace(/^```[a-z]*\s*/gi, '').replace(/\s*```$/gi, '');
        html = html.replace(/```html/gi, '').replace(/```/g, ''); 

        const printStyle = `
            <style>
                @page { margin: 0; size: A4; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; }
                * { box-sizing: border-box; }
            </style>
        `;

        if (!html.toLowerCase().includes('<html')) {
            html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    ${printStyle}
                </head>
                <body>
                    ${html}
                </body>
                </html>
            `;
        } else {
             if (html.toLowerCase().includes('</head>')) {
                html = html.replace('</head>', `${printStyle}</head>`);
            } else {
                html = html.replace('<body', `<head>${printStyle}</head><body`);
            }
        }

        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        
        await page.setContent(html, { waitUntil: 'networkidle' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', bottom: '0', left: '0', right: '0' },
            preferCSSPageSize: true
        });

        await browser.close();
        browser = null;

        return pdfBuffer;

    } catch (error) {
        if (browser) await browser.close();
        throw new Error(`PDF Generation failed: ${error.message}`);
    }
};

export const savePdfLocally = async (buffer, folderName = 'generated') => {
    try {
        const fileName = `cv_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
        const mediaPath = path.join(__dirname, '../../media', folderName);
        
        if (!fs.existsSync(mediaPath)) {
            fs.mkdirSync(mediaPath, { recursive: true });
        }

        const filePath = path.join(mediaPath, fileName);
        
        await fs.promises.writeFile(filePath, buffer);
        
        return {
            fileName,
            relativePath: `/media/${folderName}/${fileName}`
        };
    } catch (error) {
        throw new Error(`File Save failed: ${error.message}`);
    }
};
