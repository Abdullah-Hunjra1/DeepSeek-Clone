// import { Webhook } from "svix";
// import connectDB from "@/config/db";
// import User from "@/models/User";
// import _default from "next/dist/build/templates/pages";
// import { headers } from "next/headers";
// import { NextRequest } from "next/server";


// export default async function POST(req) {
//     const wh = new Webhook(process.env.SIGNING_SECRET)
//     const headerPayLoad = await headers()
//     const svixHeaders = {
//         "svix-id": headerPayLoad.get("svix-id"),
//         "svix-signature": headerPayLoad.get("svix-signature"),
//     }

//     // Get the Payload and verify it

//     const payload = await req.json()
//     const body = JSON.stringify(payload)
//     const { data, type } = wh.verify(body, svixHeaders)

//     //Prepare the user data to be saved in the database

//     const userData = {
//         _id: data._id,
//         email: data.email_addresses[0].email_addresses,
//         name: `${data.first_name} ${data.last_name}`,
//         image: data.image_url,
//     }

//     await connectDB()

//     switch (type) {
//         case 'user.created':
//             await User.create(userData)
//             break;

//         case 'user.updated':
//             await User.findByIdAndUpdate(data.id, userData)
//             break;

//         case 'user.deleted':
//             await User.findByIdAndDelete(data.id, userData)
//             break;

//         default:
//             break;
//     }

//     return NextRequest.json({ message: "Event Recieved" })
// }







import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    const wh = new Webhook(process.env.SIGNING_SECRET);
    const headerPayload = headers();

    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id"),
      "svix-signature": headerPayload.get("svix-signature"),
    };

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const { data, type } = wh.verify(body, svixHeaders);

    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      name: `${data.first_name} ${data.last_name}`,
      image: data.image_url,
    };

    await connectDB();

    switch (type) {
      case "user.created":
        await User.create(userData);
        break;
      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;
      default:
        break;
    }

    return NextResponse.json({ message: "Event received" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: "Webhook handling failed", error: error.message },
      { status: 500 }
    );
  }
}
