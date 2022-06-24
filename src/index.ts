import { PDFNet } from "@pdftron/pdfnet-node"

async function main() {
    const doc = await PDFNet.PDFDoc.createFromFilePath("/Users/rsaffer/Downloads/Application Checklist - Ryan.pdf")
    console.log(doc)
    const txtSearch = await PDFNet.TextSearch.create();
    let mode = PDFNet.TextSearch.Mode.e_whole_word + PDFNet.TextSearch.Mode.e_page_stop; // Uses both whole word and page stop
    let pattern = 'Saffer';

    //use regular expression to find credit card number
    mode += PDFNet.TextSearch.Mode.e_whole_word;
    txtSearch.setMode(mode);

    //call Begin() method to initialize the text search.
    txtSearch.begin(doc, pattern, mode);
    const result = await txtSearch.run();

    console.log(result)

    if (result.code === PDFNet.TextSearch.ResultCode.e_found) {
        // add a link annotation based on the location of the found instance
        let hlts = result.highlights;
        await hlts.begin(doc); // is await needed?
        while (await hlts.hasNext()) {
            const curPage = await doc.getPage(await hlts.getCurrentPageNumber());
            const quadArr = await hlts.getCurrentQuads();
            console.log(quadArr)
            for (let i = 0; i < quadArr.length; ++i) {
                const currQuad = quadArr[i];
                const x1 = Math.min(Math.min(Math.min(currQuad.p1x, currQuad.p2x), currQuad.p3x), currQuad.p4x);
                const x2 = Math.max(Math.max(Math.max(currQuad.p1x, currQuad.p2x), currQuad.p3x), currQuad.p4x);
                const y1 = Math.min(Math.min(Math.min(currQuad.p1y, currQuad.p2y), currQuad.p3y), currQuad.p4y);
                const y2 = Math.max(Math.max(Math.max(currQuad.p1y, currQuad.p2y), currQuad.p3y), currQuad.p4y);

                const hyperLink = await PDFNet.LinkAnnot.create(doc, await PDFNet.Rect.init(x1, y1, x2, y2));
                await hyperLink.setAction(await PDFNet.Action.createURI(doc, 'http://www.pdftron.com'));
                await curPage.annotPushBack(hyperLink);
            }
            hlts.next();
        }
    }
}

// add your own license key as the second parameter, e.g. in place of 'YOUR_LICENSE_KEY'.
PDFNet.runWithCleanup(main, 'LICENSE_KEY').catch(function(error) {
  console.log('Error: ' + JSON.stringify(error));
}).then(function(){ PDFNet.shutdown(); });