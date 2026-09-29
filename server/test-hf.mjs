import "dotenv/config";
import axios from 'axios';
import fs from 'fs';

let prompt = "Create a photorealistic thumbnail for: \"test\"";

async function test() {
  try {
    const hfResponse = await axios.post(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        inputs: prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
          "Accept": "image/png"
        },
        responseType: "arraybuffer", // If there's an error, data will be an arraybuffer!
      }
    );

    console.log("Success! Received bytes:", hfResponse.data.byteLength || hfResponse.data.length);
  } catch (error) {
    console.error("Error occurred!");
    if (error.response) {
      console.error("Status:", error.response.status);
      try {
        const textResponse = Buffer.from(error.response.data).toString('utf-8');
        console.error("Error Data:", textResponse);
      } catch (e) {
        console.error("Failed to decode response data");
      }
    } else {
      console.error(error.message);
    }
  }
}

test();
