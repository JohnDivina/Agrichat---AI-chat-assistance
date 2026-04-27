const CLASS_OPENAI_ENDPOINT = 'https://is215-openai.upou.io/v1/chat/completions';
const CLASS_OPENAI_MODEL = 'gpt-4o-mini';
const MAX_MESSAGE_LENGTH = 500;

const SYSTEM_PROMPT = 'You are AgriAssist AI, a helpful assistant for smart greenhouse and IoT-based farming. Explain answers in simple and practical language. Focus on greenhouse monitoring, sensors, irrigation, temperature, humidity, light, soil moisture, NPK sensors, and basic crop care. If the question involves safety, chemicals, electrical wiring, or serious crop disease, remind the user to verify with an expert.';

function sendJson(res, statusCode, payload) {
    res.status(statusCode).json(payload);
}

function getApiErrorMessage(data) {
    if (data && typeof data === 'object') {
        if (data.error && typeof data.error.message === 'string') {
            return data.error.message;
        }

        if (typeof data.message === 'string') {
            return data.message;
        }
    }

    return '';
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return sendJson(res, 405, {
            success: false,
            error: 'Only POST requests are allowed.'
        });
    }

    const apiKey = process.env.CLASS_OPENAI_API_KEY;

    if (!apiKey) {
        return sendJson(res, 500, {
            success: false,
            error: 'Missing CLASS_OPENAI_API_KEY environment variable.'
        });
    }

    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

    if (message === '') {
        return sendJson(res, 400, {
            success: false,
            error: 'Please enter a question before sending.'
        });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
        return sendJson(res, 400, {
            success: false,
            error: 'Please keep your question under 500 characters.'
        });
    }

    try {
        const apiResponse = await fetch(CLASS_OPENAI_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: CLASS_OPENAI_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.5,
                max_tokens: 300
            })
        });

        const data = await apiResponse.json().catch(() => null);
        const apiError = getApiErrorMessage(data);

        if (!apiResponse.ok || apiError !== '') {
            let messageText = apiError || 'The class AI service returned an error.';

            if (messageText.toLowerCase().includes('wow, you have exceeded your allocation for today')) {
                messageText = 'Wow, you have exceeded your allocation for today. Please try again later or ask your instructor if you need more access.';
            }

            return sendJson(res, apiResponse.ok ? 502 : apiResponse.status, {
                success: false,
                error: messageText
            });
        }

        const reply = typeof data?.choices?.[0]?.message?.content === 'string'
            ? data.choices[0].message.content.trim()
            : '';

        if (reply === '') {
            return sendJson(res, 502, {
                success: false,
                error: 'The class AI service did not return a reply.'
            });
        }

        return sendJson(res, 200, {
            success: true,
            reply
        });
    } catch (error) {
        return sendJson(res, 502, {
            success: false,
            error: 'Could not connect to the class AI service.'
        });
    }
}
