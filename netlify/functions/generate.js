const { GoogleGenerativeAI } = require("@google/generative-ai");

// هذا هو المكان الذي سيقرأ فيه الكود مفتاحك السري بأمان من إعدادات Netlify
// لا تكتب المفتاح هنا أبداً
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.handler = async function (event, context) {
    // التأكد من أن الطلب هو POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { image, mimeType } = JSON.parse(event.body);

        if (!image || !mimeType) {
            return { statusCode: 400, body: "Missing image or mimeType" };
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

        const prompt = `
            أنت خبير في كتابة الإعلانات للعطور الفاخرة.
            انظر إلى صورة زجاجة العطر هذه.
            اكتب وصفاً إعلانياً جذاباً ومثيراً لهذا العطر بناءً على شكل الزجاجة والألوان والإيحاءات التي تظهر في الصورة.
            اجعل الوصف قصيراً، قوياً، ويثير الفضول.
        `;

        const imagePart = {
            inlineData: {
                data: image,
                mimeType: mimeType,
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text }),
        };

    } catch (error) {
        console.error("Error calling Google AI API:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to generate content" }),
        };
    }
};