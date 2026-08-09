// Minimal, dependency-free Word (.docx) file writer.
// A .docx is a ZIP archive of XML parts; this writes the ZIP container itself
// (store/uncompressed entries, so no deflate implementation is needed) and
// the small set of XML parts Word requires, optionally embedding a signature
// PNG as an inline image. Runs entirely client-side, offline.

// ---------- ZIP (store method — uncompressed) ----------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

class ByteWriter {
  constructor() {
    this.chunks = [];
    this.length = 0;
  }
  bytes(arr) {
    this.chunks.push(arr);
    this.length += arr.length;
  }
  u16(n) {
    this.bytes(new Uint8Array([n & 0xff, (n >>> 8) & 0xff]));
  }
  u32(n) {
    this.bytes(new Uint8Array([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]));
  }
  utf8(str) {
    this.bytes(new TextEncoder().encode(str));
  }
  toUint8Array() {
    const out = new Uint8Array(this.length);
    let offset = 0;
    for (const c of this.chunks) {
      out.set(c, offset);
      offset += c.length;
    }
    return out;
  }
}

// entries: [{ name: 'word/document.xml', data: Uint8Array }, ...]
function buildZip(entries) {
  const DOS_TIME = 0;
  const DOS_DATE = (1 << 9) | (1 << 5) | 1; // 1980-01-01, harmless placeholder

  const fileWriter = new ByteWriter();
  const central = [];

  entries.forEach((entry) => {
    const nameBytes = new TextEncoder().encode(entry.name);
    const data = entry.data;
    const crc = crc32(data);
    const offset = fileWriter.length;

    fileWriter.u32(0x04034b50);
    fileWriter.u16(20);
    fileWriter.u16(0);
    fileWriter.u16(0);
    fileWriter.u16(DOS_TIME);
    fileWriter.u16(DOS_DATE);
    fileWriter.u32(crc);
    fileWriter.u32(data.length);
    fileWriter.u32(data.length);
    fileWriter.u16(nameBytes.length);
    fileWriter.u16(0);
    fileWriter.bytes(nameBytes);
    fileWriter.bytes(data);

    central.push({ nameBytes, crc, size: data.length, offset });
  });

  const centralWriter = new ByteWriter();
  central.forEach((c) => {
    centralWriter.u32(0x02014b50);
    centralWriter.u16(20);
    centralWriter.u16(20);
    centralWriter.u16(0);
    centralWriter.u16(0);
    centralWriter.u16(DOS_TIME);
    centralWriter.u16(DOS_DATE);
    centralWriter.u32(c.crc);
    centralWriter.u32(c.size);
    centralWriter.u32(c.size);
    centralWriter.u16(c.nameBytes.length);
    centralWriter.u16(0);
    centralWriter.u16(0);
    centralWriter.u16(0);
    centralWriter.u16(0);
    centralWriter.u32(0);
    centralWriter.u32(c.offset);
    centralWriter.bytes(c.nameBytes);
  });

  const endWriter = new ByteWriter();
  endWriter.u32(0x06054b50);
  endWriter.u16(0);
  endWriter.u16(0);
  endWriter.u16(entries.length);
  endWriter.u16(entries.length);
  endWriter.u32(centralWriter.length);
  endWriter.u32(fileWriter.length);
  endWriter.u16(0);

  const out = new ByteWriter();
  out.bytes(fileWriter.toUint8Array());
  out.bytes(centralWriter.toUint8Array());
  out.bytes(endWriter.toUint8Array());
  return out.toUint8Array();
}

// ---------- DOCX XML parts ----------

function escapeXml(str) {
  return String(str == null ? '' : str).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function pXml(runsXml, opts) {
  const pPr = opts && opts.center ? '<w:pPr><w:jc w:val="center"/></w:pPr>' : '';
  return `<w:p>${pPr}${runsXml}</w:p>`;
}

function runXml(text, opts) {
  opts = opts || {};
  const props = [];
  if (opts.bold) props.push('<w:b/>');
  if (opts.size) props.push(`<w:sz w:val="${opts.size}"/>`);
  if (opts.color) props.push(`<w:color w:val="${opts.color}"/>`);
  const rPr = props.length ? `<w:rPr>${props.join('')}</w:rPr>` : '';
  return `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
}

function titleParagraph(text) {
  return pXml(runXml(text, { bold: true, size: 32 }), { center: true });
}

function headingParagraph(text) {
  return pXml(runXml(text, { bold: true, size: 24, color: '2f6b4f' }));
}

function fieldParagraph(label, value) {
  return pXml(runXml(`${label}: `, { bold: true }) + runXml(value || '—'));
}

function plainParagraph(text) {
  return pXml(runXml(text));
}

function spacerParagraph() {
  return '<w:p/>';
}

function imageParagraph(cx, cy) {
  return `<w:p><w:r><w:drawing>
    <wp:inline distT="0" distB="0" distL="0" distR="0"
      xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
      <wp:extent cx="${cx}" cy="${cy}"/>
      <wp:docPr id="1" name="Signature"/>
      <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
        <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
          <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:nvPicPr><pic:cNvPr id="0" name="Signature"/><pic:cNvPicPr/></pic:nvPicPr>
            <pic:blipFill>
              <a:blip r:embed="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
              <a:stretch><a:fillRect/></a:stretch>
            </pic:blipFill>
            <pic:spPr>
              <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
              <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            </pic:spPr>
          </pic:pic>
        </a:graphicData>
      </a:graphic>
    </wp:inline>
  </w:drawing></w:r></w:p>`;
}

function documentXml(bodyParagraphsXml) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${bodyParagraphsXml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function contentTypesXml(hasImage) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  ${hasImage ? '<Default Extension="png" ContentType="image/png"/>' : ''}
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;
}

function packageRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
}

function documentRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
</Relationships>`;
}

function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Builds a .docx as a Blob.
// options: { title, meta: [[label,value]], fields: [[label,value]],
//   signature: { dataUrl, width, height, participantName, providerName, date } | null }
function buildDocxBlob(options) {
  const paragraphs = [];
  paragraphs.push(titleParagraph(options.title));
  paragraphs.push(spacerParagraph());
  (options.meta || []).forEach(([label, value]) => paragraphs.push(fieldParagraph(label, value)));
  paragraphs.push(spacerParagraph());
  (options.fields || []).forEach(([label, value]) => paragraphs.push(fieldParagraph(label, value)));

  let imageBytes = null;
  if (options.signature) {
    paragraphs.push(spacerParagraph());
    paragraphs.push(headingParagraph('Signature'));
    if (options.signature.dataUrl) {
      imageBytes = dataUrlToBytes(options.signature.dataUrl);
      const cx = 2286000; // 2.5in, fixed display width in EMU
      const cy = Math.round(cx * ((options.signature.height || 1) / (options.signature.width || 3)));
      paragraphs.push(imageParagraph(cx, cy));
      paragraphs.push(plainParagraph(`Signed by ${options.signature.participantName || 'participant'} on ${options.signature.date || ''}`));
    } else {
      paragraphs.push(plainParagraph('Participant signature: _______________________________'));
      paragraphs.push(plainParagraph('Date: ____________________'));
    }
    paragraphs.push(spacerParagraph());
    paragraphs.push(plainParagraph(`Provider signature: ${options.signature.providerName || ''}`));
    paragraphs.push(plainParagraph(`Date: ${options.signature.date || ''}`));
  }

  const docXml = documentXml(paragraphs.join(''));
  const hasImage = !!imageBytes;

  const entries = [
    { name: '[Content_Types].xml', data: new TextEncoder().encode(contentTypesXml(hasImage)) },
    { name: '_rels/.rels', data: new TextEncoder().encode(packageRelsXml()) },
    { name: 'word/document.xml', data: new TextEncoder().encode(docXml) },
  ];
  if (hasImage) {
    entries.push({ name: 'word/_rels/document.xml.rels', data: new TextEncoder().encode(documentRelsXml()) });
    entries.push({ name: 'word/media/image1.png', data: imageBytes });
  }

  const zipBytes = buildZip(entries);
  return new Blob([zipBytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}
