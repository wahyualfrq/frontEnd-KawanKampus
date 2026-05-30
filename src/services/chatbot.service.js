import api from './api';

/**
 * Frontend chatbot service.
 * All calls go to the backend only — never directly to Cloud Run or AI_API_URL.
 *
 * Architecture:
 *   sendTaskHelpMessage       → POST /api/v1/chatbot                   (AI_API_URL task mode)
 *   getChatbotPlaceRecommendation → POST /api/v1/chatbot/place-recommendation (AI_API_URL recommendation_proximity)
 *
 * PLACE_RECOMMENDER_API_URL is NOT used by Chatbot — that is reserved for the Places/Map page only.
 */

/**
 * Send a task-help message to the chatbot AI.
 * @param {string} message
 * @param {string} [sessionId]
 */
export async function sendTaskHelpMessage(message, sessionId) {
  const response = await api.post('/chatbot', {
    message,
    ...(sessionId && { session_id: sessionId }),
  });
  return response.data;
}

/**
 * Get place recommendations via the Chatbot AI service.
 * Uses AI_API_URL (chatbot service) with special_action=recommendation_proximity.
 * NOT related to PLACE_RECOMMENDER_API_URL.
 *
 * @param {{ selected_uni: string, selected_cat: string, lat: number, lon: number, session_id?: string }} payload
 * @returns {{ success: boolean, data: { reply: string|null, recommendations: Array } }}
 */
export async function getChatbotPlaceRecommendation({ selected_uni, selected_cat, lat, lon, session_id }) {
  const response = await api.post('/chatbot/place-recommendation', {
    selected_uni,
    selected_cat,
    lat,
    lon,
    ...(session_id && { session_id }),
  });
  return response.data;
}

const chatbotService = {
  sendTaskHelpMessage,
  getChatbotPlaceRecommendation,
};

export default chatbotService;
