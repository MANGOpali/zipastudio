import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return Response.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    const uploaded = await cloudinary.uploader.upload(imageUrl, {
      folder: "imageforge",
      resource_type: "image",
    });

    if (!uploaded?.public_id) {
      return Response.json({ error: "Upload failed" }, { status: 500 });
    }

    const resultUrl = cloudinary.url(uploaded.public_id, {
      transformation: [
        {
          width: 2000,
          height: 2000,
          crop: "pad",
          background: "white",
          gravity: "center",
        },
        {
          format: "png",
        },
      ],
      secure: true,
    });

    return Response.json({ resultUrl });
  } catch (err: any) {
    console.error("Cloudinary error:", err?.message || err);
    return Response.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}