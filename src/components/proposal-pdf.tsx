"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

function htmlToPlainText(input: string): string {
  return input
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 20, marginBottom: 16, fontFamily: "Helvetica-Bold" },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 13, marginBottom: 6, fontFamily: "Helvetica-Bold" },
  body: { lineHeight: 1.5, color: "#333" },
  pricing: { marginTop: 20 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ddd", paddingVertical: 4 },
  cell: { flex: 1 },
  totals: { marginTop: 8, alignSelf: "flex-end", width: 200 },
});

export type ProposalPdfPayload = {
  title: string;
  sections: {
    sectionTitle: string;
    body: string;
    bodyFields?: string[];
    blockVisualTemplate?: { html: string; css: string; js: string } | null;
  }[];
  lineItems: { label: string; quantity: number; unitPrice: number }[];
  discountPercent: number;
  embeds: { label: string | null; url: string; kind: string }[];
};

function ProposalDoc({ data }: { data: ProposalPdfPayload }) {
  const subtotal = data.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
  const discount = subtotal * (Math.min(100, Math.max(0, data.discountPercent)) / 100);
  const total = Math.max(0, subtotal - discount);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{data.title}</Text>
        {data.sections.map((sec, i) => (
          <View key={i} style={styles.section} wrap>
            <Text style={styles.sectionTitle}>{sec.sectionTitle}</Text>
            <Text style={styles.body}>{htmlToPlainText(sec.body)}</Text>
          </View>
        ))}
        {data.lineItems.length > 0 ? (
          <View style={styles.pricing}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <View style={styles.row}>
              <Text style={styles.cell}>Item</Text>
              <Text style={styles.cell}>Qty</Text>
              <Text style={styles.cell}>Unit</Text>
              <Text style={styles.cell}>Line</Text>
            </View>
            {data.lineItems.map((li, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.cell}>{li.label}</Text>
                <Text style={styles.cell}>{String(li.quantity)}</Text>
                <Text style={styles.cell}>{li.unitPrice.toFixed(2)}</Text>
                <Text style={styles.cell}>{(li.quantity * li.unitPrice).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.totals}>
              <Text>Subtotal: {subtotal.toFixed(2)}</Text>
              <Text>Discount ({data.discountPercent}%): -{discount.toFixed(2)}</Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>Total: {total.toFixed(2)}</Text>
            </View>
          </View>
        ) : null}
        {data.embeds.length > 0 ? (
          <View style={[styles.section, { marginTop: 16 }]}>
            <Text style={styles.sectionTitle}>Links & media</Text>
            {data.embeds.map((e, i) => (
              <Text key={i} style={styles.body}>
                {(e.label ?? e.kind) + ": " + e.url}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export function ProposalPdfDownload({
  data,
  label,
  ariaLabel,
}: {
  data: ProposalPdfPayload;
  label?: React.ReactNode;
  ariaLabel?: string;
}) {
  const safeName = data.title.replace(/[^\w\-]+/g, "_").slice(0, 80) || "proposal";
  return (
    <PDFDownloadLink document={<ProposalDoc data={data} />} fileName={`${safeName}.pdf`}>
      {({ loading }) =>
        loading ? (
          "Preparing PDF…"
        ) : (
          <span aria-label={ariaLabel ?? "Download PDF"}>
            {label ?? "Download PDF"}
          </span>
        )
      }
    </PDFDownloadLink>
  );
}
