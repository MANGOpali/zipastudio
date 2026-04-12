import { NextRequest } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const prompt = `
Edit this product image for e-commerce use.

Rules:
- Remove the background completely and replace with pure white (#FFFFFF)
- Keep the exact same product
- No color change
- No brightness shift
- No logo change
- No text change
- No stitching change
- No design change
- Keep the exact same zipper, sleeves, pockets, proportions, and length
- Straighten the garment so it looks aligned and neat
- Reduce minor wrinkles carefully only if it does not alter the product
- Do not remove natural folds that define the product shape
- Center the product
- Square composition
- Clean, realistic product photo
    `.trim();

    const result = await client.images.edit({
      model: "gpt-image-1",
      image: new File([buffer], file.name || "product.png", {
        type: file.type || "image/png",
      }),
      prompt,
    });

    const base64 = result.data?.[0]?.b64_json;

    if (!base64) {
      return Response.json(
        { error: "No edited image returned" },
        { status: 500 }
      );
    }

    return Response.json({
      resultUrl: `data:image/png;base64,${base64}`,
    });
  } catch (error: any) {
    console.error("OpenAI edit error:", error);

    return Response.json(
      {
        error: error?.error?.message || error?.message || "OpenAI image edit failed",
        code: error?.code || null,
        type: error?.type || null,
      },
      { status: error?.status || 500 }
    );
  }
}