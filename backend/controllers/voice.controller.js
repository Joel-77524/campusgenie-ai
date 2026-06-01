const axios = require('axios');

// Vapi API base URL
const VAPI_BASE_URL = 'https://api.vapi.ai';

// @desc    Initiate an AI voice counseling call via Vapi
// @route   POST /api/voice/call
// @access  Private
const initiateCall = async (req, res, next) => {
  try {
    const { name, phoneNumber, interestedCourse } = req.body;

    if (!name || !phoneNumber || !interestedCourse) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number, and interested course are required',
      });
    }

    // Validate phone number format (E.164 format: +91XXXXXXXXXX)
    const phoneRegex = /^\+[1-9]\d{7,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be in E.164 format (e.g., +919876543210)',
      });
    }

    // Check Vapi credentials
    if (!process.env.VAPI_API_KEY || !process.env.VAPI_PHONE_NUMBER_ID) {
      return res.status(503).json({
        success: false,
        message: 'Voice calling service is not configured. Please contact support.',
      });
    }

    // Build Vapi call payload
    const callPayload = {
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      customer: {
        number: phoneNumber,
        name: name,
      },
      // Use existing assistant or inline assistant config
      ...(process.env.VAPI_ASSISTANT_ID
        ? { assistantId: process.env.VAPI_ASSISTANT_ID }
        : {
            assistant: {
              name: 'AIT Counselor',
              firstMessage: `Hello ${name}! This is Aria, your personal admission counselor from Apex Institute of Technology. I understand you're interested in ${interestedCourse}. I'd love to tell you more about our program and how we can help you achieve your goals. Do you have a few minutes to chat?`,
              model: {
                provider: 'google',
                model: 'gemini-2.5-flash',
                messages: [
                  {
                    role: 'system',
                    content: `You are Aria, a warm and knowledgeable admission counselor at Apex Institute of Technology (AIT), Bangalore. You are speaking with ${name} who is interested in ${interestedCourse}.

Your goals:
1. Warmly introduce yourself and the college
2. Ask about their academic background and interests
3. Explain the ${interestedCourse} program highlights (curriculum, labs, industry exposure)
4. Share placement statistics (95% placement, avg package ₹8 LPA, companies: TCS, Infosys, Wipro, Amazon, Google)
5. Mention scholarship opportunities (merit-based up to 50% fee waiver)
6. Explain the admission process (apply online at www.ait.edu.in, entrance exam/merit-based)
7. Answer any questions they have
8. Encourage them to visit campus or apply online

Key college facts:
- Fee: ₹1,20,000/year (BTech), ₹80,000/year (BSc/BCA)
- Hostel: Available at ₹60,000/year
- Scholarship: Up to 50% for merit students
- Accreditation: NAAC A+, NBA Accredited
- Location: Bangalore (Silicon Valley of India)
- Admission: Apply at www.ait.edu.in

Keep the conversation natural, friendly, and under 5 minutes. Speak clearly and professionally.`,
                  },
                ],
              },
              voice: {
                provider: 'playht',
                voiceId: 'jennifer',
              },
              transcriber: {
                provider: 'deepgram',
                model: 'nova-2',
                language: 'en',
              },
            },
          }),
    };

    // Make Vapi API call
    const vapiResponse = await axios.post(
      `${VAPI_BASE_URL}/call`,
      callPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    res.status(200).json({
      success: true,
      message: `Call initiated to ${phoneNumber}. Aria will call you shortly!`,
      data: {
        callId: vapiResponse.data.id,
        status: vapiResponse.data.status,
        phoneNumber,
        name,
        interestedCourse,
      },
    });
  } catch (error) {
    // Handle Vapi API errors
    if (error.response) {
      const vapiError = error.response.data;
      console.error('Vapi API error:', vapiError);
      return res.status(error.response.status).json({
        success: false,
        message: vapiError.message || 'Failed to initiate call. Please try again.',
      });
    }
    next(error);
  }
};

// @desc    Get call status from Vapi
// @route   GET /api/voice/call/:callId
// @access  Private
const getCallStatus = async (req, res, next) => {
  try {
    const { callId } = req.params;

    const response = await axios.get(`${VAPI_BASE_URL}/call/${callId}`, {
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        callId: response.data.id,
        status: response.data.status,
        duration: response.data.duration,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { initiateCall, getCallStatus };
