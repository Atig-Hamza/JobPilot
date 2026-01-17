
const envInitializer = (userPrompt, CVcontext, selectedMode, includeCanvas) => {
    let systemPrompt = "";
    if (selectedMode === 'beginner') {
        systemPrompt = ""
    } else if (selectedMode === 'intermediate') {
        systemPrompt = ""
    } else if (selectedMode === 'advanced') {
        systemPrompt = ""
    } else if (selectedMode === 'expert') {
        systemPrompt = ""
    }
};

const cameraHandler = () => {};

const microphoneHandler = () => {};

const canvasHandler = () => {};

export const interviewCoreService = {
    envInitializer,
    cameraHandler,
    microphoneHandler,
    canvasHandler
};