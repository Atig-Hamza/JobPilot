import catchAsync from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { generatePdfFromHtml, savePdfLocally } from '../services/pdfService.js';

export const generatePDF = catchAsync(async (req, res, next) => {
    let { html } = req.body;

    if (!html) {
        return next(new AppError('No HTML content provided', 400));
    }

    try {
        const pdfBuffer = await generatePdfFromHtml(html);
        const savedFile = await savePdfLocally(pdfBuffer, 'generated');

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}${savedFile.relativePath}`;

        res.status(200).json({
            status: 'success',
            data: {
                url: fileUrl,
                fileName: savedFile.fileName
            }
        });

    } catch (err) {
        console.error('PDF Controller Error:', err);
        return next(new AppError(err.message, 500));
    }
});
