import api from "./api";

// Analyze video mood segments (triggers AI analysis)
export const analyzeVideoMood = async (videoId) => {
    const { data } = await api.post(`/ai/analyze/${videoId}`);
    return data;
};

// Get mood segments for seekbar
export const getVideoMoodSegments = async (videoId) => {
    const { data } = await api.get(`/ai/mood/${videoId}`);
    return data;
};

// Translate video to another language
export const translateVideo = async (videoId, targetLanguage) => {
    const { data } = await api.post(`/ai/translate/${videoId}`, { targetLanguage });
    return data;
};

// Get all translations for a video
export const getVideoTranslations = async (videoId) => {
    const { data } = await api.get(`/ai/translations/${videoId}`);
    return data;
};

// Get full video analysis
export const getVideoAnalysis = async (videoId) => {
    const { data } = await api.get(`/ai/analysis/${videoId}`);
    return data;
};

export default {
    analyzeVideoMood,
    getVideoMoodSegments,
    translateVideo,
    getVideoTranslations,
    getVideoAnalysis
};
