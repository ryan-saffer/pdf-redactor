import "dotenv/config"
import { PDFNet } from "@pdftron/pdfnet-node"
import fs from 'fs'
import csv from 'csv-parser'

// YOU CAN CHANGE BELOW DIRECTORY LOCATION
const PDFS_DIRECTORY = "./data/pdfs/"

let terms: string[] = []
let files: string[] = []

fs.createReadStream('./data/data.csv')
    .pipe(csv())
    .on('data', (row) => {
        terms.push(row['term'])
    })
    .on('end', async () => {
        console.log('CSV file successfully processed');
    });

fs.readdirSync(PDFS_DIRECTORY).forEach(file => {
    files.push(file)
})

async function main() {
    for(const file of files) {
        await performRedaction(file)
    }
}

async function performRedaction(file: string) {

    const doc = await PDFNet.PDFDoc.createFromFilePath(`${PDFS_DIRECTORY}/${file}`)

    let rarr: PDFNet.Redaction[] = []

    for(const pattern of terms) {
        const redactions = await redact(pattern, doc)
        rarr = [ ...rarr, ...redactions ]
    }

    const black = await PDFNet.ColorPt.init(0,0,0,0)

    const app = {
        redaction_overlay: true,
        border: false,
        show_redacted_content_regions: true,
        positive_overlay_color: black
    }

    PDFNet.Redactor.redact(doc, rarr, app, false, false);
    file = file.replace('.pdf', '')
    await doc.save(`output/${file}-redacted.pdf`, PDFNet.SDFDoc.SaveOptions.e_linearized);
}

/**
 * Given a PDFNet.Doc, will return an array of redactions for all occurences of the pattern.
 * 
 * @param pattern 
 * @param doc 
 * @returns 
 */
async function redact(pattern: string, doc: PDFNet.PDFDoc) {
    const txtSearch = await PDFNet.TextSearch.create();
    let mode = PDFNet.TextSearch.Mode.e_whole_word; // Uses both whole word and page stop
    mode += PDFNet.TextSearch.Mode.e_whole_word + PDFNet.TextSearch.Mode.e_highlight;
    txtSearch.setMode(mode);
    txtSearch.begin(doc, pattern, mode);
    let output = []
    while(true) {
        const result = await txtSearch.run();

        if (result.code === PDFNet.TextSearch.ResultCode.e_found) {
            // add a link annotation based on the location of the found instance
            let hlts = result.highlights;
            await hlts.begin(doc); // is await needed?
            while (await hlts.hasNext()) {
                const quadArr = await hlts.getCurrentQuads();
                for (let i = 0; i < quadArr.length; ++i) {
                    const currQuad = quadArr[i];
                    const x1 = Math.min(Math.min(Math.min(currQuad.p1x, currQuad.p2x), currQuad.p3x), currQuad.p4x);
                    const x2 = Math.max(Math.max(Math.max(currQuad.p1x, currQuad.p2x), currQuad.p3x), currQuad.p4x);
                    const y1 = Math.min(Math.min(Math.min(currQuad.p1y, currQuad.p2y), currQuad.p3y), currQuad.p4y);
                    const y2 = Math.max(Math.max(Math.max(currQuad.p1y, currQuad.p2y), currQuad.p3y), currQuad.p4y);

                    output.push(await PDFNet.Redactor.redactionCreate(await hlts.getCurrentPageNumber(), await PDFNet.Rect.init(x1, y1, x2, y2), false, ''))
                }
                hlts.next();
            }
        } else {
            return output
        }
    }
}

// add your own license key as the second parameter, e.g. in place of 'YOUR_LICENSE_KEY'.
PDFNet.runWithCleanup(main, process.env.PDF_TRON_KEY).catch(function(error) {
  console.log('Error: ' + JSON.stringify(error));
}).then(function(){ PDFNet.shutdown(); });